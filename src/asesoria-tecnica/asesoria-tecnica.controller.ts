import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsesoriaTecnicaService } from './asesoria-tecnica.service';
import { CreateAsesoriaTecnicaDto } from './dto/create-asesoria-tecnica.dto';
import { UpdateAsesoriaTecnicaDto } from './dto/update-asesoria-tecnica.dto';

@Controller()
export class AsesoriaTecnicaController {
  constructor(private readonly asesoriaTecnicaService: AsesoriaTecnicaService) {}

  @MessagePattern('createAsesoriaTecnica')
  create(@Payload() createAsesoriaTecnicaDto: CreateAsesoriaTecnicaDto) {
    return this.asesoriaTecnicaService.create(createAsesoriaTecnicaDto);
  }

  @MessagePattern('findAllAsesoriaTecnica')
  findAll() {
    return this.asesoriaTecnicaService.findAll();
  }

  @MessagePattern('findOneAsesoriaTecnica')
  findOne(@Payload() id: number) {
    return this.asesoriaTecnicaService.findOne(id);
  }

  @MessagePattern('updateAsesoriaTecnica')
  update(@Payload() updateAsesoriaTecnicaDto: UpdateAsesoriaTecnicaDto) {
    return this.asesoriaTecnicaService.update(updateAsesoriaTecnicaDto.id, updateAsesoriaTecnicaDto);
  }

  @MessagePattern('removeAsesoriaTecnica')
  remove(@Payload() id: number) {
    return this.asesoriaTecnicaService.remove(id);
  }
}
