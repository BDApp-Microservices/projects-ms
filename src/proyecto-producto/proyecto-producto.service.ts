import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProyectoProductoDto } from './dto/create-proyecto-producto.dto';
import { ProyectoProducto } from './entities/proyecto-producto.entity';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProyectoProductoService {
  constructor(
    @InjectRepository(ProyectoProducto)
    private readonly proyectoProductoRepository: Repository<ProyectoProducto>,
    @Inject(NATS_SERVICE) private readonly clientDispatch: ClientProxy,
  ) {}

  async createMany(createDtos: CreateProyectoProductoDto[]) {
    const proyectoProductos =
      this.proyectoProductoRepository.create(createDtos);
    return await this.proyectoProductoRepository.save(proyectoProductos);
  }

  async findByProyecto(idProyecto: string, includeInactive = true) {
    const whereCondition: any = { idProyecto };

    // Por defecto, mostrar todos los productos (activos e inactivos)
    if (!includeInactive) {
      whereCondition.estaActivo = true;
    }

    return await this.proyectoProductoRepository.find({
      where: whereCondition,
      relations: ['idProyecto'],
      order: {
        estaActivo: 'DESC', // Activos primero
      },
    });
  }

  async findAll(includeInactive = true) {
    const whereCondition: any = {};

    // Por defecto, mostrar todos los productos (activos e inactivos)
    if (!includeInactive) {
      whereCondition.estaActivo = true;
    }

    return await this.proyectoProductoRepository.find({
      where: whereCondition,
      relations: ['idProyecto'],
      order: {
        numeroCotizacion: 'ASC',
      },
    });
  }

  async findOne(idProyectoProducto: string) {
    const proyectoProducto = await this.proyectoProductoRepository.findOne({
      where: { idProyectoProducto },
      relations: ['idProyecto', 'idProducto'],
    });

    if (!proyectoProducto) {
      throw new Error('Producto no encontrado');
    }

    return proyectoProducto;
  }

  async update(
    idProyectoProducto: string,
    updateData: Partial<ProyectoProducto>,
  ) {
    // Cargar con relaciones necesarias para el cálculo de comisiones
    const proyectoProducto = await this.proyectoProductoRepository.findOne({
      where: { idProyectoProducto },
      relations: ['idProyecto', 'idProyecto.idCliente'],
    });

    if (!proyectoProducto) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Producto no encontrado',
      });
    }

    // Validación para estado ENVIADO
    const estadoFinal = updateData.estado ?? proyectoProducto.estado;
    if (estadoFinal === 'ENVIADO') {
      const cantidadFinal = updateData.cantidad ?? proyectoProducto.cantidad;
      const sistemaInicialFinal =
        updateData.sistemaInicial ?? proyectoProducto.sistemaInicial;

      const errores: string[] = [];

      if (!cantidadFinal || cantidadFinal <= 0) {
        errores.push('La cantidad debe ser mayor a 0');
      }

      if (!sistemaInicialFinal) {
        errores.push('Debe seleccionar un sistema inicial');
      }

      if (errores.length > 0) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: `Para guardar con estado ENVIADO: ${errores.join(', ')}`,
        });
      }
    }

    // Verificar si se está actualizando cantidad o precioVenta para recalcular comisión
    const shouldRecalculateCommission =
      updateData.cantidad !== undefined || updateData.precioVenta !== undefined;

    // Calcular y congelar diasEnEspera cuando el estado cambia a PROCESO
    // También auto-insertar fechaInicio
    if (
      updateData.estado === 'PROCESO' &&
      (proyectoProducto.diasEnEspera === null ||
        proyectoProducto.diasEnEspera === undefined)
    ) {
      // Forzar hora 00:00 Local para evitar desfases por zona horaria
      const fechaCreacionStr = proyectoProducto.fechaCreacion
        .toISOString()
        .split('T')[0];
      const fechaCreacion = new Date(`${fechaCreacionStr}T00:00:00`);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normalizar a 00:00 local
      const diffTime = hoy.getTime() - fechaCreacion.getTime();
      proyectoProducto.diasEnEspera = Math.floor(
        diffTime / (1000 * 60 * 60 * 24),
      );

      // Auto-insertar fechaInicio si no existe (usa fecha actual local)
      if (!proyectoProducto.fechaInicio) {
        proyectoProducto.fechaInicio = new Date();
      }
    }

    // Auto-insertar fechaEnvio cuando el estado cambia a ENVIADO
    if (updateData.estado === 'ENVIADO' && !proyectoProducto.fechaEnvio) {
      proyectoProducto.fechaEnvio = new Date();
    }

    // Actualizar campos
    Object.assign(proyectoProducto, updateData);

    // Recalcular comisión si es necesario
    if (shouldRecalculateCommission) {
      const comisionEstimada = await this.calcularComision(proyectoProducto);
      proyectoProducto.comisionEstimada = parseFloat(
        comisionEstimada.toFixed(2),
      );
    }

    // Calcular días cuando se guarda fechaEnvio
    if (proyectoProducto.fechaEnvio) {
      // Forzar hora 00:00 Local para cálculos de días
      const fechaEnvioStr =
        proyectoProducto.fechaEnvio instanceof Date
          ? proyectoProducto.fechaEnvio.toISOString().split('T')[0]
          : String(proyectoProducto.fechaEnvio).split('T')[0];
      const fechaEnvio = new Date(`${fechaEnvioStr}T00:00:00`);

      // diasPendientes: diferencia entre fechaAproxEnvio y fechaEnvio
      if (proyectoProducto.fechaAproxEnvio) {
        const fechaAproxStr =
          proyectoProducto.fechaAproxEnvio instanceof Date
            ? proyectoProducto.fechaAproxEnvio.toISOString().split('T')[0]
            : String(proyectoProducto.fechaAproxEnvio).split('T')[0];
        const fechaAprox = new Date(`${fechaAproxStr}T00:00:00`);
        const diffTime = fechaAprox.getTime() - fechaEnvio.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        proyectoProducto.diasPendientes = diffDays;
      }

      // diasDesarrollo: diferencia entre fechaEnvio y fechaInicio
      if (proyectoProducto.fechaInicio) {
        const fechaInicioStr =
          proyectoProducto.fechaInicio instanceof Date
            ? proyectoProducto.fechaInicio.toISOString().split('T')[0]
            : String(proyectoProducto.fechaInicio).split('T')[0];
        const fechaInicio = new Date(`${fechaInicioStr}T00:00:00`);
        const diffTime = fechaEnvio.getTime() - fechaInicio.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        proyectoProducto.diasDesarrollo = diffDays;
      }
    }

    return await this.proyectoProductoRepository.save(proyectoProducto);
  }

  /**
   * Calcula la comisión estimada basada en la configuración del producto
   */
  private async calcularComision(
    proyectoProducto: ProyectoProducto,
  ): Promise<number> {
    const idProducto = proyectoProducto.idProducto;
    const cantidad = proyectoProducto.cantidad || 0;
    const precioVenta = proyectoProducto.precioVenta || 0;

    if (cantidad <= 0) {
      return 0;
    }

    try {
      // Obtener configuración del producto desde dispatch-ms
      const response = await firstValueFrom(
        this.clientDispatch.send('findProductosByIds', [idProducto]),
      );

      if (!response?.success || !response?.data?.length) {
        return 0;
      }

      const productoInfo = response.data[0];

      if (!productoInfo.configuracionesComision?.length) {
        return 0;
      }

      const config = productoInfo.configuracionesComision[0];

      if (!config.activo) {
        return 0;
      }

      const precioBase = config.precioBase || 0;

      // Cálculo según tipo de cliente
      if (config.aplicaTipoCliente) {
        let tipoCliente = 'ANTIGUO';
        const proyecto = proyectoProducto.idProyecto as any;
        if (proyecto?.idCliente && typeof proyecto.idCliente === 'object') {
          tipoCliente = proyecto.idCliente.tipoCliente || 'ANTIGUO';
        }

        const tarifa =
          tipoCliente === 'NUEVO'
            ? config.tarifaClienteNuevo || 0.2
            : config.tarifaClienteAntiguo || 0.15;

        return cantidad * tarifa;
      }

      // Cálculo por unidad
      if (config.tipoCalculo === 'POR_UNIDAD') {
        const tarifa = config.tarifaFija || 0;
        return cantidad * tarifa;
      }

      // Cálculo por porcentaje del precio base
      if (config.tipoCalculo === 'PORCENTAJE_PRECIO') {
        const porcentaje = config.porcentaje || 0;
        return (cantidad * precioBase * porcentaje) / 100;
      }

      // Cálculo por porcentaje del margen
      if (config.tipoCalculo === 'PORCENTAJE_MARGEN') {
        const porcentaje = config.porcentaje || 0;
        return (
          ((cantidad / 1000) * (precioVenta - precioBase) * porcentaje) / 100
        );
      }

      return 0;
    } catch (error) {
      console.error('Error al calcular comisión:', error);

      // Fallback: mantener proporción si hay datos anteriores
      const cantidadAnterior = proyectoProducto.cantidad;
      if (cantidadAnterior > 0 && proyectoProducto.comisionEstimada > 0) {
        const comisionPorUnidad =
          proyectoProducto.comisionEstimada / cantidadAnterior;
        return cantidad * comisionPorUnidad;
      }

      return 0;
    }
  }

  async deleteByProyecto(idProyecto: string) {
    return await this.proyectoProductoRepository.delete({ idProyecto });
  }

  async softDelete(idProyectoProducto: string) {
    const proyectoProducto = await this.proyectoProductoRepository.findOne({
      where: {
        idProyectoProducto,
      },
    });

    if (!proyectoProducto) {
      throw new Error('Producto no encontrado');
    }

    proyectoProducto.estaActivo = false;
    proyectoProducto.fechaDesactivacion = new Date();

    return await this.proyectoProductoRepository.save(proyectoProducto);
  }

  async reactivate(idProyectoProducto: string) {
    const proyectoProducto = await this.proyectoProductoRepository.findOne({
      where: {
        idProyectoProducto,
      },
    });

    if (!proyectoProducto) {
      throw new Error('Producto no encontrado');
    }

    proyectoProducto.estaActivo = true;
    proyectoProducto.fechaDesactivacion = null;

    return await this.proyectoProductoRepository.save(proyectoProducto);
  }

  // ==================== EXPORTACION EXCEL ====================

  // Helper para formatear fechas correctamente (evita desfases de zona horaria)
  private formatDateLocal(fecha: Date | string | null | undefined): string {
    if (!fecha) return '';
    // Forzar interpretación como fecha local usando T00:00:00
    const dateStr =
      fecha instanceof Date
        ? fecha.toISOString().split('T')[0]
        : String(fecha).split('T')[0];
    const localDate = new Date(`${dateStr}T00:00:00`);
    return localDate.toLocaleDateString('es-PE');
  }

  async exportarExcel(dto: { columnas?: string[] }) {
    try {
      // 1. Obtener todos los proyectoProductos con relaciones
      const proyectoProductos = await this.proyectoProductoRepository.find({
        relations: ['idProyecto', 'idProyecto.idCliente'],
        order: { numeroCotizacion: 'ASC' },
      });

      // 2. Obtener IDs de productos únicos para enriquecer datos
      const productosIds = [
        ...new Set(
          proyectoProductos.map((pp) => pp.idProducto).filter(Boolean),
        ),
      ];

      // 3. Obtener nombres de productos desde dispatch-ms
      let productosMap = new Map<string, string>();
      if (productosIds.length > 0) {
        try {
          const productosResponse = await firstValueFrom(
            this.clientDispatch.send('findProductosByIds', productosIds),
          );
          if (productosResponse?.success && productosResponse?.data) {
            productosResponse.data.forEach((p: any) => {
              productosMap.set(p.idProducto, p.nombre);
            });
          }
        } catch (error) {
          console.warn('Error al obtener productos:', error.message);
        }
      }

      // 4. Obtener TODOS los usuarios desde auth-ms y construir mapa
      let usuariosMap = new Map<string, string>();
      try {
        const usuariosResponse = await firstValueFrom(
          this.clientDispatch.send('findAllUsuario', {}),
        );
        if (usuariosResponse?.data) {
          usuariosResponse.data.forEach((u: any) => {
            usuariosMap.set(u.idUsuario, `${u.nombres || ''}`.trim());
          });
        }
      } catch (error) {
        console.warn('Error al obtener usuarios:', error.message);
      }

      // 5. Crear workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Seguimiento Cotizaciones');

      // 6. Definir columnas en el mismo orden que la tabla del frontend
      const columnas = dto.columnas || [];
      const allColumnsDefinition = [
        { key: 'numeroCotizacion', header: 'N°', width: 10 },
        { key: 'fechaCreacion', header: 'F. Ingreso', width: 12 },
        { key: 'diasEnEspera', header: 'Días en Espera', width: 15 },
        { key: 'comercial', header: 'Comercial', width: 20 },
        { key: 'fechaAproxEnvio', header: 'Fecha Aprox. Envío', width: 18 },
        { key: 'fechaInicio', header: 'Fecha Inicio', width: 12 },
        { key: 'diasPendientes', header: 'Días Pendientes', width: 15 },
        { key: 'actividad', header: 'Actividad', width: 15 },
        { key: 'observaciones', header: 'Observaciones', width: 30 },
        { key: 'clienteTipo', header: 'Estado Cliente', width: 15 },
        { key: 'fechaTentativa', header: 'Fecha Tentativa', width: 15 },
        { key: 'clienteRuc', header: 'RUC', width: 12 },
        { key: 'proyectoUbicacion', header: 'Dirección', width: 25 },
        { key: 'proyectoNombre', header: 'Proyecto', width: 25 },
        { key: 'proyectoNombreContacto', header: 'Atención', width: 20 },
        { key: 'producto', header: 'Producto', width: 20 },
        { key: 'estado', header: 'Estado', width: 15 },
        { key: 'elaboradoPor', header: 'Elaborado Por', width: 20 },
        { key: 'cantidad', header: 'Cantidad Cotizada', width: 18 },
        { key: 'sistemaInicial', header: 'Sistema Inicial', width: 20 },
        { key: 'fechaEnvio', header: 'Fecha Envío', width: 12 },
        { key: 'proyectoCUP', header: 'Código Global', width: 15 },
        { key: 'estaActivo', header: 'Activo', width: 10 },
      ];

      // Filtrar columnas si se especificaron
      const finalColumns =
        columnas.length === 0
          ? allColumnsDefinition
          : allColumnsDefinition.filter((col) => columnas.includes(col.key));

      worksheet.columns = finalColumns;

      // 7. Estilos para el header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' },
      };

      // 8. Agregar datos
      for (const pp of proyectoProductos) {
        const proyecto = pp.idProyecto as any;
        const cliente = proyecto?.idCliente;

        const rowData: any = {
          numeroCotizacion:
            pp.numeroCotizacion !== null && pp.numeroCotizacion !== undefined
              ? Number(pp.numeroCotizacion)
              : null,
          fechaCreacion: this.formatDateLocal(pp.fechaCreacion),
          diasEnEspera:
            pp.diasEnEspera !== null && pp.diasEnEspera !== undefined
              ? Number(pp.diasEnEspera)
              : null,
          comercial: usuariosMap.get(proyecto?.idComercial) || '',
          fechaAproxEnvio: this.formatDateLocal(pp.fechaAproxEnvio),
          fechaInicio: this.formatDateLocal(pp.fechaInicio),
          diasPendientes:
            pp.diasPendientes !== null && pp.diasPendientes !== undefined
              ? Number(pp.diasPendientes)
              : null,
          actividad: pp.actividad || '',
          observaciones: pp.observaciones || '',
          clienteTipo: cliente?.tipo || '',
          fechaTentativa: this.formatDateLocal(proyecto?.fechaTentativa),
          clienteRuc: cliente?.ruc || '',
          proyectoUbicacion: proyecto?.ubicacion || '',
          proyectoNombre: proyecto?.nombre || '',
          proyectoNombreContacto: proyecto?.nombreContacto || '',
          producto: productosMap.get(pp.idProducto) || pp.idProducto || '',
          estado: pp.estado || '',
          elaboradoPor: usuariosMap.get(pp.elaboradoPor) || '',
          cantidad:
            pp.cantidad !== null && pp.cantidad !== undefined
              ? Number(pp.cantidad)
              : null,
          sistemaInicial: pp.sistemaInicial || '',
          fechaEnvio: this.formatDateLocal(pp.fechaEnvio),
          proyectoCUP: proyecto?.proyectoCUP || '',
          estaActivo: pp.estaActivo ? 'Sí' : 'No',
        };

        worksheet.addRow(rowData);
      }

      // 10. Generar buffer y codificar en Base64 para transporte NATS
      const buffer = await workbook.xlsx.writeBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: `Se exportaron ${proyectoProductos.length} registros a Excel`,
        data: base64,
      };
    } catch (error) {
      console.error('Error al exportar a Excel:', error.message);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al exportar seguimiento a Excel: ' + error.message,
      });
    }
  }
}
