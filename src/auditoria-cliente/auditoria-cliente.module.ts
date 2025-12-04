import { Module } from '@nestjs/common';
import { AuditoriaClienteService } from './auditoria-cliente.service';
import { AuditoriaClienteController } from './auditoria-cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaCliente } from './entities/auditoria-cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaCliente])],
  controllers: [AuditoriaClienteController],
  providers: [AuditoriaClienteService],
})
export class AuditoriaClienteModule { }
