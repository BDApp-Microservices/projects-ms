import { Injectable } from '@nestjs/common';
import { CreateProyectoArchivoDto } from './dto/create-proyecto-archivo.dto';
import { UpdateProyectoArchivoDto } from './dto/update-proyecto-archivo.dto';

@Injectable()
export class ProyectoArchivoService {
  create(createProyectoArchivoDto: CreateProyectoArchivoDto) {
    return 'This action adds a new proyectoArchivo';
  }

  findAll() {
    return `This action returns all proyectoArchivo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proyectoArchivo`;
  }

  update(id: number, updateProyectoArchivoDto: UpdateProyectoArchivoDto) {
    return `This action updates a #${id} proyectoArchivo`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyectoArchivo`;
  }
}
