import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyectoProductoService } from './proyecto-producto.service';
import { CreateProyectoProductoDto } from './dto/create-proyecto-producto.dto';
import { UpdateProyectoProductoDto } from './dto/update-proyecto-producto.dto';

@Controller()
export class ProyectoProductoController {
  constructor(private readonly proyectoProductoService: ProyectoProductoService) {}

  @MessagePattern('createProyectoProducto')
  create(@Payload() createProyectoProductoDto: CreateProyectoProductoDto) {
    return this.proyectoProductoService.create(createProyectoProductoDto);
  }

  @MessagePattern('findAllProyectoProducto')
  findAll() {
    return this.proyectoProductoService.findAll();
  }

  @MessagePattern('findOneProyectoProducto')
  findOne(@Payload() id: number) {
    return this.proyectoProductoService.findOne(id);
  }

  @MessagePattern('updateProyectoProducto')
  update(@Payload() updateProyectoProductoDto: UpdateProyectoProductoDto) {
    return this.proyectoProductoService.update(updateProyectoProductoDto.id, updateProyectoProductoDto);
  }

  @MessagePattern('removeProyectoProducto')
  remove(@Payload() id: number) {
    return this.proyectoProductoService.remove(id);
  }
}
