import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateAsesoriaTecnicaDto } from './dto/create-asesoria-tecnica.dto';
import { UpdateAsesoriaTecnicaDto } from './dto/update-asesoria-tecnica.dto';
import { AsesoriaTecnica } from './entities/asesoria-tecnica.entity';
import { EvidenciaImagen } from '../evidencia-imagen/entities/evidencia-imagen.entity';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Injectable()
export class AsesoriaTecnicaService {
  constructor(
    @InjectRepository(AsesoriaTecnica)
    private asesoriaTecnicaRepository: Repository<AsesoriaTecnica>,
    @InjectRepository(EvidenciaImagen)
    private evidenciaImagenRepository: Repository<EvidenciaImagen>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async createWithFiles(payload: any): Promise<BaseResponseDto<AsesoriaTecnica>> {
    try {
      const { files, descripciones, ...asesoriaData } = payload;

      // Crear la asesoría técnica
      const asesoria = this.asesoriaTecnicaRepository.create({
        fecha: asesoriaData.fecha,
        observaciones: asesoriaData.observaciones,
        responsable: asesoriaData.responsable,
        registradoPor: asesoriaData.registradoPor,
        idProyecto: { idProyecto: asesoriaData.idProyecto } as any,
      });

      const asesoriaGuardada = await this.asesoriaTecnicaRepository.save(asesoria);

      // Subir imágenes a Cloudinary y guardar evidencias
      if (files && files.length > 0) {
        const evidencias: EvidenciaImagen[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Convertir el objeto de archivo serializado a formato Buffer
          const fileBuffer = Buffer.from(file.buffer.data || file.buffer);
          const fileToUpload: Express.Multer.File = {
            ...file,
            buffer: fileBuffer,
          };

          try {
            const imageUrl = await this.cloudinaryService.uploadImage(
              fileToUpload,
              'asesoria-tecnica',
            );

            const evidencia = this.evidenciaImagenRepository.create({
              imagenUrl: imageUrl,
              descripcion: descripciones?.[i] || undefined,
              idAsesoriaTecnica: asesoriaGuardada,
            });

            evidencias.push(evidencia);
          } catch (uploadError) {
            console.error(`Error uploading image ${i}:`, uploadError);
            // Continuar con las demás imágenes si una falla
          }
        }

        if (evidencias.length > 0) {
          await this.evidenciaImagenRepository.save(evidencias);
        }
      }

      // Retornar la asesoría con sus evidencias
      const asesoriaCompleta = await this.asesoriaTecnicaRepository.findOne({
        where: { idAsesoriaTecnica: asesoriaGuardada.idAsesoriaTecnica },
        relations: ['evidenciasImagen', 'idProyecto'],
      });

      return BaseResponseDto.success(
        asesoriaCompleta,
        'Asesoría técnica creada exitosamente',
        HttpStatus.CREATED,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al crear la asesoría técnica',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async create(createAsesoriaTecnicaDto: CreateAsesoriaTecnicaDto): Promise<BaseResponseDto<AsesoriaTecnica>> {
    try {
      const asesoria = this.asesoriaTecnicaRepository.create({
        fecha: createAsesoriaTecnicaDto.fecha,
        observaciones: createAsesoriaTecnicaDto.observaciones,
        responsable: createAsesoriaTecnicaDto.responsable,
        registradoPor: createAsesoriaTecnicaDto.registradoPor,
        idProyecto: { idProyecto: createAsesoriaTecnicaDto.idProyecto } as any,
      });

      const asesoriaGuardada = await this.asesoriaTecnicaRepository.save(asesoria);

      // Crear las evidencias de imágenes si existen
      if (createAsesoriaTecnicaDto.imagenes && createAsesoriaTecnicaDto.imagenes.length > 0) {
        const evidencias = createAsesoriaTecnicaDto.imagenes.map((imagen) =>
          this.evidenciaImagenRepository.create({
            imagenUrl: imagen.imagenUrl,
            descripcion: imagen.descripcion || undefined,
            idAsesoriaTecnica: asesoriaGuardada,
          })
        );
        await this.evidenciaImagenRepository.save(evidencias);
      }

      return BaseResponseDto.success(
        asesoriaGuardada,
        'Asesoría técnica creada exitosamente',
        HttpStatus.CREATED,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al crear la asesoría técnica',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async findAll(filtros?: {
    idProyecto?: string;
    fechaInicio?: string;
    fechaFin?: string;
    responsable?: string;
  }): Promise<BaseResponseDto<AsesoriaTecnica[]>> {
    try {
      const queryBuilder = this.asesoriaTecnicaRepository
        .createQueryBuilder('asesoria')
        .leftJoinAndSelect('asesoria.idProyecto', 'proyecto')
        .leftJoinAndSelect('asesoria.evidenciasImagen', 'evidencias');

      // Filtro por proyecto
      if (filtros?.idProyecto && filtros.idProyecto.trim() !== '') {
        queryBuilder.andWhere('proyecto.idProyecto = :idProyecto', { idProyecto: filtros.idProyecto.trim() });
      }

      // Filtro por fecha de inicio
      if (filtros?.fechaInicio && filtros.fechaInicio.trim() !== '') {
        queryBuilder.andWhere('asesoria.fecha >= :fechaInicio', { fechaInicio: filtros.fechaInicio.trim() });
      }

      // Filtro por fecha de fin
      if (filtros?.fechaFin && filtros.fechaFin.trim() !== '') {
        queryBuilder.andWhere('asesoria.fecha <= :fechaFin', { fechaFin: filtros.fechaFin.trim() });
      }

      // Filtro por responsable
      if (filtros?.responsable && filtros.responsable.trim() !== '') {
        queryBuilder.andWhere('LOWER(asesoria.responsable) LIKE LOWER(:responsable)', {
          responsable: `%${filtros.responsable.trim()}%`,
        });
      }

      queryBuilder.orderBy('asesoria.fecha', 'DESC');

      const asesorias = await queryBuilder.getMany();

      return BaseResponseDto.success(
        asesorias,
        `Se encontraron ${asesorias.length} asesoría(s) técnica(s)`,
        HttpStatus.OK,
      );
    } catch (error) {
      throw new RpcException({
        message: 'Error al obtener las asesorías técnicas',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async findOne(id: string): Promise<BaseResponseDto<AsesoriaTecnica>> {
    try {
      const asesoria = await this.asesoriaTecnicaRepository.findOne({
        where: { idAsesoriaTecnica: id },
        relations: ['idProyecto', 'evidenciasImagen'],
      });

      if (!asesoria) {
        throw new RpcException({
          message: 'Asesoría técnica no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      return BaseResponseDto.success(
        asesoria,
        'Asesoría técnica encontrada exitosamente',
        HttpStatus.OK,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al obtener la asesoría técnica',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async update(id: string, updateAsesoriaTecnicaDto: Partial<CreateAsesoriaTecnicaDto>): Promise<BaseResponseDto<AsesoriaTecnica>> {
    try {
      const asesoria = await this.asesoriaTecnicaRepository.findOne({
        where: { idAsesoriaTecnica: id },
      });

      if (!asesoria) {
        throw new RpcException({
          message: 'Asesoría técnica no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      // Actualizar solo los campos permitidos
      if (updateAsesoriaTecnicaDto.fecha) asesoria.fecha = updateAsesoriaTecnicaDto.fecha;
      if (updateAsesoriaTecnicaDto.observaciones !== undefined) asesoria.observaciones = updateAsesoriaTecnicaDto.observaciones;
      if (updateAsesoriaTecnicaDto.responsable) asesoria.responsable = updateAsesoriaTecnicaDto.responsable;

      const asesoriaActualizada = await this.asesoriaTecnicaRepository.save(asesoria);

      // Actualizar imágenes si se proporcionan
      if (updateAsesoriaTecnicaDto.imagenes) {
        // Eliminar imágenes antiguas
        await this.evidenciaImagenRepository.delete({ idAsesoriaTecnica: { idAsesoriaTecnica: id } as any });

        // Crear nuevas imágenes
        if (updateAsesoriaTecnicaDto.imagenes.length > 0) {
          const evidencias = updateAsesoriaTecnicaDto.imagenes.map((imagen) =>
            this.evidenciaImagenRepository.create({
              imagenUrl: imagen.imagenUrl,
              descripcion: imagen.descripcion || undefined,
              idAsesoriaTecnica: asesoriaActualizada,
            })
          );
          await this.evidenciaImagenRepository.save(evidencias);
        }
      }

      return BaseResponseDto.success(
        asesoriaActualizada,
        'Asesoría técnica actualizada exitosamente',
        HttpStatus.OK,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al actualizar la asesoría técnica',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  async remove(id: string): Promise<BaseResponseDto<void>> {
    try {
      const asesoria = await this.asesoriaTecnicaRepository.findOne({
        where: { idAsesoriaTecnica: id },
      });

      if (!asesoria) {
        throw new RpcException({
          message: 'Asesoría técnica no encontrada',
          statusCode: HttpStatus.NOT_FOUND,
        });
      }

      // Eliminar imágenes asociadas primero
      await this.evidenciaImagenRepository.delete({ idAsesoriaTecnica: { idAsesoriaTecnica: id } as any });

      // Eliminar la asesoría
      await this.asesoriaTecnicaRepository.remove(asesoria);

      return BaseResponseDto.success(
        null,
        'Asesoría técnica eliminada exitosamente',
        HttpStatus.OK,
      );
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        message: 'Error al eliminar la asesoría técnica',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }
}
