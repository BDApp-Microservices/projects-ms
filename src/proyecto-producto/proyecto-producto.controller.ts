import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyectoProductoService } from './proyecto-producto.service';

@Controller()
export class ProyectoProductoController {
  constructor(private readonly proyectoProductoService: ProyectoProductoService) { }

  @MessagePattern('findProductosByProyecto')
  findByProyecto(@Payload() idProyecto: string) {
    return this.proyectoProductoService.findByProyecto(idProyecto);
  }

  @MessagePattern('softDeleteProyectoProducto')
  softDelete(@Payload() payload: { idProyecto: string; idProducto: string }) {
    return this.proyectoProductoService.softDelete(payload.idProyecto, payload.idProducto);
  }

  @MessagePattern('reactivateProyectoProducto')
  reactivate(@Payload() payload: { idProyecto: string; idProducto: string }) {
    return this.proyectoProductoService.reactivate(payload.idProyecto, payload.idProducto);
  }

  @MessagePattern('updateCantidadProyectoProducto')
  updateCantidad(@Payload() payload: { idProyecto: string; idProducto: string; cantidad: number }) {
    return this.proyectoProductoService.updateCantidad(payload.idProyecto, payload.idProducto, payload.cantidad);
  }
}
