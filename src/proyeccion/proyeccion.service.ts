import { Injectable, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateProyeccionDto } from './dto/create-proyeccion.dto';
import { UpdateProyeccionDto } from './dto/update-proyeccion.dto';
import { Proyeccion } from './entities/proyeccion.entity';
import { ProyeccionSemanal } from 'src/proyeccion-semanal/entities/proyeccion-semanal.entity';
import { ProyectoProducto } from 'src/proyecto-producto/entities/proyecto-producto.entity';
import { ProductoClientService } from 'src/common/services/producto-client.service';
import { getWeekNumber, getNextMonday, addDays } from 'src/common/utils/date.utils';

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
   * Parsea una fecha (Date o string) a Date en hora local sin conversión UTC
   */
  private parseDateLocal(fecha: Date | string): Date {
    if (fecha instanceof Date) {
      return fecha;
    }
    // Si es string "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss"
    const fechaStr = String(fecha).split('T')[0];
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

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
      relations: ['idProyectoProducto', 'proyeccionesSemanales', 'idProyectoProducto.idProyecto'],
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
  async remove(id: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proyeccion = await this.findOne(id);

      // Eliminar primero las proyecciones semanales usando el formato correcto
      await queryRunner.manager.delete(ProyeccionSemanal, {
        idProyeccion: { idProyeccion: proyeccion.idProyeccion }
      });

      // Eliminar la proyección
      await queryRunner.manager.delete(Proyeccion, {
        idProyeccion: id
      });

      await queryRunner.commitTransaction();

      return { message: 'Proyección eliminada correctamente' };
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

    // Si cambia pisosSemana, pisos, sotanos, total o fechaInicio, es estructural
    if (cambios.some(campo => ['pisosSemana', 'pisos', 'sotanos', 'total', 'fechaInicio'].includes(campo))) {
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
    const camposComparar = ['estado', 'tipoProyeccion', 'pisosSemana', 'pisos', 'sotanos', 'total', 'fechaInicio'];

    camposComparar.forEach(campo => {
      if (updateDto[campo] !== undefined && updateDto[campo] !== null) {
        const valorActual = campo === 'fechaInicio'
          ? new Date(proyeccionActual[campo]).toISOString().split('T')[0]
          : String(proyeccionActual[campo]);
        const valorNuevo = campo === 'fechaInicio'
          ? new Date(updateDto[campo]).toISOString().split('T')[0]
          : String(updateDto[campo]);

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
    // 1. Preservar el ID original
    const idProyeccionOriginal = proyeccion.idProyeccion;

    if (!idProyeccionOriginal) {
      throw new RpcException({
        message: 'ID de proyección no válido para actualización estructural',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // 2. Obtener unidad de medida existente
    const unidad = proyeccion.proyeccionesSemanales && proyeccion.proyeccionesSemanales.length > 0
      ? proyeccion.proyeccionesSemanales[0].unidad
      : 'UND';

    // 3. Usar datos del DTO si están presentes, sino mantener los actuales
    const pisos = updateDto.pisos !== undefined ? updateDto.pisos : proyeccion.pisos;
    const sotanos = updateDto.sotanos !== undefined ? updateDto.sotanos : proyeccion.sotanos;

    // Parsear fechaInicio correctamente en hora local
    const fechaInicio = updateDto.fechaInicio
      ? this.parseDateLocal(updateDto.fechaInicio)
      : this.parseDateLocal(proyeccion.fechaInicio);

    const total = updateDto.total !== undefined ? updateDto.total : proyeccion.total;
    const pisosSemana = updateDto.pisosSemana !== undefined ? updateDto.pisosSemana : proyeccion.pisosSemana;

    // 4. Calcular metrado por piso
    const metradoPiso = total / ((pisos + sotanos) / pisosSemana);
    const numeroSemanas = Math.ceil((pisos + sotanos) / pisosSemana);

    // 5. Crear NUEVA instancia de Proyeccion con datos actualizados
    const nuevaProyeccion = new Proyeccion();
    nuevaProyeccion.idProyeccion = idProyeccionOriginal;

    // Copiar campos inmutables (relaciones)
    nuevaProyeccion.idProyectoProducto = proyeccion.idProyectoProducto;

    // Aplicar campos actualizados
    nuevaProyeccion.fechaInicio = fechaInicio;
    nuevaProyeccion.pisos = pisos;
    nuevaProyeccion.sotanos = sotanos;
    nuevaProyeccion.pisosSemana = pisosSemana;
    nuevaProyeccion.total = total;
    nuevaProyeccion.metradoPiso = parseFloat(metradoPiso.toFixed(2));
    nuevaProyeccion.estado = updateDto.estado || proyeccion.estado;
    nuevaProyeccion.tipoProyeccion = updateDto.tipoProyeccion || proyeccion.tipoProyeccion;

    // 6. Eliminar semanas existentes
    await queryRunner.manager.delete(ProyeccionSemanal, {
      idProyeccion: { idProyeccion: idProyeccionOriginal }
    });

    // 7. Guardar la nueva proyección PRIMERO
    const proyeccionGuardada = await queryRunner.manager.save(Proyeccion, nuevaProyeccion);

    // 8. Generar y guardar nuevas semanas UNA POR UNA
    let fechaSemana = getNextMonday(fechaInicio);
    const proyeccionesSemanales: ProyeccionSemanal[] = [];

    for (let i = 0; i < numeroSemanas; i++) {
      const numeroSemana = getWeekNumber(fechaSemana);

      const proyeccionSemanal = queryRunner.manager.create(ProyeccionSemanal, {
        numeroSemana: numeroSemana.toString(),
        fecha: new Date(fechaSemana),
        cantidad: parseFloat(metradoPiso.toFixed(2)),
        unidad: unidad,
      });

      // Asignar la relación con la proyección guardada
      proyeccionSemanal.idProyeccion = proyeccionGuardada;

      // Guardar cada semana individualmente
      await queryRunner.manager.save(ProyeccionSemanal, proyeccionSemanal);
      proyeccionesSemanales.push(proyeccionSemanal);

      fechaSemana = addDays(fechaSemana, 7);
    }

    // 9. Actualizar fechaFin
    if (proyeccionesSemanales.length > 0) {
      const ultimaSemana = proyeccionesSemanales[proyeccionesSemanales.length - 1];
      proyeccionGuardada.fechaFin = ultimaSemana.fecha;
      return await queryRunner.manager.save(Proyeccion, proyeccionGuardada);
    }

    return proyeccionGuardada;
  }
}
