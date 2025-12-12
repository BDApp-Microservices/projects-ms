import { Injectable } from '@nestjs/common';
import { CreateProyectoProductoDto } from './dto/create-proyecto-producto.dto';
import { UpdateProyectoProductoDto } from './dto/update-proyecto-producto.dto';

@Injectable()
export class ProyectoProductoService {
  create(createProyectoProductoDto: CreateProyectoProductoDto) {
    return 'This action adds a new proyectoProducto';
  }

  findAll() {
    return `This action returns all proyectoProducto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proyectoProducto`;
  }

  update(id: number, updateProyectoProductoDto: UpdateProyectoProductoDto) {
    return `This action updates a #${id} proyectoProducto`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyectoProducto`;
  }
}
