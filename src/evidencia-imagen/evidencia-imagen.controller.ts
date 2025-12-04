import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EvidenciaImagenService } from './evidencia-imagen.service';
import { CreateEvidenciaImagenDto } from './dto/create-evidencia-imagen.dto';
import { UpdateEvidenciaImagenDto } from './dto/update-evidencia-imagen.dto';

@Controller()
export class EvidenciaImagenController {
  constructor(private readonly evidenciaImagenService: EvidenciaImagenService) {}

  @MessagePattern('createEvidenciaImagen')
  create(@Payload() createEvidenciaImagenDto: CreateEvidenciaImagenDto) {
    return this.evidenciaImagenService.create(createEvidenciaImagenDto);
  }

  @MessagePattern('findAllEvidenciaImagen')
  findAll() {
    return this.evidenciaImagenService.findAll();
  }

  @MessagePattern('findOneEvidenciaImagen')
  findOne(@Payload() id: number) {
    return this.evidenciaImagenService.findOne(id);
  }

  @MessagePattern('updateEvidenciaImagen')
  update(@Payload() updateEvidenciaImagenDto: UpdateEvidenciaImagenDto) {
    return this.evidenciaImagenService.update(updateEvidenciaImagenDto.id, updateEvidenciaImagenDto);
  }

  @MessagePattern('removeEvidenciaImagen')
  remove(@Payload() id: number) {
    return this.evidenciaImagenService.remove(id);
  }
}
