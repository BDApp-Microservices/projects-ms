import { Injectable } from '@nestjs/common';
import { CreateAuditoriaCotizacionDto } from './dto/create-auditoria-cotizacion.dto';
import { UpdateAuditoriaCotizacionDto } from './dto/update-auditoria-cotizacion.dto';

@Injectable()
export class AuditoriaCotizacionService {
  create(createAuditoriaCotizacionDto: CreateAuditoriaCotizacionDto) {
    return 'This action adds a new auditoriaCotizacion';
  }

  findAll() {
    return `This action returns all auditoriaCotizacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auditoriaCotizacion`;
  }

  update(id: number, updateAuditoriaCotizacionDto: UpdateAuditoriaCotizacionDto) {
    return `This action updates a #${id} auditoriaCotizacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditoriaCotizacion`;
  }
}
