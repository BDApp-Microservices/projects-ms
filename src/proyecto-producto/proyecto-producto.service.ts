import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProyectoProductoDto } from './dto/create-proyecto-producto.dto';
import { ProyectoProducto } from './entities/proyecto-producto.entity';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

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
      // diasPendientes: diferencia entre fechaAproxEnvio y fechaEnvio (o fecha actual si no había fechaEnvio antes)
      if (proyectoProducto.fechaAproxEnvio) {
        const fechaAprox = new Date(proyectoProducto.fechaAproxEnvio);
        const fechaEnvio = new Date(proyectoProducto.fechaEnvio);
        const diffTime = fechaAprox.getTime() - fechaEnvio.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        proyectoProducto.diasPendientes = diffDays;
      }

      // diasDesarrollo: diferencia entre fechaEnvio y fechaInicio
      if (proyectoProducto.fechaInicio) {
        const fechaInicio = new Date(proyectoProducto.fechaInicio);
        const fechaEnvio = new Date(proyectoProducto.fechaEnvio);
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
}
