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
}
