import { Injectable } from '@nestjs/common';
import { CreateOportunidadDto } from './dto/create-oportunidad.dto';
import { UpdateOportunidadDto } from './dto/update-oportunidad.dto';

@Injectable()
export class OportunidadService {
  create(createOportunidadDto: CreateOportunidadDto) {
    return 'This action adds a new oportunidad';
  }

  findAll() {
    return `This action returns all oportunidad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} oportunidad`;
  }

  update(id: number, updateOportunidadDto: UpdateOportunidadDto) {
    return `This action updates a #${id} oportunidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} oportunidad`;
  }
}
