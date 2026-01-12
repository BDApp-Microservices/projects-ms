import { Module } from '@nestjs/common';
import { AuditoriaProyectoService } from './auditoria-proyecto.service';
import { AuditoriaProyectoController } from './auditoria-proyecto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaProyecto } from './entities/auditoria-proyecto.entity';
import { Proyecto } from 'src/proyecto/entities/proyecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaProyecto, Proyecto])],
  controllers: [AuditoriaProyectoController],
  providers: [AuditoriaProyectoService],
  exports: [AuditoriaProyectoService],
})
export class AuditoriaProyectoModule { }

