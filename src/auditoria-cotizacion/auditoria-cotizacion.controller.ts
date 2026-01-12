import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditoriaCotizacionService } from './auditoria-cotizacion.service';
import { CreateAuditoriaCotizacionDto } from './dto/create-auditoria-cotizacion.dto';
import { UpdateAuditoriaCotizacionDto } from './dto/update-auditoria-cotizacion.dto';

@Controller()
export class AuditoriaCotizacionController {
  constructor(private readonly auditoriaCotizacionService: AuditoriaCotizacionService) {}

  @MessagePattern('createAuditoriaCotizacion')
  create(@Payload() createAuditoriaCotizacionDto: CreateAuditoriaCotizacionDto) {
    return this.auditoriaCotizacionService.create(createAuditoriaCotizacionDto);
  }

  @MessagePattern('findAllAuditoriaCotizacion')
  findAll() {
    return this.auditoriaCotizacionService.findAll();
  }

  @MessagePattern('findOneAuditoriaCotizacion')
  findOne(@Payload() id: number) {
    return this.auditoriaCotizacionService.findOne(id);
  }

  @MessagePattern('updateAuditoriaCotizacion')
  update(@Payload() updateAuditoriaCotizacionDto: UpdateAuditoriaCotizacionDto) {
    return this.auditoriaCotizacionService.update(updateAuditoriaCotizacionDto.id, updateAuditoriaCotizacionDto);
  }

  @MessagePattern('removeAuditoriaCotizacion')
  remove(@Payload() id: number) {
    return this.auditoriaCotizacionService.remove(id);
  }
}
