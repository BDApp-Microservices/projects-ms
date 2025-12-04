import { Module } from '@nestjs/common';
import { OportunidadRequisitoService } from './oportunidad-requisito.service';
import { OportunidadRequisitoController } from './oportunidad-requisito.controller';

@Module({
  controllers: [OportunidadRequisitoController],
  providers: [OportunidadRequisitoService],
})
export class OportunidadRequisitoModule {}
