import { Test, TestingModule } from '@nestjs/testing';
import { EvidenciaImagenController } from './evidencia-imagen.controller';
import { EvidenciaImagenService } from './evidencia-imagen.service';

describe('EvidenciaImagenController', () => {
  let controller: EvidenciaImagenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvidenciaImagenController],
      providers: [EvidenciaImagenService],
    }).compile();

    controller = module.get<EvidenciaImagenController>(EvidenciaImagenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
