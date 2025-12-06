import { Module } from '@nestjs/common';
import { ProyectoRequisitoService } from './proyecto-requisito.service';
import { ProyectoRequisitoController } from './proyecto-requisito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectoRequisito } from './entities/proyecto-requisito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProyectoRequisito])],
  controllers: [ProyectoRequisitoController],
  providers: [ProyectoRequisitoService],
})
export class ProyectoRequisitoModule {}
