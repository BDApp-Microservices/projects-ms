import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditoriaProyectoService } from './auditoria-proyecto.service';
import { CreateAuditoriaProyectoDto } from './dto/create-auditoria-proyecto.dto';
import { UpdateAuditoriaProyectoDto } from './dto/update-auditoria-proyecto.dto';

@Controller()
export class AuditoriaProyectoController {
  constructor(private readonly auditoriaProyectoService: AuditoriaProyectoService) {}

  @MessagePattern('createAuditoriaProyecto')
  create(@Payload() createAuditoriaProyectoDto: CreateAuditoriaProyectoDto) {
    return this.auditoriaProyectoService.create(createAuditoriaProyectoDto);
  }

  @MessagePattern('findAllAuditoriaProyecto')
  findAll() {
    return this.auditoriaProyectoService.findAll();
  }

  @MessagePattern('findOneAuditoriaProyecto')
  findOne(@Payload() id: number) {
    return this.auditoriaProyectoService.findOne(id);
  }

  @MessagePattern('updateAuditoriaProyecto')
  update(@Payload() updateAuditoriaProyectoDto: UpdateAuditoriaProyectoDto) {
    return this.auditoriaProyectoService.update(updateAuditoriaProyectoDto.id, updateAuditoriaProyectoDto);
  }

  @MessagePattern('removeAuditoriaProyecto')
  remove(@Payload() id: number) {
    return this.auditoriaProyectoService.remove(id);
  }
}
