import { Injectable } from '@nestjs/common';
import { CreateAuditoriaProyectoDto } from './dto/create-auditoria-proyecto.dto';
import { UpdateAuditoriaProyectoDto } from './dto/update-auditoria-proyecto.dto';

@Injectable()
export class AuditoriaProyectoService {
  create(createAuditoriaProyectoDto: CreateAuditoriaProyectoDto) {
    return 'This action adds a new auditoriaProyecto';
  }

  findAll() {
    return `This action returns all auditoriaProyecto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditoriaProyecto`;
  }

  update(id: number, updateAuditoriaProyectoDto: UpdateAuditoriaProyectoDto) {
    return `This action updates a #${id} auditoriaProyecto`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditoriaProyecto`;
  }
}
