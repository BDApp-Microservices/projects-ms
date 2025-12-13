import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuditoriaProyectoDto } from './dto/create-auditoria-proyecto.dto';
import { UpdateAuditoriaProyectoDto } from './dto/update-auditoria-proyecto.dto';
import { AuditoriaProyecto } from './entities/auditoria-proyecto.entity';

@Injectable()
export class AuditoriaProyectoService {
  constructor(
    @InjectRepository(AuditoriaProyecto)
    private readonly auditoriaProyectoRepository: Repository<AuditoriaProyecto>,
  ) { }

  async create(createAuditoriaProyectoDto: CreateAuditoriaProyectoDto) {
    const auditoria = this.auditoriaProyectoRepository.create({
      fechaBaja: createAuditoriaProyectoDto.fechaBaja,
      motivoPrincipal: createAuditoriaProyectoDto.motivoPrincipal,
      descripcion: createAuditoriaProyectoDto.descripcion,
      idProyecto: createAuditoriaProyectoDto.idProyecto as any, // TypeORM expects the relation
    });
    return await this.auditoriaProyectoRepository.save(auditoria);
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
