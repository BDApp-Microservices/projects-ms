import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyeccionSemanalService } from './proyeccion-semanal.service';
import { CreateProyeccionSemanalDto } from './dto/create-proyeccion-semanal.dto';
import { UpdateProyeccionSemanalDto } from './dto/update-proyeccion-semanal.dto';

@Controller()
export class ProyeccionSemanalController {
  constructor(private readonly proyeccionSemanalService: ProyeccionSemanalService) {}

  @MessagePattern('createProyeccionSemanal')
  create(@Payload() createProyeccionSemanalDto: CreateProyeccionSemanalDto) {
    return this.proyeccionSemanalService.create(createProyeccionSemanalDto);
  }

  @MessagePattern('findAllProyeccionSemanal')
  findAll() {
    return this.proyeccionSemanalService.findAll();
  }

  @MessagePattern('findOneProyeccionSemanal')
  findOne(@Payload() id: number) {
    return this.proyeccionSemanalService.findOne(id);
  }

  @MessagePattern('updateProyeccionSemanal')
  update(@Payload() updateProyeccionSemanalDto: UpdateProyeccionSemanalDto) {
    return this.proyeccionSemanalService.update(updateProyeccionSemanalDto.id, updateProyeccionSemanalDto);
  }

  @MessagePattern('removeProyeccionSemanal')
  remove(@Payload() id: number) {
    return this.proyeccionSemanalService.remove(id);
  }
}
