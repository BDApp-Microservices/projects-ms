import { Test, TestingModule } from '@nestjs/testing';
import { EvidenciaImagenService } from './evidencia-imagen.service';

describe('EvidenciaImagenService', () => {
  let service: EvidenciaImagenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvidenciaImagenService],
    }).compile();

    service = module.get<EvidenciaImagenService>(EvidenciaImagenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
