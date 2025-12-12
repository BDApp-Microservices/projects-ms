import { Injectable } from '@nestjs/common';
import { CreateProyeccionSemanalDto } from './dto/create-proyeccion-semanal.dto';
import { UpdateProyeccionSemanalDto } from './dto/update-proyeccion-semanal.dto';

@Injectable()
export class ProyeccionSemanalService {
  create(createProyeccionSemanalDto: CreateProyeccionSemanalDto) {
    return 'This action adds a new proyeccionSemanal';
  }

  findAll() {
    return `This action returns all proyeccionSemanal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proyeccionSemanal`;
  }

  update(id: number, updateProyeccionSemanalDto: UpdateProyeccionSemanalDto) {
    return `This action updates a #${id} proyeccionSemanal`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyeccionSemanal`;
  }
}
