import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateAuditoriaProyectoDto } from './dto/create-auditoria-proyecto.dto';
import { UpdateAuditoriaProyectoDto } from './dto/update-auditoria-proyecto.dto';
import { AuditoriaProyecto } from './entities/auditoria-proyecto.entity';
import { BaseResponseDto } from '../common/dto/base-response.dto';

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

  async findAll(): Promise<BaseResponseDto<AuditoriaProyecto[]>> {
    try {
      const auditorias = await this.auditoriaProyectoRepository.find({
        relations: ['idProyecto'],
        order: { fechaCreacion: 'DESC' },
      });

      return BaseResponseDto.success(
        auditorias,
        'Auditorías obtenidas exitosamente',
        200,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al obtener auditorías',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<AuditoriaProyecto>> {
    try {
      const auditoria = await this.auditoriaProyectoRepository.findOne({
        where: { idAuditoriaProyecto: id },
        relations: ['idProyecto'],
      });

      if (!auditoria) {
        throw new RpcException({
          message: 'Auditoría no encontrada',
          statusCode: 404,
        });
      }

      return BaseResponseDto.success(
        auditoria,
        'Auditoría obtenida exitosamente',
        200,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al obtener auditoría',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  async update(id: string, updateAuditoriaProyectoDto: UpdateAuditoriaProyectoDto): Promise<BaseResponseDto<AuditoriaProyecto>> {
    try {
      const auditoria = await this.auditoriaProyectoRepository.findOne({
        where: { idAuditoriaProyecto: id },
        relations: ['idProyecto'],
      });

      if (!auditoria) {
        throw new RpcException({
          message: 'Auditoría no encontrada',
          statusCode: 404,
        });
      }

      // Solo actualizar los campos permitidos: motivoPrincipal y descripcion
      if (updateAuditoriaProyectoDto.motivoPrincipal !== undefined) {
        auditoria.motivoPrincipal = updateAuditoriaProyectoDto.motivoPrincipal;
      }
      if (updateAuditoriaProyectoDto.descripcion !== undefined) {
        auditoria.descripcion = updateAuditoriaProyectoDto.descripcion;
      }

      const auditoriaActualizada = await this.auditoriaProyectoRepository.save(auditoria);

      return BaseResponseDto.success(
        auditoriaActualizada,
        'Auditoría actualizada exitosamente',
        200,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al actualizar auditoría',
        statusCode: 500,
        error: error.message,
      });
    }
  }

  remove(id: number) {
    return `This action removes a #${id} auditoriaProyecto`;
  }
}
