import { Module } from '@nestjs/common';
import { AuditoriaProyectoService } from './auditoria-proyecto.service';
import { AuditoriaProyectoController } from './auditoria-proyecto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaProyecto } from './entities/auditoria-proyecto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaProyecto])],
  controllers: [AuditoriaProyectoController],
  providers: [AuditoriaProyectoService],
})
export class AuditoriaProyectoModule {}
