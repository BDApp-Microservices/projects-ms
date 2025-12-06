import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyectoRequisitoService } from './proyecto-requisito.service';
import { CreateProyectoRequisitoDto } from './dto/create-proyecto-requisito.dto';
import { UpdateProyectoRequisitoDto } from './dto/update-proyecto-requisito.dto';

@Controller()
export class ProyectoRequisitoController {
  constructor(private readonly proyectoRequisitoService: ProyectoRequisitoService) {}

  @MessagePattern('createProyectoRequisito')
  create(@Payload() createProyectoRequisitoDto: CreateProyectoRequisitoDto) {
    return this.proyectoRequisitoService.create(createProyectoRequisitoDto);
  }

  @MessagePattern('findAllProyectoRequisito')
  findAll() {
    return this.proyectoRequisitoService.findAll();
  }

  @MessagePattern('findOneProyectoRequisito')
  findOne(@Payload() id: number) {
    return this.proyectoRequisitoService.findOne(id);
  }

  @MessagePattern('updateProyectoRequisito')
  update(@Payload() updateProyectoRequisitoDto: UpdateProyectoRequisitoDto) {
    return this.proyectoRequisitoService.update(updateProyectoRequisitoDto.id, updateProyectoRequisitoDto);
  }

  @MessagePattern('removeProyectoRequisito')
  remove(@Payload() id: number) {
    return this.proyectoRequisitoService.remove(id);
  }
}
