import { Test, TestingModule } from '@nestjs/testing';
import { OportunidadService } from './oportunidad.service';

describe('OportunidadService', () => {
  let service: OportunidadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OportunidadService],
    }).compile();

    service = module.get<OportunidadService>(OportunidadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
