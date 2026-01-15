import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyectoArchivoService } from './proyecto-archivo.service';
import { CreateProyectoArchivoDto } from './dto/create-proyecto-archivo.dto';
import { UpdateProyectoArchivoDto } from './dto/update-proyecto-archivo.dto';

@Controller()
export class ProyectoArchivoController {
  constructor(private readonly proyectoArchivoService: ProyectoArchivoService) {}

  @MessagePattern('createProyectoArchivo')
  create(@Payload() createProyectoArchivoDto: CreateProyectoArchivoDto) {
    return this.proyectoArchivoService.create(createProyectoArchivoDto);
  }

  @MessagePattern('findAllProyectoArchivo')
  findAll() {
    return this.proyectoArchivoService.findAll();
  }

  @MessagePattern('findOneProyectoArchivo')
  findOne(@Payload() id: number) {
    return this.proyectoArchivoService.findOne(id);
  }

  @MessagePattern('updateProyectoArchivo')
  update(@Payload() updateProyectoArchivoDto: UpdateProyectoArchivoDto) {
    return this.proyectoArchivoService.update(updateProyectoArchivoDto.id, updateProyectoArchivoDto);
  }

  @MessagePattern('removeProyectoArchivo')
  remove(@Payload() id: number) {
    return this.proyectoArchivoService.remove(id);
  }
}
