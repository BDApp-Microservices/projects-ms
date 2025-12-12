import { Module } from '@nestjs/common';
import { ProyeccionSemanalService } from './proyeccion-semanal.service';
import { ProyeccionSemanalController } from './proyeccion-semanal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyeccionSemanal } from './entities/proyeccion-semanal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProyeccionSemanal])],
  controllers: [ProyeccionSemanalController],
  providers: [ProyeccionSemanalService],
})
export class ProyeccionSemanalModule {}
