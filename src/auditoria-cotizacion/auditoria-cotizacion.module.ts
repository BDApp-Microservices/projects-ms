import { Module } from '@nestjs/common';
import { AuditoriaCotizacionService } from './auditoria-cotizacion.service';
import { AuditoriaCotizacionController } from './auditoria-cotizacion.controller';

@Module({
  controllers: [AuditoriaCotizacionController],
  providers: [AuditoriaCotizacionService],
})
export class AuditoriaCotizacionModule {}
