import { HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProyectoArchivoDto } from './dto/create-proyecto-archivo.dto';
import { UpdateProyectoArchivoDto } from './dto/update-proyecto-archivo.dto';
import { ProyectoArchivo } from './entities/proyecto-archivo.entity';
import { GcsStorageService } from 'src/gcs-storage/gcs-storage.service';
import { RpcException } from '@nestjs/microservices';

interface CreateProyectoArchivoWithFileDto extends CreateProyectoArchivoDto {
  base64Data?: string;
  fileName?: string;
  mimeType?: string;
}

@Injectable()
export class ProyectoArchivoService {
  private readonly logger = new Logger(ProyectoArchivoService.name);
  private readonly FOLDER_NAME = 'proyecto-archivos';

  constructor(
    @InjectRepository(ProyectoArchivo)
    private readonly proyectoArchivoRepository: Repository<ProyectoArchivo>,
    private readonly gcsStorageService: GcsStorageService,
  ) { }

  /**
   * Crea un nuevo registro de archivo de proyecto
   * Si se proporciona base64Data, sube el archivo a GCS
   */
  async create(
    createDto: CreateProyectoArchivoWithFileDto,
  ): Promise<ProyectoArchivo> {
    let archivoUrl = createDto.archivoUrl;

    // Si se proporciona archivo en base64, subirlo a GCS
    if (createDto.base64Data && createDto.fileName && createDto.mimeType) {
      const filePath = await this.gcsStorageService.uploadFileFromBase64(
        createDto.base64Data,
        createDto.fileName,
        this.FOLDER_NAME,
        createDto.mimeType,
      );
      archivoUrl = filePath;
    }

    const proyectoArchivo = this.proyectoArchivoRepository.create({
      archivoUrl,
      tipoArchivo: createDto.tipoArchivo,
      idProyecto: { idProyecto: createDto.idProyecto } as any,
    });

    return this.proyectoArchivoRepository.save(proyectoArchivo);
  }

  /**
   * Obtiene todos los archivos
   */
  async findAll(): Promise<ProyectoArchivo[]> {
    return this.proyectoArchivoRepository.find({
      relations: ['idProyecto'],
    });
  }

  /**
   * Obtiene un archivo por su ID
   */
  async findOne(id: string): Promise<ProyectoArchivo> {
    const archivo = await this.proyectoArchivoRepository.findOne({
      where: { idProyectoArchivo: id },
      relations: ['idProyecto'],
    });

    if (!archivo) {
      throw new RpcException({
        message: `Archivo con id ${id} no encontrado`,
        code: HttpStatus.NOT_FOUND,
      });
    }

    return archivo;
  }

  /**
   * Obtiene todos los archivos de un proyecto específico
   */
  async findByProyecto(idProyecto: string): Promise<ProyectoArchivo[]> {
    return this.proyectoArchivoRepository.find({
      where: { idProyecto: { idProyecto } },
      relations: ['idProyecto'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  /**
   * Obtiene archivos de un proyecto con URLs firmadas
   */
  async findByProyectoWithSignedUrls(
    idProyecto: string,
  ): Promise<(ProyectoArchivo & { signedUrl: string })[]> {
    const archivos = await this.findByProyecto(idProyecto);

    const archivosConUrl = await Promise.all(
      archivos.map(async (archivo) => {
        const signedUrl = await this.gcsStorageService.getSignedUrl(
          archivo.archivoUrl,
          60, // 60 minutos de expiración
        );
        return { ...archivo, signedUrl };
      }),
    );

    return archivosConUrl;
  }

  /**
   * Actualiza un archivo de proyecto
   */
  async update(
    id: string,
    updateDto: UpdateProyectoArchivoDto,
  ): Promise<ProyectoArchivo> {
    const archivo = await this.findOne(id);

    Object.assign(archivo, updateDto);
    return this.proyectoArchivoRepository.save(archivo);
  }

  /**
   * Elimina un archivo de proyecto (y opcionalmente de GCS)
   */
  async remove(id: string): Promise<{ deleted: boolean }> {
    const archivo = await this.findOne(id);

    // Intentar eliminar de GCS si existe el archivo
    try {
      const exists = await this.gcsStorageService.fileExists(
        archivo.archivoUrl,
      );
      if (exists) {
        await this.gcsStorageService.deleteFile(archivo.archivoUrl);
      }
    } catch (error) {
      this.logger.warn(
        `No se pudo eliminar archivo de GCS: ${archivo.archivoUrl}`,
        error,
      );
    }

    await this.proyectoArchivoRepository.remove(archivo);
    return { deleted: true };
  }

  /**
   * Genera URL firmada para un archivo específico
   */
  async getSignedUrl(id: string): Promise<{ signedUrl: string }> {
    const archivo = await this.findOne(id);
    const signedUrl = await this.gcsStorageService.getSignedUrl(
      archivo.archivoUrl,
      60,
    );
    return { signedUrl };
  }
}
