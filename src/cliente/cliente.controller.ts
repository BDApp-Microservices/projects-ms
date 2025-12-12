import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller()
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @MessagePattern('createCliente')
  create(@Payload() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }

  @MessagePattern('findAllCliente')
  findAll() {
    return this.clienteService.findAll();
  }

  @MessagePattern('findOneCliente')
  findOne(@Payload() id: string) {
    return this.clienteService.findOne(id);
  }

  @MessagePattern('updateCliente')
  update(@Payload() updateClienteDto: UpdateClienteDto) {
    return this.clienteService.update(updateClienteDto.id, updateClienteDto);
  }

  @MessagePattern('removeCliente')
  remove(@Payload() id: number) {
    return this.clienteService.remove(id);
  }
}
