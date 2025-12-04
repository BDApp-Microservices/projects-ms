import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequisitoService } from './requisito.service';
import { CreateRequisitoDto } from './dto/create-requisito.dto';
import { UpdateRequisitoDto } from './dto/update-requisito.dto';

@Controller()
export class RequisitoController {
  constructor(private readonly requisitoService: RequisitoService) {}

  @MessagePattern('createRequisito')
  create(@Payload() createRequisitoDto: CreateRequisitoDto) {
    return this.requisitoService.create(createRequisitoDto);
  }

  @MessagePattern('findAllRequisito')
  findAll() {
    return this.requisitoService.findAll();
  }

  @MessagePattern('findOneRequisito')
  findOne(@Payload() id: number) {
    return this.requisitoService.findOne(id);
  }

  @MessagePattern('updateRequisito')
  update(@Payload() updateRequisitoDto: UpdateRequisitoDto) {
    return this.requisitoService.update(updateRequisitoDto.id, updateRequisitoDto);
  }

  @MessagePattern('removeRequisito')
  remove(@Payload() id: number) {
    return this.requisitoService.remove(id);
  }
}
