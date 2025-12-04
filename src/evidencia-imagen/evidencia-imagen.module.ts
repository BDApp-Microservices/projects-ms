import { Module } from '@nestjs/common';
import { EvidenciaImagenService } from './evidencia-imagen.service';
import { EvidenciaImagenController } from './evidencia-imagen.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenciaImagen } from './entities/evidencia-imagen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvidenciaImagen])],
  controllers: [EvidenciaImagenController],
  providers: [EvidenciaImagenService],
})
export class EvidenciaImagenModule { }
