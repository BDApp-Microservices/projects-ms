import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProyectoProductoDto } from './dto/create-proyecto-producto.dto';
import { ProyectoProducto } from './entities/proyecto-producto.entity';

@Injectable()
export class ProyectoProductoService {
  constructor(
    @InjectRepository(ProyectoProducto)
    private readonly proyectoProductoRepository: Repository<ProyectoProducto>,
  ) { }

  async createMany(createDtos: CreateProyectoProductoDto[]) {
    const proyectoProductos = this.proyectoProductoRepository.create(createDtos);
    return await this.proyectoProductoRepository.save(proyectoProductos);
  }

  async findByProyecto(idProyecto: string) {
    return await this.proyectoProductoRepository.find({
      where: { idProyecto },
    });
  }

  async deleteByProyecto(idProyecto: string) {
    return await this.proyectoProductoRepository.delete({ idProyecto });
  }
}
