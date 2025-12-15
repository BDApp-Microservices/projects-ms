import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProyectoProductoDto } from './dto/create-proyecto-producto.dto';
import { ProyectoProducto } from './entities/proyecto-producto.entity';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProyectoProductoService {
  constructor(
    @InjectRepository(ProyectoProducto)
    private readonly proyectoProductoRepository: Repository<ProyectoProducto>,
    @Inject(NATS_SERVICE) private readonly clientDispatch: ClientProxy,
  ) { }

  async createMany(createDtos: CreateProyectoProductoDto[]) {
    const proyectoProductos = this.proyectoProductoRepository.create(createDtos);
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
      order: {
        estaActivo: 'DESC', // Activos primero
      },
    });
  }

  async deleteByProyecto(idProyecto: string) {
    return await this.proyectoProductoRepository.delete({ idProyecto });
  }

  async softDelete(idProyecto: string, idProducto: string) {
    const proyectoProducto = await this.proyectoProductoRepository.findOne({
      where: {
        idProyecto,
        idProducto
      },
    });

    if (!proyectoProducto) {
      throw new Error('Producto no encontrado en el proyecto');
    }

    proyectoProducto.estaActivo = false;
    proyectoProducto.fechaDesactivacion = new Date();

    return await this.proyectoProductoRepository.save(proyectoProducto);
  }

  async reactivate(idProyecto: string, idProducto: string) {
    const proyectoProducto = await this.proyectoProductoRepository.findOne({
      where: {
        idProyecto,
        idProducto
      },
    });

    if (!proyectoProducto) {
      throw new Error('Producto no encontrado en el proyecto');
    }

    proyectoProducto.estaActivo = true;
    proyectoProducto.fechaDesactivacion = null;

    return await this.proyectoProductoRepository.save(proyectoProducto);
  }


  async updateCantidad(idProyecto: string, idProducto: string, cantidad: number) {
    const proyectoProducto = await this.proyectoProductoRepository.findOne({
      where: {
        idProyecto,
        idProducto
      },
      relations: ['idProyecto', 'idProyecto.idCliente'],
    });

    if (!proyectoProducto) {
      throw new Error('Producto no encontrado en el proyecto');
    }

    // Obtener configuración del producto desde dispatch-ms
    let comisionEstimada = 0;
    try {
      const response = await firstValueFrom(
        this.clientDispatch.send('findProductosByIds', [idProducto]),
      );

      if (response && response.success && response.data && response.data.length > 0) {
        const productoInfo = response.data[0];

        if (productoInfo.configuracionesComision && productoInfo.configuracionesComision.length > 0) {
          const config = productoInfo.configuracionesComision[0];

          if (config.activo) {
            // Usar la cantidad NUEVA que viene como parámetro, no la vieja de la BD
            const precioVenta = proyectoProducto.precioVenta || 0;
            const precioBase = config.precioBase || 0;

            if (config.aplicaTipoCliente) {
              let tipoCliente = 'ANTIGUO';
              // @ts-ignore
              if (proyectoProducto.idProyecto?.idCliente && typeof proyectoProducto.idProyecto.idCliente === 'object') {
                // @ts-ignore
                tipoCliente = proyectoProducto.idProyecto.idCliente.tipoCliente || 'ANTIGUO';
              }

              const tarifa = tipoCliente === 'NUEVO'
                ? (config.tarifaClienteNuevo || 0.20)
                : (config.tarifaClienteAntiguo || 0.15);

              comisionEstimada = cantidad * tarifa;

            } else if (config.tipoCalculo === 'POR_UNIDAD') {
              const tarifa = config.tarifaFija || 0;
              comisionEstimada = cantidad * tarifa;

            } else if (config.tipoCalculo === 'PORCENTAJE_PRECIO') {
              const porcentaje = config.porcentaje || 0;
              comisionEstimada = (cantidad * precioBase * porcentaje) / 100;

            } else if (config.tipoCalculo === 'PORCENTAJE_MARGEN') {
              const porcentaje = config.porcentaje || 0;
              comisionEstimada = (((cantidad / 1000) * (precioVenta - precioBase)) * porcentaje) / 100;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al obtener configuración de producto:', error);
      // Si falla, mantener la proporción como fallback
      const cantidadAnterior = proyectoProducto.cantidad;
      if (cantidadAnterior > 0 && proyectoProducto.comisionEstimada > 0) {
        const comisionPorUnidad = proyectoProducto.comisionEstimada / cantidadAnterior;
        comisionEstimada = cantidad * comisionPorUnidad;
      }
    }

    // Actualizar cantidad y comisión
    proyectoProducto.cantidad = cantidad;
    proyectoProducto.comisionEstimada = parseFloat(comisionEstimada.toFixed(2));

    return await this.proyectoProductoRepository.save(proyectoProducto);
  }
}
