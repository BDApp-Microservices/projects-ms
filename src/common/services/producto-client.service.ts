import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { NATS_SERVICE } from 'src/config';

/**
 * Servicio cliente para comunicarse con el microservicio de Producto (dispatch-ms)
 * Obtiene información del producto necesaria para las proyecciones
 */
@Injectable()
export class ProductoClientService {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}

  /**
   * Obtiene un producto por su ID desde el microservicio dispatch-ms
   * 
   * @param idProducto - UUID del producto
   * @returns Producto con su unidad de medida
   * @throws RpcException si el producto no existe o hay error de comunicación
   */
  async getProducto(idProducto: string) {
    try {
      return await firstValueFrom(
        this.client.send({ cmd: 'get.producto' }, { idProducto }).pipe(
          catchError(error => {
            throw new RpcException({
              status: error.status || 400,
              message: error.message || 'Error al obtener el producto'
            });
          })
        )
      );
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: `No se pudo obtener el producto: ${error.message}`
      });
    }
  }

  /**
   * Obtiene la unidad de medida de un producto
   * 
   * @param idProducto - UUID del producto
   * @returns String con la unidad de medida (M2, ML, KG, UND, etc.)
   */
  async getUnidadMedida(idProducto: string): Promise<string> {
    const producto = await this.getProducto(idProducto);
    return producto.unidadMedida || 'UND';
  }
}
