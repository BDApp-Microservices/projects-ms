import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProyectoArchivoService } from './proyecto-archivo.service';
import { CreateProyectoArchivoDto } from './dto/create-proyecto-archivo.dto';
import { UpdateProyectoArchivoDto } from './dto/update-proyecto-archivo.dto';

interface CreateWithFilePayload extends CreateProyectoArchivoDto {
  base64Data?: string;
  fileName?: string;
  mimeType?: string;
}

@Controller()
export class ProyectoArchivoController {
  constructor(
    private readonly proyectoArchivoService: ProyectoArchivoService,
  ) { }

  @MessagePattern('createProyectoArchivo')
  create(@Payload() createProyectoArchivoDto: CreateWithFilePayload) {
    return this.proyectoArchivoService.create(createProyectoArchivoDto);
  }

  @MessagePattern('findAllProyectoArchivo')
  findAll() {
    return this.proyectoArchivoService.findAll();
  }

  @MessagePattern('findOneProyectoArchivo')
  findOne(@Payload() id: string) {
    return this.proyectoArchivoService.findOne(id);
  }

  @MessagePattern('findProyectoArchivoByProyecto')
  findByProyecto(@Payload() idProyecto: string) {
    return this.proyectoArchivoService.findByProyectoWithSignedUrls(idProyecto);
  }

  @MessagePattern('updateProyectoArchivo')
  update(@Payload() updateProyectoArchivoDto: UpdateProyectoArchivoDto) {
    return this.proyectoArchivoService.update(
      updateProyectoArchivoDto.id,
      updateProyectoArchivoDto,
    );
  }

  @MessagePattern('removeProyectoArchivo')
  remove(@Payload() id: string) {
    return this.proyectoArchivoService.remove(id);
  }

  @MessagePattern('getProyectoArchivoSignedUrl')
  getSignedUrl(@Payload() id: string) {
    return this.proyectoArchivoService.getSignedUrl(id);
  }
}
