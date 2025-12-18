import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateProyeccionDto } from './dto/create-proyeccion.dto';
import { UpdateProyeccionDto } from './dto/update-proyeccion.dto';
import { Proyeccion } from './entities/proyeccion.entity';
import { ProyeccionSemanal } from 'src/proyeccion-semanal/entities/proyeccion-semanal.entity';
import { ProyectoProducto } from 'src/proyecto-producto/entities/proyecto-producto.entity';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { ProductoClientService } from 'src/common/services/producto-client.service';
import { getWeekNumber, getNextMonday, formatDateLocal, addDays } from 'src/common/utils/date.utils';

@Injectable()
export class ProyeccionService {
  constructor(
    @InjectRepository(Proyeccion)
    private readonly proyeccionRepository: Repository<Proyeccion>,
    @InjectRepository(ProyeccionSemanal)
    private readonly proyeccionSemanalRepository: Repository<ProyeccionSemanal>,
    @InjectRepository(ProyectoProducto)
    private readonly proyectoProductoRepository: Repository<ProyectoProducto>,
    private readonly productoClientService: ProductoClientService,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Crea una nueva proyección con sus proyecciones semanales
   * 
   * Algoritmo:
   * 1. Valida que no exista proyección para ese proyecto-producto y tipo
   * 2. Obtiene datos del ProyectoProducto (proyecto, producto, cantidad)
   * 3. Obtiene unidad de medida del producto (desde dispatch-ms)
   * 4. Calcula metrado por piso
   * 5. Genera proyecciones semanales (siempre lunes)
   * 6. Actualiza fechaFin con la última semana
   * 7. Guarda todo en transacción
   */
  async create(createProyeccionDto: CreateProyeccionDto): Promise<Proyeccion> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar unicidad: solo una proyección por proyecto-producto y tipo
      const existente = await this.proyeccionRepository
        .createQueryBuilder('proyeccion')
        .where('proyeccion.id_proyecto_producto = :idProyectoProducto', {
          idProyectoProducto: createProyeccionDto.idProyectoProducto
        })
        .andWhere('proyeccion.tipo_proyeccion = :tipoProyeccion', {
          tipoProyeccion: createProyeccionDto.tipoProyeccion
        })
        .getOne();

      if (existente) {
        throw new RpcException({
          message: `Ya existe una proyección de tipo ${createProyeccionDto.tipoProyeccion} para este proyecto-producto`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      // 2. Obtener ProyectoProducto para validar
      const proyectoProducto = await this.proyectoProductoRepository.findOne({
        where: { idProyectoProducto: createProyeccionDto.idProyectoProducto }
      });

      if (!proyectoProducto) {
        throw new RpcException({
          message: 'ProyectoProducto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      // 3. Usar datos del DTO (enviados desde frontend)
      const pisos = createProyeccionDto.pisos;
      const sotanos = createProyeccionDto.sotanos;
      const fechaInicio = new Date(createProyeccionDto.fechaInicio);
      const total = createProyeccionDto.total;
      const unidad = createProyeccionDto.unidadMedida;

      // Validar que haya al menos un piso o sótano (permitir 0 si es necesario)
      if (pisos + sotanos === 0) {
        // Si no hay pisos ni sótanos, crear proyección simple sin distribución semanal
        const proyeccion = queryRunner.manager.create(Proyeccion, {
          fechaInicio: fechaInicio,
          fechaFin: fechaInicio,
          tipoProyeccion: createProyeccionDto.tipoProyeccion,
          estado: createProyeccionDto.estado,
          metradoPiso: 0,
          pisos,
          sotanos,
          pisosSemana: createProyeccionDto.pisosSemana,
          total,
          idProyectoProducto: proyectoProducto
        });

        const proyeccionGuardada = await queryRunner.manager.save(Proyeccion, proyeccion);
        await queryRunner.commitTransaction();
        await queryRunner.release();

        return await this.findOne(proyeccionGuardada.idProyeccion);
      }

      // 4. Calcular metrado por piso
      // Formula: total / ((pisos + sotanos) / pisosSemana)
      const metradoPiso = total / ((pisos + sotanos) / createProyeccionDto.pisosSemana);

      // 5. Calcular número de semanas
      const numeroSemanas = Math.ceil((pisos + sotanos) / createProyeccionDto.pisosSemana);

      // 6. Crear la proyección (sin fechaFin aún, se actualiza después)
      const proyeccion = queryRunner.manager.create(Proyeccion, {
        fechaInicio: fechaInicio,
        fechaFin: fechaInicio, // Temporal, se actualiza después
        tipoProyeccion: createProyeccionDto.tipoProyeccion,
        estado: createProyeccionDto.estado,
        metradoPiso: parseFloat(metradoPiso.toFixed(2)),
        pisos,
        sotanos,
        pisosSemana: createProyeccionDto.pisosSemana,
        total,
        idProyectoProducto: proyectoProducto
      });

      const proyeccionGuardada = await queryRunner.manager.save(Proyeccion, proyeccion);

      // 7. Generar proyecciones semanales
      // Siempre empiezan en lunes
      let fechaSemana = getNextMonday(fechaInicio);
      const proyeccionesSemanales: ProyeccionSemanal[] = [];

      for (let i = 0; i < numeroSemanas; i++) {
        const numeroSemana = getWeekNumber(fechaSemana);

        const proyeccionSemanal = queryRunner.manager.create(ProyeccionSemanal, {
          numeroSemana: numeroSemana.toString(),
          fecha: new Date(fechaSemana),
          cantidad: parseFloat(metradoPiso.toFixed(2)),
          unidad: unidad,
          idProyeccion: proyeccionGuardada
        });

        proyeccionesSemanales.push(proyeccionSemanal);

        // Avanzar a la siguiente semana (7 días)
        fechaSemana = addDays(fechaSemana, 7);
      }

      await queryRunner.manager.save(ProyeccionSemanal, proyeccionesSemanales);

      // 8. Actualizar fechaFin con la fecha de la última semana
      const ultimaSemana = proyeccionesSemanales[proyeccionesSemanales.length - 1];
      proyeccionGuardada.fechaFin = ultimaSemana.fecha;
      await queryRunner.manager.save(Proyeccion, proyeccionGuardada);

      await queryRunner.commitTransaction();

      // Retornar con relaciones cargadas
      return await this.findOne(proyeccionGuardada.idProyeccion);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Si ya es una RpcException, relanzarla
      if (error instanceof RpcException) {
        throw error;
      }

      // Sino, envolver en RpcException
      throw new RpcException({
        message: `Error al crear la proyección: ${error.message}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene todas las proyecciones con sus relaciones
   */
  async findAll(): Promise<Proyeccion[]> {
    return await this.proyeccionRepository.find({
      relations: ['idProyectoProducto', 'proyeccionesSemanales'],
      order: {
        fechaCreacion: 'DESC'
      }
    });
  }

  /**
   * Obtiene una proyección por ID con todas sus relaciones
   */
  async findOne(id: string): Promise<Proyeccion> {
    const proyeccion = await this.proyeccionRepository.findOne({
      where: { idProyeccion: id },
      relations: ['idProyectoProducto', 'proyeccionesSemanales']
    });

    if (!proyeccion) {
      throw new RpcException({
        message: 'Proyección no encontrada',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return proyeccion;
  }

  /**
   * Obtiene todas las proyecciones de un proyecto-producto específico
   */
  async findByProyectoProducto(idProyectoProducto: string): Promise<Proyeccion[]> {
    return await this.proyeccionRepository.find({
      where: { idProyectoProducto: { idProyectoProducto } },
      relations: ['idProyectoProducto', 'proyeccionesSemanales'],
      order: {
        fechaCreacion: 'DESC'
      }
    });
  }

  /**
   * Obtiene todas las proyecciones de un proyecto específico
   * Busca a través de la relación ProyectoProducto
   */
  async findByProyecto(idProyecto: string): Promise<Proyeccion[]> {
    return await this.proyeccionRepository
      .createQueryBuilder('proyeccion')
      .leftJoinAndSelect('proyeccion.idProyectoProducto', 'proyectoProducto')
      .leftJoinAndSelect('proyeccion.proyeccionesSemanales', 'proyeccionesSemanales')
      .where('proyectoProducto.id_proyecto = :idProyecto', { idProyecto })
      .orderBy('proyeccion.fechaCreacion', 'DESC')
      .getMany();
  }

  /**
   * Obtiene proyecciones filtradas por tipo de proyección y producto
   */
  async findByTipoAndProducto(tipoProyeccion: string, idProducto: string): Promise<Proyeccion[]> {
    return await this.proyeccionRepository
      .createQueryBuilder('proyeccion')
      .leftJoinAndSelect('proyeccion.idProyectoProducto', 'proyectoProducto')
      .leftJoinAndSelect('proyeccion.proyeccionesSemanales', 'proyeccionesSemanales')
      .where('proyeccion.tipo_proyeccion = :tipoProyeccion', { tipoProyeccion })
      .andWhere('proyectoProducto.id_producto = :idProducto', { idProducto })
      .orderBy('proyeccion.fechaCreacion', 'DESC')
      .getMany();
  }

  /**
   * Actualiza una proyección existente
   * 
   * Tipos de actualización:
   * 1. INOFENSIVO: Solo cambia estado - no afecta semanas
   * 2. MOVIMIENTO: Cambia fechaInicio - recalcula fechas de semanas pero mantiene cantidades
   * 3. ESTRUCTURAL: Cambia pisosSemana o forzarRecalculo - regenera todo desde cero
   */
  async update(id: string, updateProyeccionDto: UpdateProyeccionDto): Promise<Proyeccion> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener proyección actual con semanas
      const proyeccion = await this.findOne(id);

      // 2. Clasificar el tipo de cambio
      const tipoCambio = this.clasificarTipoCambio(proyeccion, updateProyeccionDto);

      // 3. Aplicar cambios según el tipo
      let proyeccionActualizada: Proyeccion;

      switch (tipoCambio) {
        case 'INOFENSIVO':
          proyeccionActualizada = await this.actualizarInofensivo(proyeccion, updateProyeccionDto, queryRunner);
          break;
        case 'MOVIMIENTO':
          proyeccionActualizada = await this.actualizarMovimiento(proyeccion, updateProyeccionDto, queryRunner);
          break;
        case 'ESTRUCTURAL':
          proyeccionActualizada = await this.actualizarEstructural(proyeccion, updateProyeccionDto, queryRunner);
          break;
        default:
          proyeccionActualizada = proyeccion;
      }

      await queryRunner.commitTransaction();

      return await this.findOne(proyeccionActualizada.idProyeccion);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Si ya es una RpcException, relanzarla
      if (error instanceof RpcException) {
        throw error;
      }

      // Sino, envolver en RpcException
      throw new RpcException({
        message: `Error al actualizar la proyección: ${error.message}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Elimina una proyección y sus proyecciones semanales (cascada)
   */
  async remove(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proyeccion = await this.findOne(id);

      // Eliminar primero las proyecciones semanales
      if (proyeccion.proyeccionesSemanales && proyeccion.proyeccionesSemanales.length > 0) {
        await queryRunner.manager.delete(ProyeccionSemanal, {
          idProyeccion: { idProyeccion: proyeccion.idProyeccion }
        });
      }

      // Eliminar la proyección
      await queryRunner.manager.delete(Proyeccion, { idProyeccion: id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Si ya es una RpcException, relanzarla
      if (error instanceof RpcException) {
        throw error;
      }

      // Sino, envolver en RpcException
      throw new RpcException({
        message: `Error al eliminar la proyección: ${error.message}`,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Clasifica el tipo de cambio para determinar la estrategia de actualización
   */
  private clasificarTipoCambio(
    proyeccion: Proyeccion,
    updateDto: UpdateProyeccionDto
  ): 'INOFENSIVO' | 'MOVIMIENTO' | 'ESTRUCTURAL' {
    // Si se fuerza recálculo, siempre es estructural
    if (updateDto.forzarRecalculo === true) {
      return 'ESTRUCTURAL';
    }

    const cambios = this.detectarCambios(proyeccion, updateDto);

    // Si no hay cambios, es inofensivo
    if (cambios.length === 0) return 'INOFENSIVO';

    // Si solo cambia estado o tipoProyeccion
    if (cambios.every(campo => ['estado', 'tipoProyeccion'].includes(campo))) {
      return 'INOFENSIVO';
    }

    // Si cambia pisosSemana, es estructural
    if (cambios.some(campo => campo === 'pisosSemana')) {
      return 'ESTRUCTURAL';
    }

    // Default: inofensivo
    return 'INOFENSIVO';
  }

  /**
   * Detecta qué campos han cambiado
   */
  private detectarCambios(proyeccionActual: Proyeccion, updateDto: UpdateProyeccionDto): string[] {
    const camposCambiados: string[] = [];
    const camposComparar = ['estado', 'tipoProyeccion', 'pisosSemana'];

    camposComparar.forEach(campo => {
      if (updateDto[campo] !== undefined && updateDto[campo] !== null) {
        const valorActual = String(proyeccionActual[campo]);
        const valorNuevo = String(updateDto[campo]);

        if (valorActual !== valorNuevo) {
          camposCambiados.push(campo);
        }
      }
    });

    return camposCambiados;
  }

  /**
   * Actualización INOFENSIVA: Solo campos básicos, no toca semanas
   */
  private async actualizarInofensivo(
    proyeccion: Proyeccion,
    updateDto: UpdateProyeccionDto,
    queryRunner: any
  ): Promise<Proyeccion> {
    // Solo actualizar campos inofensivos
    if (updateDto.estado !== undefined) {
      proyeccion.estado = updateDto.estado;
    }
    if (updateDto.tipoProyeccion !== undefined) {
      proyeccion.tipoProyeccion = updateDto.tipoProyeccion;
    }

    return await queryRunner.manager.save(Proyeccion, proyeccion);
  }

  /**
   * Actualización por MOVIMIENTO: Cambia fechas pero mantiene estructura
   * (No implementado aún - requiere cambio en fechaTentativa del proyecto)
   */
  private async actualizarMovimiento(
    proyeccion: Proyeccion,
    updateDto: UpdateProyeccionDto,
    queryRunner: any
  ): Promise<Proyeccion> {
    // Por ahora, solo actualizar campos inofensivos
    // TODO: Implementar cuando se detecte cambio en fechaTentativa del proyecto
    return await this.actualizarInofensivo(proyeccion, updateDto, queryRunner);
  }

  /**
   * Actualización ESTRUCTURAL: Regenera todo desde cero
   */
  private async actualizarEstructural(
    proyeccion: Proyeccion,
    updateDto: UpdateProyeccionDto,
    queryRunner: any
  ): Promise<Proyeccion> {
    // 1. Obtener datos actualizados (sin relaciones, idProyecto es string)
    const proyectoProducto = await this.proyectoProductoRepository.findOne({
      where: { idProyectoProducto: proyeccion.idProyectoProducto.idProyectoProducto }
    });

    if (!proyectoProducto) {
      throw new RpcException({
        message: 'ProyectoProducto no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Cargar el proyecto usando el idProyecto (string)
    const proyecto = await queryRunner.manager.findOne(Proyecto, {
      where: { idProyecto: proyectoProducto.idProyecto }
    });

    if (!proyecto) {
      throw new RpcException({
        message: 'Proyecto no encontrado',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const pisos = proyecto.pisos || 0;
    const sotanos = proyecto.sotanos || 0;
    const fechaInicio = new Date(proyecto.fechaTentativa);
    const total = proyectoProducto.cantidad;
    const pisosSemana = updateDto.pisosSemana || proyeccion.pisosSemana;

    // 2. Obtener unidad del producto
    const unidad = await this.productoClientService.getUnidadMedida(proyectoProducto.idProducto);

    // 3. Recalcular metrado por piso
    const metradoPiso = total / ((pisos + sotanos) / pisosSemana);
    const numeroSemanas = Math.ceil((pisos + sotanos) / pisosSemana);

    // 4. Actualizar campos de la proyección
    proyeccion.metradoPiso = parseFloat(metradoPiso.toFixed(2));
    proyeccion.pisos = pisos;
    proyeccion.sotanos = sotanos;
    proyeccion.pisosSemana = pisosSemana;
    proyeccion.total = total;
    proyeccion.fechaInicio = fechaInicio;

    if (updateDto.estado) proyeccion.estado = updateDto.estado;
    if (updateDto.tipoProyeccion) proyeccion.tipoProyeccion = updateDto.tipoProyeccion;

    // 5. Eliminar semanas existentes
    await queryRunner.manager.delete(ProyeccionSemanal, {
      idProyeccion: { idProyeccion: proyeccion.idProyeccion }
    });

    // 6. Generar nuevas semanas
    let fechaSemana = getNextMonday(fechaInicio);
    const proyeccionesSemanales: ProyeccionSemanal[] = [];

    for (let i = 0; i < numeroSemanas; i++) {
      const numeroSemana = getWeekNumber(fechaSemana);

      const proyeccionSemanal = queryRunner.manager.create(ProyeccionSemanal, {
        numeroSemana: numeroSemana.toString(),
        fecha: new Date(fechaSemana),
        cantidad: parseFloat(metradoPiso.toFixed(2)),
        unidad: unidad,
        idProyeccion: proyeccion
      });

      proyeccionesSemanales.push(proyeccionSemanal);
      fechaSemana = addDays(fechaSemana, 7);
    }

    await queryRunner.manager.save(ProyeccionSemanal, proyeccionesSemanales);

    // 7. Actualizar fechaFin
    const ultimaSemana = proyeccionesSemanales[proyeccionesSemanales.length - 1];
    proyeccion.fechaFin = ultimaSemana.fecha;

    return await queryRunner.manager.save(Proyeccion, proyeccion);
  }
}
