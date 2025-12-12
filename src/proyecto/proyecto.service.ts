import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { Proyecto } from './entities/proyecto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseResponseDto } from '../common/dto/base-response.dto';

@Injectable()
export class ProyectoService {
  constructor(
    @InjectRepository(Proyecto)
    private proyectoRepo: Repository<Proyecto>,
  ) {}

  async findAll(): Promise<BaseResponseDto<Proyecto[]>> {
    try {
      const proyectos = await this.proyectoRepo.find({
        relations: ['idCliente'],
        order: { fechaCreacion: 'DESC' },
      });

      return BaseResponseDto.success(
        proyectos,
        'Proyectos obtenidos exitosamente',
        200,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al obtener proyectos',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<Proyecto>> {
    try {
      const proyecto = await this.proyectoRepo.findOne({
        where: { idProyecto: id },
        relations: ['idCliente'],
      });

      if (!proyecto) {
        throw new RpcException({
          message: 'Proyecto no encontrado',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      return BaseResponseDto.success(
        proyecto,
        'Proyecto obtenido exitosamente',
        200,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al obtener proyecto',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  create(createProyectoDto: CreateProyectoDto) {
    return 'This action adds a new proyecto';
  }

  update(id: number, updateProyectoDto: UpdateProyectoDto) {
    return `This action updates a #${id} proyecto`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }
}
