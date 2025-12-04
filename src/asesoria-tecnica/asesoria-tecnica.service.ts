import { Injectable } from '@nestjs/common';
import { CreateAsesoriaTecnicaDto } from './dto/create-asesoria-tecnica.dto';
import { UpdateAsesoriaTecnicaDto } from './dto/update-asesoria-tecnica.dto';

@Injectable()
export class AsesoriaTecnicaService {
  create(createAsesoriaTecnicaDto: CreateAsesoriaTecnicaDto) {
    return 'This action adds a new asesoriaTecnica';
  }

  findAll() {
    return `This action returns all asesoriaTecnica`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asesoriaTecnica`;
  }

  update(id: number, updateAsesoriaTecnicaDto: UpdateAsesoriaTecnicaDto) {
    return `This action updates a #${id} asesoriaTecnica`;
  }

  remove(id: number) {
    return `This action removes a #${id} asesoriaTecnica`;
  }
}
