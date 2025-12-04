import { Injectable } from '@nestjs/common';
import { CreateEvidenciaImagenDto } from './dto/create-evidencia-imagen.dto';
import { UpdateEvidenciaImagenDto } from './dto/update-evidencia-imagen.dto';

@Injectable()
export class EvidenciaImagenService {
  create(createEvidenciaImagenDto: CreateEvidenciaImagenDto) {
    return 'This action adds a new evidenciaImagen';
  }

  findAll() {
    return `This action returns all evidenciaImagen`;
  }

  findOne(id: number) {
    return `This action returns a #${id} evidenciaImagen`;
  }

  update(id: number, updateEvidenciaImagenDto: UpdateEvidenciaImagenDto) {
    return `This action updates a #${id} evidenciaImagen`;
  }

  remove(id: number) {
    return `This action removes a #${id} evidenciaImagen`;
  }
}
