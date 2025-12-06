import { Injectable } from '@nestjs/common';
import { CreateProyectoRequisitoDto } from './dto/create-proyecto-requisito.dto';
import { UpdateProyectoRequisitoDto } from './dto/update-proyecto-requisito.dto';

@Injectable()
export class ProyectoRequisitoService {
  create(createProyectoRequisitoDto: CreateProyectoRequisitoDto) {
    return 'This action adds a new proyectoRequisito';
  }

  findAll() {
    return `This action returns all proyectoRequisito`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proyectoRequisito`;
  }

  update(id: number, updateProyectoRequisitoDto: UpdateProyectoRequisitoDto) {
    return `This action updates a #${id} proyectoRequisito`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyectoRequisito`;
  }
}
