import { Module } from '@nestjs/common';
import { AsesoriaTecnicaService } from './asesoria-tecnica.service';
import { AsesoriaTecnicaController } from './asesoria-tecnica.controller';

@Module({
  controllers: [AsesoriaTecnicaController],
  providers: [AsesoriaTecnicaService],
})
export class AsesoriaTecnicaModule {}
