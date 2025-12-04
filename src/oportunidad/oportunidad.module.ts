import { Module } from '@nestjs/common';
import { OportunidadService } from './oportunidad.service';
import { OportunidadController } from './oportunidad.controller';

@Module({
  controllers: [OportunidadController],
  providers: [OportunidadService],
})
export class OportunidadModule {}
