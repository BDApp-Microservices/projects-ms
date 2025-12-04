import { Test, TestingModule } from '@nestjs/testing';
import { AsesoriaTecnicaService } from './asesoria-tecnica.service';

describe('AsesoriaTecnicaService', () => {
  let service: AsesoriaTecnicaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsesoriaTecnicaService],
    }).compile();

    service = module.get<AsesoriaTecnicaService>(AsesoriaTecnicaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
