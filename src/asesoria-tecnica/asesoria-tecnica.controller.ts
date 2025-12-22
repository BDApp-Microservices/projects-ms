import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsesoriaTecnicaService } from './asesoria-tecnica.service';
import { CreateAsesoriaTecnicaDto } from './dto/create-asesoria-tecnica.dto';
import { UpdateAsesoriaTecnicaDto } from './dto/update-asesoria-tecnica.dto';

@Controller()
export class AsesoriaTecnicaController {
  constructor(private readonly asesoriaTecnicaService: AsesoriaTecnicaService) { }

  @MessagePattern('createAsesoriaTecnica')
  create(@Payload() createAsesoriaTecnicaDto: CreateAsesoriaTecnicaDto) {
    return this.asesoriaTecnicaService.create(createAsesoriaTecnicaDto);
  }

  @MessagePattern('createAsesoriaTecnicaWithFiles')
  async createWithFiles(@Payload() payload: any) {
    return this.asesoriaTecnicaService.createWithFiles(payload);
  }

  @MessagePattern('findAllAsesoriaTecnica')
  findAll(@Payload() query?: {
    idProyecto?: string;
    fechaInicio?: string;
    fechaFin?: string;
    responsable?: string;
  }) {
    return this.asesoriaTecnicaService.findAll(query);
  }

  @MessagePattern('findOneAsesoriaTecnica')
  findOne(@Payload() id: string) {
    return this.asesoriaTecnicaService.findOne(id);
  }

  @MessagePattern('updateAsesoriaTecnica')
  update(@Payload() payload: { id: string } & UpdateAsesoriaTecnicaDto) {
    const { id, ...updateData } = payload;
    return this.asesoriaTecnicaService.update(id, updateData);
  }

  @MessagePattern('removeAsesoriaTecnica')
  remove(@Payload() id: string) {
    return this.asesoriaTecnicaService.remove(id);
  }
}
