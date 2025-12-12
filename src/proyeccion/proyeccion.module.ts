import { Module } from '@nestjs/common';
import { ProyeccionService } from './proyeccion.service';
import { ProyeccionController } from './proyeccion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proyeccion } from './entities/proyeccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proyeccion])],
  controllers: [ProyeccionController],
  providers: [ProyeccionService],
})
export class ProyeccionModule {}
