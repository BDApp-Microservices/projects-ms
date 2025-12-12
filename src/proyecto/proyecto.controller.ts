import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@Controller()
export class ProyectoController {
  constructor(private readonly proyectoService: ProyectoService) {}

  @MessagePattern('createProyecto')
  create(@Payload() createProyectoDto: CreateProyectoDto) {
    return this.proyectoService.create(createProyectoDto);
  }

  @MessagePattern('findAllProyecto')
  findAll() {
    return this.proyectoService.findAll();
  }

  @MessagePattern('findOneProyecto')
  findOne(@Payload() id: string) {
    return this.proyectoService.findOne(id);
  }

  @MessagePattern('updateProyecto')
  update(@Payload() updateProyectoDto: UpdateProyectoDto) {
    return this.proyectoService.update(updateProyectoDto.id, updateProyectoDto);
  }

  @MessagePattern('removeProyecto')
  remove(@Payload() id: number) {
    return this.proyectoService.remove(id);
  }
}
