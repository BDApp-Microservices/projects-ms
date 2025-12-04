import { Module } from '@nestjs/common';
import { OportunidadService } from './oportunidad.service';
import { OportunidadController } from './oportunidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oportunidad } from './entities/oportunidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Oportunidad])],
  controllers: [OportunidadController],
  providers: [OportunidadService],
})
export class OportunidadModule { }
