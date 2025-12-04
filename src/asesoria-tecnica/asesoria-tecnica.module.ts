import { Module } from '@nestjs/common';
import { AsesoriaTecnicaService } from './asesoria-tecnica.service';
import { AsesoriaTecnicaController } from './asesoria-tecnica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesoriaTecnica } from './entities/asesoria-tecnica.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsesoriaTecnica])],
  controllers: [AsesoriaTecnicaController],
  providers: [AsesoriaTecnicaService],
})
export class AsesoriaTecnicaModule { }