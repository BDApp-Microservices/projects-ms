import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OportunidadService } from './oportunidad.service';
import { CreateOportunidadDto } from './dto/create-oportunidad.dto';
import { UpdateOportunidadDto } from './dto/update-oportunidad.dto';

@Controller()
export class OportunidadController {
  constructor(private readonly oportunidadService: OportunidadService) {}

  @MessagePattern('createOportunidad')
  create(@Payload() createOportunidadDto: CreateOportunidadDto) {
    return this.oportunidadService.create(createOportunidadDto);
  }

  @MessagePattern('findAllOportunidad')
  findAll() {
    return this.oportunidadService.findAll();
  }

  @MessagePattern('findOneOportunidad')
  findOne(@Payload() id: number) {
    return this.oportunidadService.findOne(id);
  }

  @MessagePattern('updateOportunidad')
  update(@Payload() updateOportunidadDto: UpdateOportunidadDto) {
    return this.oportunidadService.update(updateOportunidadDto.id, updateOportunidadDto);
  }

  @MessagePattern('removeOportunidad')
  remove(@Payload() id: number) {
    return this.oportunidadService.remove(id);
  }
}
