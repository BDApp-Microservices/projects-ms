import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyeccionService } from './proyeccion.service';
import { CreateProyeccionDto } from './dto/create-proyeccion.dto';
import { UpdateProyeccionDto } from './dto/update-proyeccion.dto';

@Controller()
export class ProyeccionController {
  constructor(private readonly proyeccionService: ProyeccionService) {}

  @MessagePattern('createProyeccion')
  create(@Payload() createProyeccionDto: CreateProyeccionDto) {
    return this.proyeccionService.create(createProyeccionDto);
  }

  @MessagePattern('findAllProyeccion')
  findAll() {
    return this.proyeccionService.findAll();
  }

  @MessagePattern('findOneProyeccion')
  findOne(@Payload() id: number) {
    return this.proyeccionService.findOne(id);
  }

  @MessagePattern('updateProyeccion')
  update(@Payload() updateProyeccionDto: UpdateProyeccionDto) {
    return this.proyeccionService.update(updateProyeccionDto.id, updateProyeccionDto);
  }

  @MessagePattern('removeProyeccion')
  remove(@Payload() id: number) {
    return this.proyeccionService.remove(id);
  }
}
