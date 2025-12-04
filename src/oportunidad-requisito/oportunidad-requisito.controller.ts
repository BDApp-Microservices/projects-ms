import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OportunidadRequisitoService } from './oportunidad-requisito.service';
import { CreateOportunidadRequisitoDto } from './dto/create-oportunidad-requisito.dto';
import { UpdateOportunidadRequisitoDto } from './dto/update-oportunidad-requisito.dto';

@Controller()
export class OportunidadRequisitoController {
  constructor(private readonly oportunidadRequisitoService: OportunidadRequisitoService) {}

  @MessagePattern('createOportunidadRequisito')
  create(@Payload() createOportunidadRequisitoDto: CreateOportunidadRequisitoDto) {
    return this.oportunidadRequisitoService.create(createOportunidadRequisitoDto);
  }

  @MessagePattern('findAllOportunidadRequisito')
  findAll() {
    return this.oportunidadRequisitoService.findAll();
  }

  @MessagePattern('findOneOportunidadRequisito')
  findOne(@Payload() id: number) {
    return this.oportunidadRequisitoService.findOne(id);
  }

  @MessagePattern('updateOportunidadRequisito')
  update(@Payload() updateOportunidadRequisitoDto: UpdateOportunidadRequisitoDto) {
    return this.oportunidadRequisitoService.update(updateOportunidadRequisitoDto.id, updateOportunidadRequisitoDto);
  }

  @MessagePattern('removeOportunidadRequisito')
  remove(@Payload() id: number) {
    return this.oportunidadRequisitoService.remove(id);
  }
}
