import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditoriaClienteService } from './auditoria-cliente.service';
import { CreateAuditoriaClienteDto } from './dto/create-auditoria-cliente.dto';
import { UpdateAuditoriaClienteDto } from './dto/update-auditoria-cliente.dto';

@Controller()
export class AuditoriaClienteController {
  constructor(private readonly auditoriaClienteService: AuditoriaClienteService) {}

  @MessagePattern('createAuditoriaCliente')
  create(@Payload() createAuditoriaClienteDto: CreateAuditoriaClienteDto) {
    return this.auditoriaClienteService.create(createAuditoriaClienteDto);
  }

  @MessagePattern('findAllAuditoriaCliente')
  findAll() {
    return this.auditoriaClienteService.findAll();
  }

  @MessagePattern('findOneAuditoriaCliente')
  findOne(@Payload() id: number) {
    return this.auditoriaClienteService.findOne(id);
  }

  @MessagePattern('updateAuditoriaCliente')
  update(@Payload() updateAuditoriaClienteDto: UpdateAuditoriaClienteDto) {
    return this.auditoriaClienteService.update(updateAuditoriaClienteDto.id, updateAuditoriaClienteDto);
  }

  @MessagePattern('removeAuditoriaCliente')
  remove(@Payload() id: number) {
    return this.auditoriaClienteService.remove(id);
  }
}
