import { Module } from '@nestjs/common';
import { AuditoriaClienteService } from './auditoria-cliente.service';
import { AuditoriaClienteController } from './auditoria-cliente.controller';

@Module({
  controllers: [AuditoriaClienteController],
  providers: [AuditoriaClienteService],
})
export class AuditoriaClienteModule {}
