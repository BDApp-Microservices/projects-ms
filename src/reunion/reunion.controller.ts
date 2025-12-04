import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReunionService } from './reunion.service';
import { CreateReunionDto } from './dto/create-reunion.dto';
import { UpdateReunionDto } from './dto/update-reunion.dto';

@Controller()
export class ReunionController {
  constructor(private readonly reunionService: ReunionService) {}

  @MessagePattern('createReunion')
  create(@Payload() createReunionDto: CreateReunionDto) {
    return this.reunionService.create(createReunionDto);
  }

  @MessagePattern('findAllReunion')
  findAll() {
    return this.reunionService.findAll();
  }

  @MessagePattern('findOneReunion')
  findOne(@Payload() id: number) {
    return this.reunionService.findOne(id);
  }

  @MessagePattern('updateReunion')
  update(@Payload() updateReunionDto: UpdateReunionDto) {
    return this.reunionService.update(updateReunionDto.id, updateReunionDto);
  }

  @MessagePattern('removeReunion')
  remove(@Payload() id: number) {
    return this.reunionService.remove(id);
  }
}
