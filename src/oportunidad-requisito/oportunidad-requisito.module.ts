import { Module } from '@nestjs/common';
import { OportunidadRequisitoService } from './oportunidad-requisito.service';
import { OportunidadRequisitoController } from './oportunidad-requisito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OportunidadRequisito } from './entities/oportunidad-requisito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OportunidadRequisito])],
  controllers: [OportunidadRequisitoController],
  providers: [OportunidadRequisitoService],
})
export class OportunidadRequisitoModule { }
