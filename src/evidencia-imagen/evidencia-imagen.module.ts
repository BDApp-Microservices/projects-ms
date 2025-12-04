import { Module } from '@nestjs/common';
import { EvidenciaImagenService } from './evidencia-imagen.service';
import { EvidenciaImagenController } from './evidencia-imagen.controller';

@Module({
  controllers: [EvidenciaImagenController],
  providers: [EvidenciaImagenService],
})
export class EvidenciaImagenModule {}
