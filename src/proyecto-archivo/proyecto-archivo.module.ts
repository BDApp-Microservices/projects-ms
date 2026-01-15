import { Module } from '@nestjs/common';
import { ProyectoArchivoService } from './proyecto-archivo.service';
import { ProyectoArchivoController } from './proyecto-archivo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoArchivo } from './entities/proyecto-archivo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProyectoArchivo])],
  controllers: [ProyectoArchivoController],
  providers: [ProyectoArchivoService],
})
export class ProyectoArchivoModule {}
