import { Injectable } from '@nestjs/common';
import { CreateOportunidadRequisitoDto } from './dto/create-oportunidad-requisito.dto';
import { UpdateOportunidadRequisitoDto } from './dto/update-oportunidad-requisito.dto';

@Injectable()
export class OportunidadRequisitoService {
  create(createOportunidadRequisitoDto: CreateOportunidadRequisitoDto) {
    return 'This action adds a new oportunidadRequisito';
  }

  findAll() {
    return `This action returns all oportunidadRequisito`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oportunidadRequisito`;
  }

  update(id: number, updateOportunidadRequisitoDto: UpdateOportunidadRequisitoDto) {
    return `This action updates a #${id} oportunidadRequisito`;
  }

  remove(id: number) {
    return `This action removes a #${id} oportunidadRequisito`;
  }
}
