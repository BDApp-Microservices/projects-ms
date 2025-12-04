import { Injectable } from '@nestjs/common';
import { CreateAuditoriaClienteDto } from './dto/create-auditoria-cliente.dto';
import { UpdateAuditoriaClienteDto } from './dto/update-auditoria-cliente.dto';

@Injectable()
export class AuditoriaClienteService {
  create(createAuditoriaClienteDto: CreateAuditoriaClienteDto) {
    return 'This action adds a new auditoriaCliente';
  }

  findAll() {
    return `This action returns all auditoriaCliente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditoriaCliente`;
  }

  update(id: number, updateAuditoriaClienteDto: UpdateAuditoriaClienteDto) {
    return `This action updates a #${id} auditoriaCliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditoriaCliente`;
  }
}
