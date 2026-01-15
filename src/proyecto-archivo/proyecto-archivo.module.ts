import { Module } from '@nestjs/common';
import { ProyectoArchivoService } from './proyecto-archivo.service';
import { ProyectoArchivoController } from './proyecto-archivo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoArchivo } from './entities/proyecto-archivo.entity';
import { GcsStorageModule } from 'src/gcs-storage/gcs-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProyectoArchivo]), GcsStorageModule],
  controllers: [ProyectoArchivoController],
  providers: [ProyectoArchivoService],
})
export class ProyectoArchivoModule { }
