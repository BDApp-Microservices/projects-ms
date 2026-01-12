import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditoriaCotizacionDto } from './create-auditoria-cotizacion.dto';

export class UpdateAuditoriaCotizacionDto extends PartialType(CreateAuditoriaCotizacionDto) {
  id: number;
}
