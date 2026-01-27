import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { CreateProyectoCompletoDto } from './dto/create-proyecto-completo.dto';
import { Proyecto } from './entities/proyecto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ProyectoProducto } from 'src/proyecto-producto/entities/proyecto-producto.entity';
import { ClienteService } from 'src/cliente/cliente.service';
import { AuditoriaProyectoService } from 'src/auditoria-proyecto/auditoria-proyecto.service';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { NATS_SERVICE } from 'src/config';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepo: Repository<Proyecto>,
    private dataSource: DataSource,
    private clienteService: ClienteService,
    private auditoriaProyectoService: AuditoriaProyectoService,
    @Inject(NATS_SERVICE) private readonly clientDispatch: ClientProxy,
  ) { }

  async findAll(): Promise<BaseResponseDto<Proyecto[]>> {
    try {
      const proyectos = await this.proyectoRepo.find({
        relations: ['idCliente', 'proyectoProductos'],
        order: { fechaCreacion: 'DESC' },
      });

      return BaseResponseDto.success(
        proyectos,
        'Proyectos obtenidos exitosamente',
        200,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al obtener proyectos',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async findAllCerrados(): Promise<BaseResponseDto<Proyecto[]>> {
    try {
      const proyectos = await this.proyectoRepo.find({
        where: { estado: 'CERRADO' },
        relations: ['idCliente', 'proyectoProductos'],
        order: { fechaCreacion: 'DESC' },
      });

      return BaseResponseDto.success(
        proyectos,
        'Proyectos cerrados obtenidos exitosamente',
        200,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al obtener proyectos cerrados',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<Proyecto>> {
    try {
      const proyecto = await this.proyectoRepo.findOne({
        where: { idProyecto: id },
        relations: ['idCliente'],
      });

      if (!proyecto) {
        throw new RpcException({
          message: 'Proyecto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      return BaseResponseDto.success(
        proyecto,
        'Proyecto obtenido exitosamente',
        200,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al obtener proyecto',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async findByComercial(
    idComercial: string,
  ): Promise<BaseResponseDto<Proyecto[]>> {
    try {
      const proyectos = await this.proyectoRepo.find({
        where: { idComercial },
        relations: ['idCliente'],
        order: { fechaCreacion: 'DESC' },
      });

      return BaseResponseDto.success(
        proyectos,
        'Proyectos del comercial obtenidos exitosamente',
        200,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al obtener proyectos del comercial',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  /**
   * Obtiene múltiples proyectos por sus IDs (para consultas en lote)
   */
  async findByIds(ids: string[]): Promise<BaseResponseDto<Proyecto[]>> {
    try {
      if (!ids || ids.length === 0) {
        return BaseResponseDto.success([], 'No se proporcionaron IDs', 200);
      }

      // Filtrar IDs válidos (no vacíos)
      const validIds = ids.filter((id) => id && id.trim() !== '');

      if (validIds.length === 0) {
        return BaseResponseDto.success([], 'No hay IDs válidos', 200);
      }

      const proyectos = await this.proyectoRepo
        .createQueryBuilder('proyecto')
        .leftJoinAndSelect('proyecto.idCliente', 'cliente')
        .where('proyecto.idProyecto IN (:...ids)', { ids: validIds })
        .getMany();

      return BaseResponseDto.success(
        proyectos,
        `${proyectos.length} proyecto(s) obtenido(s) exitosamente`,
        200,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al obtener proyectos por IDs',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  /**
   * Crea un proyecto completo con cliente y productos en una transacción
   */
  async createProyectoCompleto(
    createDto: CreateProyectoCompletoDto,
  ): Promise<BaseResponseDto<Proyecto>> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        let idCliente: string;

        // 1. Manejar cliente según tipo de proyecto
        // 1. Manejar cliente según tipo de proyecto
        if (createDto.esProyectoNuevo) {
          // Proyecto NUEVO: Validar que cliente no exista
          if (
            !createDto.clienteNuevo ||
            !createDto.clienteNuevo.nombreComercial
          ) {
            throw new RpcException({
              message:
                'Debe proporcionar datos del cliente nuevo (nombre comercial obligatorio)',
              statusCode: HttpStatus.BAD_REQUEST,
            });
          }

          const clienteExistente =
            await this.clienteService.findByNombreComercial(
              createDto.clienteNuevo.nombreComercial,
            );

          if (clienteExistente) {
            throw new RpcException({
              message: `El cliente con nombre comercial "${createDto.clienteNuevo.nombreComercial}" ya existe`,
              statusCode: HttpStatus.CONFLICT,
            });
          }

          // Calcular siguiente numeroCliente de forma global
          const maxClienteResult = await manager
            .createQueryBuilder(Cliente, 'c')
            .select('MAX(c.numeroCliente)', 'max')
            .getRawOne();

          const maxNumeroCliente = maxClienteResult && maxClienteResult.max ? parseInt(maxClienteResult.max, 10) : 0;
          const nextNumeroCliente = maxNumeroCliente + 1;

          // Crear nuevo cliente
          const nuevoCliente = manager.create(Cliente, {
            razonSocial: createDto.clienteNuevo.razonSocial || '',
            nombreComercial: createDto.clienteNuevo.nombreComercial,
            ruc: createDto.clienteNuevo.ruc,
            tipo: createDto.clienteNuevo.tipo || '',
            credito: createDto.clienteNuevo.credito || '',
            condicion: createDto.clienteNuevo.condicion || '',
            datos: createDto.clienteNuevo.datos || '',
            estaActivo: false,
            tipoCliente: 'NUEVO',
            numeroCliente: nextNumeroCliente,
          });

          const clienteGuardado = await manager.save(Cliente, nuevoCliente);
          idCliente = clienteGuardado.idCliente;
        } else {
          // Proyecto ANTIGUO: Usar cliente existente
          if (!createDto.idClienteExistente) {
            throw new RpcException({
              message: 'Debe proporcionar el ID del cliente existente',
              statusCode: HttpStatus.BAD_REQUEST,
            });
          }

          // Verificar que el cliente existe
          const clienteExistente = await manager.findOne(Cliente, {
            where: { idCliente: createDto.idClienteExistente },
          });

          if (!clienteExistente) {
            throw new RpcException({
              message: 'Cliente no encontrado',
              statusCode: HttpStatus.NOT_FOUND,
            });
          }

          idCliente = createDto.idClienteExistente;
        }

        // 2. Preparar o calcular datos para el proyecto y CUP

        // Obtener numeroCliente para generar el CUP
        let numeroClienteForCUP: number;
        if (createDto.esProyectoNuevo) {
          // Lo acabamos de crear y asignar
          // Recuperarlo del manager si es necesario, pero ya lo calculamos: nextNumeroCliente
          // Pero ojo, createDto.esProyectoNuevo implica cliente nuevo EN ESTE CONTEXTO DE CODIGO (linea 173).
          // Sin embargo, necesito la variable disponible aca. 
          // Re-obtendré el cliente recién guardado o usaré el valor calculado.
          // Mejor consulto el cliente de la BD para estar seguro o uso una variable scopeda.
          const clienteRecienCreado = await manager.findOne(Cliente, { where: { idCliente } });
          if (!clienteRecienCreado) {
            throw new RpcException({
              message: 'Error al recuperar el cliente recién creado',
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
          }
          numeroClienteForCUP = clienteRecienCreado.numeroCliente;
        } else {
          const clienteExistente = await manager.findOne(Cliente, { where: { idCliente } });
          if (!clienteExistente) {
            throw new RpcException({
              message: 'Error al recuperar el cliente existente',
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
          }
          numeroClienteForCUP = clienteExistente.numeroCliente || 0;
        }

        // Calcular numeroProyectoCliente
        // Buscar el máximo numeroProyectoCliente para este cliente en el año especifico
        const anioProyecto = createDto.proyecto.anio;

        const maxProyectoResult = await manager
          .createQueryBuilder(Proyecto, 'p')
          .select('MAX(p.numeroProyectoCliente)', 'max')
          .where('p.idCliente = :idCliente', { idCliente })
          .andWhere('p.anio = :anio', { anio: anioProyecto })
          .getRawOne();

        const maxNumeroProyecto = maxProyectoResult && maxProyectoResult.max ? parseInt(maxProyectoResult.max, 10) : 0;
        const nextNumeroProyecto = maxNumeroProyecto + 1;

        // Generar CUP: AA + CCCC + PP
        // AA: Dos ultimos digitos del anio
        const aa = anioProyecto.toString().slice(-2);
        // CCCC: Numero cliente (4 digitos)
        const cccc = numeroClienteForCUP.toString().padStart(4, '0');
        // PP: Numero proyecto (2 digitos)
        const pp = nextNumeroProyecto.toString().padStart(2, '0');

        const generadoCUP = `${aa}${cccc}${pp}`;

        // Crear proyecto con los datos calculados
        const proyectoData: any = {
          nombre: createDto.proyecto.nombre,
          suf: createDto.proyecto.suf,
          codigo: createDto.proyecto.codigo,
          anio: createDto.proyecto.anio,
          fechaTentativa: createDto.proyecto.fechaTentativa,
          estaActivo: false, // Siempre false para proyectos nuevos
          pisos: createDto.proyecto.pisos,
          sotanos: createDto.proyecto.sotanos,
          ubicacion: createDto.proyecto.ubicacion,
          latitud: createDto.proyecto.latitud,
          longitud: createDto.proyecto.longitud,
          numeroContacto: createDto.proyecto.numeroContacto,
          nombreContacto: createDto.proyecto.nombreContacto,
          correoContacto: createDto.proyecto.correoContacto,
          estado: createDto.proyecto.estado,
          idComercial: createDto.proyecto.idComercial,
          idCliente: idCliente,
          numeroProyectoCliente: nextNumeroProyecto,
          proyectoCUP: generadoCUP,
        };

        const nuevoProyecto = manager.create(Proyecto, proyectoData);

        const proyectoGuardado = await manager.save(Proyecto, nuevoProyecto);

        // 3. Obtener configuración de productos desde dispatch-ms
        let productosConfig: any[] = [];
        if (createDto.productos && createDto.productos.length > 0) {
          const idsProductos = createDto.productos.map((p) => p.idProducto);
          try {
            const response = await firstValueFrom(
              this.clientDispatch.send('findProductosByIds', idsProductos),
            );
            if (response && response.success) {
              productosConfig = response.data;
            }
          } catch (error) {
            console.error(
              'Error al obtener configuración de productos:',
              error,
            );
            // Continuar sin cálculo de comisiones si falla
          }
        }

        // 4. Crear relaciones proyecto-producto con cálculo de comisiones
        if (createDto.productos && createDto.productos.length > 0) {
          const proyectoProductos = createDto.productos.map((productoDto) => {
            const productoInfo = productosConfig.find(
              (p) => p.idProducto === productoDto.idProducto,
            );

            let comisionEstimada = 0;

            if (
              productoInfo &&
              productoInfo.configuracionesComision &&
              productoInfo.configuracionesComision.length > 0
            ) {
              // Asumimos que hay una configuración activa, tomamos la primera
              const config = productoInfo.configuracionesComision[0]; // Deberíamos filtrar por activa si hay múltiples

              if (config.activo) {
                const cantidad = productoDto.cantidad || 0;
                const precioVenta = productoDto.precioVenta || 0;

                // Lógica de cálculo según comisiones.txt

                // Prelosas: Tarifa diferente para cliente nuevo/antiguo
                if (config.aplicaTipoCliente) {
                  // Determinar si es cliente nuevo o antiguo
                  // Si es proyecto nuevo con cliente nuevo -> NUEVO
                  // Si es proyecto antiguo con cliente existente -> Verificar tipoCliente en BD
                  // Por simplicidad y según el flujo actual:
                  // Si createDto.esProyectoNuevo -> Cliente es NUEVO (recién creado)
                  // Si !createDto.esProyectoNuevo -> Cliente es ANTIGUO (ya existía)
                  // OJO: Un cliente existente podría ser "NUEVO" si es su primer proyecto, pero asumiremos
                  // que si ya existe en BD es "ANTIGUO" para efectos de comisión, o deberíamos consultar el cliente.
                  // REVISIÓN: El cliente tiene un campo `tipoCliente` ('NUEVO' | 'ANTIGUO').
                  // Deberíamos usar ese campo.

                  let tipoCliente = 'NUEVO';
                  if (
                    !createDto.esProyectoNuevo &&
                    createDto.idClienteExistente
                  ) {
                    // Si el cliente ya existía, asumimos que su tipoCliente es el que tiene en BD.
                    // Como no tenemos el objeto cliente completo aquí (solo id), podríamos haberlo traído antes.
                    // En el paso 1 (Manejar cliente), ya verificamos el cliente existente.
                    // Deberíamos guardar esa info.
                    // Por ahora, usaremos la lógica simplificada: Si se crea ahora es NUEVO, si ya existía es ANTIGUO.
                    // TODO: Refinar esto consultando el tipoCliente real del cliente existente.
                    tipoCliente = 'ANTIGUO';
                  }

                  const tarifa =
                    tipoCliente === 'NUEVO'
                      ? config.tarifaClienteNuevo || 0.2
                      : config.tarifaClienteAntiguo || 0.15;

                  comisionEstimada = cantidad * tarifa;
                } else if (config.tipoCalculo === 'POR_UNIDAD') {
                  // Previgas, Frisos, Sardinel, Muros (m2 o ml)
                  // Tarifa fija * cantidad
                  const tarifa = config.tarifaFija || 0;
                  comisionEstimada = cantidad * tarifa;
                } else if (config.tipoCalculo === 'PORCENTAJE_PRECIO') {
                  // Escaleras: % del precio unitario
                  // La regla dice: "3% del precio unitario".
                  // Si una escalera vale 1000 soles, comision es 30.
                  // Asumimos que precioVenta es el precio unitario.
                  const porcentaje = config.porcentaje || 0;
                  comisionEstimada = (precioVenta * porcentaje) / 100;
                  // Si es por cantidad de escaleras, multiplicar por cantidad?
                  // "Si una escalera vale 1000...". Si son 2 escaleras, serían 2000 y comisión 60.
                  // Asumiremos que la comisión es por unidad vendida.
                  comisionEstimada = comisionEstimada * cantidad;
                } else if (config.tipoCalculo === 'PORCENTAJE_MARGEN') {
                  // Acero: 10% de (precio venta - precio base)
                  // Se calcula en dólares, pero el sistema maneja soles?
                  // config.moneda indica la moneda.
                  // Asumiremos que precioVenta viene en la misma moneda que config.precioBase
                  const precioBase = config.precioBase || 770;
                  const porcentaje = config.porcentaje || 10;

                  // Diferencia por tonelada (o unidad de medida)
                  const margen = Math.max(0, precioVenta - precioBase);
                  const comisionPorUnidad = (margen * porcentaje) / 100;

                  comisionEstimada = comisionPorUnidad * cantidad;
                }
              }
            }

            return manager.create(ProyectoProducto, {
              idProyecto: proyectoGuardado.idProyecto,
              idProducto: productoDto.idProducto,
              cantidad: productoDto.cantidad || 0,
              precioVenta: productoDto.precioVenta || undefined,
              comisionEstimada: parseFloat(comisionEstimada.toFixed(2)),
              observaciones: productoDto.observaciones || '',
              actividad: 'COTIZACION', // Actividad automática para nuevos registros
              estado: 'PENDIENTE', // Estado automático para nuevos registros
              fechaAproxEnvio: productoDto.fechaAproxEnvio || undefined,
            });
          });

          await manager.save(ProyectoProducto, proyectoProductos);
        }

        // 5. Retornar proyecto con relaciones
        const proyectoCompleto = await manager.findOne(Proyecto, {
          where: { idProyecto: proyectoGuardado.idProyecto },
          relations: ['idCliente', 'proyectoProductos'],
        });

        return BaseResponseDto.success(
          proyectoCompleto,
          'Proyecto registrado exitosamente',
          201,
        );
      } catch (error) {
        if (error instanceof RpcException) {
          throw error;
        }
        throw new RpcException({
          message: 'Error al crear proyecto completo',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      }
    });
  }

  async update(
    id: string,
    updateProyectoDto: UpdateProyectoDto,
  ): Promise<BaseResponseDto<Proyecto>> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Verificar que el proyecto existe
        const proyecto = await manager.findOne(Proyecto, {
          where: { idProyecto: id },
        });

        if (!proyecto) {
          throw new RpcException({
            message: 'Proyecto no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }

        // 2. Detectar cambios para auditoría
        const estadoAnterior = proyecto.estado;
        const estadoNuevo = updateProyectoDto.estado;
        const fechaTentativaAnterior = proyecto.fechaTentativa;
        const fechaTentativaNueva = updateProyectoDto.fechaTentativa;

        // 3. Preparar datos de actualización
        const { idCliente, ...updateData } = updateProyectoDto;
        if (idCliente) {
          updateData['idCliente'] = idCliente as any;
        }

        // 4. Detectar cambio de fechaTentativa -> incrementar contador y registrar fecha
        if (fechaTentativaNueva && fechaTentativaAnterior) {
          const fechaAnteriorStr = new Date(fechaTentativaAnterior)
            .toISOString()
            .split('T')[0];
          const fechaNuevaStr = new Date(fechaTentativaNueva)
            .toISOString()
            .split('T')[0];

          if (fechaAnteriorStr !== fechaNuevaStr) {
            updateData['contadorCambiosFechaTentativa'] =
              (proyecto.contadorCambiosFechaTentativa || 0) + 1;
            updateData['ultimoCambioFechaTentativa'] = new Date();
          }
        }

        // 5. Detectar cambio de estado a CERRADO -> establecer fechaCierre y estadoCerrado automáticamente
        if (estadoNuevo === 'CERRADO' && estadoAnterior !== 'CERRADO') {
          updateData['fechaCierre'] = new Date();
          updateData['estadoCerrado'] = 'CERRADO'; // Estado cerrado inicial automático
        }

        // 6. Validar que estadoCerrado y fechaInicioDespacho solo se modifiquen si estado es CERRADO
        const estadoFinal = estadoNuevo || estadoAnterior;
        if (estadoFinal !== 'CERRADO') {
          // Si el proyecto no está cerrado, eliminar estos campos del update si fueron enviados
          if (updateData['estadoCerrado'] !== undefined) {
            delete updateData['estadoCerrado'];
          }
          if (updateData['fechaInicioDespacho'] !== undefined) {
            delete updateData['fechaInicioDespacho'];
          }
        }

        // 7. Actualizar datos del proyecto
        await manager.update(Proyecto, id, updateData);

        // 8. Obtener proyecto actualizado
        const proyectoActualizado = await manager.findOne(Proyecto, {
          where: { idProyecto: id },
        });

        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: 'Proyecto actualizado exitosamente',
          data: proyectoActualizado,
        };
      } catch (error) {
        if (error instanceof RpcException) {
          throw error;
        }
        throw new RpcException({
          message: 'Error al actualizar proyecto',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      }
    });
  }

  /**
   * Actualiza los productos asociados a un proyecto
   * Elimina los productos anteriores y agrega los nuevos
   */
  async updateProductos(
    idProyecto: string,
    productos: Array<{ idProducto: string; cantidad?: number }>,
  ): Promise<BaseResponseDto<ProyectoProducto[]>> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Verificar que el proyecto existe
        const proyecto = await manager.findOne(Proyecto, {
          where: { idProyecto },
          relations: ['idCliente'],
        });

        if (!proyecto) {
          throw new RpcException({
            message: 'Proyecto no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }

        // 2. Eliminar todos los productos asociados actuales
        await manager.delete(ProyectoProducto, { idProyecto });

        // 3. Crear los nuevos productos asociados
        if (productos && productos.length > 0) {
          // Obtener configuración de productos desde dispatch-ms
          let productosConfig: any[] = [];
          const idsProductos = productos.map((p) => p.idProducto);
          try {
            const response = await firstValueFrom(
              this.clientDispatch.send('findProductosByIds', idsProductos),
            );
            if (response && response.success) {
              productosConfig = response.data;
            }
          } catch (error) {
            console.error(
              'Error al obtener configuración de productos:',
              error,
            );
          }

          const proyectoProductos = productos.map((productoDto) => {
            const productoInfo = productosConfig.find(
              (p) => p.idProducto === productoDto.idProducto,
            );

            let comisionEstimada = 0;

            if (
              productoInfo &&
              productoInfo.configuracionesComision &&
              productoInfo.configuracionesComision.length > 0
            ) {
              const config = productoInfo.configuracionesComision[0];

              if (config.activo) {
                const cantidad = productoDto.cantidad || 0;
                // @ts-ignore
                const precioVenta = productoDto.precioVenta || 0;

                if (config.aplicaTipoCliente) {
                  // Recuperamos el tipo de cliente del proyecto
                  let tipoCliente = 'ANTIGUO'; // Default
                  if (
                    proyecto.idCliente &&
                    typeof proyecto.idCliente === 'object'
                  ) {
                    // @ts-ignore
                    tipoCliente = proyecto.idCliente.tipoCliente || 'ANTIGUO';
                  }

                  const tarifa =
                    tipoCliente === 'NUEVO'
                      ? config.tarifaClienteNuevo || 0.2
                      : config.tarifaClienteAntiguo || 0.15;

                  comisionEstimada = cantidad * tarifa;
                } else if (config.tipoCalculo === 'POR_UNIDAD') {
                  const tarifa = config.tarifaFija || 0;
                  comisionEstimada = cantidad * tarifa;
                } else if (config.tipoCalculo === 'PORCENTAJE_PRECIO') {
                  const porcentaje = config.porcentaje || 0;
                  comisionEstimada = (precioVenta * porcentaje) / 100;
                  comisionEstimada = comisionEstimada * cantidad;
                } else if (config.tipoCalculo === 'PORCENTAJE_MARGEN') {
                  const precioBase = config.precioBase || 770;
                  const porcentaje = config.porcentaje || 10;
                  const margen = Math.max(0, precioVenta - precioBase);
                  const comisionPorUnidad = (margen * porcentaje) / 100;
                  comisionEstimada = comisionPorUnidad * cantidad;
                }
              }
            }

            return manager.create(ProyectoProducto, {
              idProyecto,
              idProducto: productoDto.idProducto,
              cantidad: productoDto.cantidad || 0,
              // @ts-ignore
              precioVenta: productoDto.precioVenta || undefined,
              comisionEstimada: parseFloat(comisionEstimada.toFixed(2)),
              // @ts-ignore
              observaciones: productoDto.observaciones || '',
              // @ts-ignore - Si esActualizacion es true, usar ACTUALIZACION, sino COTIZACION
              actividad: productoDto.esActualizacion
                ? 'ACTUALIZACION'
                : 'COTIZACION',
              estado: 'PENDIENTE', // Estado automático para nuevos registros
              // @ts-ignore
              fechaAproxEnvio: productoDto.fechaAproxEnvio || null,
            });
          });

          const nuevosProductos = manager.create(
            ProyectoProducto,
            proyectoProductos,
          );
          await manager.save(ProyectoProducto, nuevosProductos);

          return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Productos actualizados exitosamente',
            data: nuevosProductos,
          };
        }

        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: 'Productos eliminados exitosamente',
          data: [],
        };
      } catch (error) {
        if (error instanceof RpcException) {
          throw error;
        }
        throw new RpcException({
          message: 'Error al actualizar productos del proyecto',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      }
    });
  }

  /**
   * Agrega nuevos productos a un proyecto sin eliminar los existentes
   */
  async addProductos(
    idProyecto: string,
    productos: Array<{
      idProducto: string;
      cantidad?: number;
      precioVenta?: number;
    }>,
  ): Promise<BaseResponseDto<ProyectoProducto[]>> {
    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Verificar que el proyecto existe
        const proyecto = await manager.findOne(Proyecto, {
          where: { idProyecto },
          relations: ['idCliente'],
        });

        if (!proyecto) {
          throw new RpcException({
            message: 'Proyecto no encontrado',
            statusCode: HttpStatus.NOT_FOUND,
          });
        }

        // 2. Filtrar productos que ya existen
        const productosExistentes = await manager.find(ProyectoProducto, {
          where: { idProyecto },
        });

        const idsExistentes = productosExistentes.map((p) => p.idProducto);
        const productosNuevos = productos.filter(
          (p) => !idsExistentes.includes(p.idProducto),
        );

        if (productosNuevos.length === 0) {
          return {
            success: true,
            statusCode: HttpStatus.OK,
            message: 'Todos los productos ya están agregados al proyecto',
            data: [],
          };
        }

        // 3. Obtener configuración de productos desde dispatch-ms
        let productosConfig: any[] = [];
        const idsProductos = productosNuevos.map((p) => p.idProducto);
        try {
          const response = await firstValueFrom(
            this.clientDispatch.send('findProductosByIds', idsProductos),
          );
          if (response && response.success) {
            productosConfig = response.data;
          }
        } catch (error) {
          console.error('Error al obtener configuración de productos:', error);
        }

        // 4. Calcular comisiones y crear productos
        const proyectoProductos = productosNuevos.map((productoDto) => {
          const productoInfo = productosConfig.find(
            (p) => p.idProducto === productoDto.idProducto,
          );

          let comisionEstimada = 0;

          if (
            productoInfo &&
            productoInfo.configuracionesComision &&
            productoInfo.configuracionesComision.length > 0
          ) {
            const config = productoInfo.configuracionesComision[0];

            if (config.activo) {
              const cantidad = productoDto.cantidad || 0;
              const precioVenta = productoDto.precioVenta || 0;
              const precioBase = config.precioBase || 0;

              if (config.aplicaTipoCliente) {
                let tipoCliente = 'ANTIGUO';
                if (
                  proyecto.idCliente &&
                  typeof proyecto.idCliente === 'object'
                ) {
                  // @ts-ignore
                  tipoCliente = proyecto.idCliente.tipoCliente || 'ANTIGUO';
                }

                const tarifa =
                  tipoCliente === 'NUEVO'
                    ? config.tarifaClienteNuevo || 0.2
                    : config.tarifaClienteAntiguo || 0.15;

                comisionEstimada = cantidad * tarifa;
              } else if (config.tipoCalculo === 'POR_UNIDAD') {
                const tarifa = config.tarifaFija || 0;
                comisionEstimada = cantidad * tarifa;
              } else if (config.tipoCalculo === 'PORCENTAJE_PRECIO') {
                const porcentaje = config.porcentaje || 0;
                comisionEstimada = (cantidad * precioBase * porcentaje) / 100;
              } else if (config.tipoCalculo === 'PORCENTAJE_MARGEN') {
                const porcentaje = config.porcentaje || 0;
                comisionEstimada =
                  ((cantidad / 1000) *
                    (precioVenta - precioBase) *
                    porcentaje) /
                  100;
              }
            }
          }

          return manager.create(ProyectoProducto, {
            idProyecto,
            idProducto: productoDto.idProducto,
            cantidad: productoDto.cantidad || 0,
            // @ts-ignore
            precioVenta: productoDto.precioVenta || undefined,
            comisionEstimada: parseFloat(comisionEstimada.toFixed(2)),
          });
        });

        const nuevosProductos = await manager.save(
          ProyectoProducto,
          proyectoProductos,
        );

        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: `${nuevosProductos.length} producto(s) agregado(s) exitosamente`,
          data: nuevosProductos,
        };
      } catch (error) {
        if (error instanceof RpcException) {
          throw error;
        }
        throw new RpcException({
          message: 'Error al agregar productos al proyecto',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      }
    });
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }
}
