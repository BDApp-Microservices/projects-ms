import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyectoProductoService } from './proyecto-producto.service';

@Controller()
export class ProyectoProductoController {
  constructor(
    private readonly proyectoProductoService: ProyectoProductoService,
  ) {}

  @MessagePattern('findProductosByProyecto')
  findByProyecto(@Payload() idProyecto: string) {
    return this.proyectoProductoService.findByProyecto(idProyecto);
  }

  @MessagePattern('findAllProyectoProducto')
  findAll(@Payload() payload?: { includeInactive?: boolean }) {
    const includeInactive = payload?.includeInactive ?? true;
    return this.proyectoProductoService.findAll(includeInactive);
  }

  @MessagePattern('findOneProyectoProducto')
  findOne(@Payload() idProyectoProducto: string) {
    return this.proyectoProductoService.findOne(idProyectoProducto);
  }

  @MessagePattern('updateProyectoProducto')
  update(@Payload() payload: { idProyectoProducto: string; data: any }) {
    return this.proyectoProductoService.update(
      payload.idProyectoProducto,
      payload.data,
    );
  }

  @MessagePattern('softDeleteProyectoProducto')
  softDelete(@Payload() idProyectoProducto: string) {
    return this.proyectoProductoService.softDelete(idProyectoProducto);
  }

  @MessagePattern('reactivateProyectoProducto')
  reactivate(@Payload() idProyectoProducto: string) {
    return this.proyectoProductoService.reactivate(idProyectoProducto);
  }

  @MessagePattern('exportarSeguimientoExcel')
  exportarExcel(@Payload() dto: { columnas?: string[] }) {
    return this.proyectoProductoService.exportarExcel(dto);
  }
}
