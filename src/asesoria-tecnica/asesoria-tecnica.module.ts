import { Module } from '@nestjs/common';
import { AsesoriaTecnicaService } from './asesoria-tecnica.service';
import { AsesoriaTecnicaController } from './asesoria-tecnica.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesoriaTecnica } from './entities/asesoria-tecnica.entity';
import { EvidenciaImagen } from '../evidencia-imagen/entities/evidencia-imagen.entity';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([AsesoriaTecnica, EvidenciaImagen])],
  controllers: [AsesoriaTecnicaController],
  providers: [AsesoriaTecnicaService, CloudinaryService],
})
export class AsesoriaTecnicaModule { }