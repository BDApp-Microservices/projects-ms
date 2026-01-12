import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateAuditoriaProyectoDto } from './dto/create-auditoria-proyecto.dto';
import { UpdateAuditoriaProyectoDto } from './dto/update-auditoria-proyecto.dto';
import { AuditoriaProyecto } from './entities/auditoria-proyecto.entity';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';
import { BaseResponseDto } from '../common/dto/base-response.dto';

@Injectable()
export class AuditoriaProyectoService {
  constructor(
    @InjectRepository(AuditoriaProyecto)
    private readonly auditoriaProyectoRepository: Repository<AuditoriaProyecto>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
  ) { }

  async create(createAuditoriaProyectoDto: CreateAuditoriaProyectoDto) {
    try {
      // 1. Verificar que el proyecto existe
      const proyecto = await this.proyectoRepository.findOne({
        where: { idProyecto: createAuditoriaProyectoDto.idProyecto },
      });

      if (!proyecto) {
        throw new RpcException({
          message: 'Proyecto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      // 2. Crear registro de auditoría con fecha automática
      const auditoria = this.auditoriaProyectoRepository.create({
        detallePerdida: createAuditoriaProyectoDto.detallePerdida,
        detalleTextual: createAuditoriaProyectoDto.detalleTextual,
        idProyecto: createAuditoriaProyectoDto.idProyecto as any,
      });
      const auditoriaGuardada = await this.auditoriaProyectoRepository.save(auditoria);

      // 3. Actualizar el estado del proyecto a PERDIDO automáticamente
      await this.proyectoRepository.update(
        createAuditoriaProyectoDto.idProyecto,
        { estado: 'PERDIDO' }
      );

      return BaseResponseDto.success(
        auditoriaGuardada,
        'Auditoría creada y proyecto marcado como perdido exitosamente',
        HttpStatus.CREATED,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al crear auditoría',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
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

      // Solo actualizar los campos permitidos: detallePerdida y detalleTextual
      if (updateAuditoriaProyectoDto.detallePerdida !== undefined) {
        auditoria.detallePerdida = updateAuditoriaProyectoDto.detallePerdida;
      }
      if (updateAuditoriaProyectoDto.detalleTextual !== undefined) {
        auditoria.detalleTextual = updateAuditoriaProyectoDto.detalleTextual;
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
