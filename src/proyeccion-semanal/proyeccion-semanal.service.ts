import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProyeccionSemanalDto } from './dto/create-proyeccion-semanal.dto';
import { UpdateProyeccionSemanalDto } from './dto/update-proyeccion-semanal.dto';
import { ProyeccionSemanal } from './entities/proyeccion-semanal.entity';

@Injectable()
export class ProyeccionSemanalService {
  constructor(
    @InjectRepository(ProyeccionSemanal)
    private readonly proyeccionSemanalRepository: Repository<ProyeccionSemanal>,
  ) { }

  create(createProyeccionSemanalDto: CreateProyeccionSemanalDto) {
    return 'This action adds a new proyeccionSemanal';
  }

  findAll() {
    return `This action returns all proyeccionSemanal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proyeccionSemanal`;
  }

  /**
   * Obtiene todas las proyecciones semanales de una proyección específica
   * Ordenadas por fecha ascendente
   */
  async findByProyeccion(idProyeccion: string): Promise<ProyeccionSemanal[]> {
    return await this.proyeccionSemanalRepository
      .createQueryBuilder('proyeccionSemanal')
      .where('proyeccionSemanal.id_proyeccion = :idProyeccion', { idProyeccion })
      .orderBy('proyeccionSemanal.fecha', 'ASC')
      .getMany();
  }

  update(id: number, updateProyeccionSemanalDto: UpdateProyeccionSemanalDto) {
    return `This action updates a #${id} proyeccionSemanal`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyeccionSemanal`;
  }
}
