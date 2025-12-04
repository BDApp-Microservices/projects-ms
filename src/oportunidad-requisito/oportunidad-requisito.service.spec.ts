import { Test, TestingModule } from '@nestjs/testing';
import { OportunidadRequisitoService } from './oportunidad-requisito.service';

describe('OportunidadRequisitoService', () => {
  let service: OportunidadRequisitoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OportunidadRequisitoService],
    }).compile();

    service = module.get<OportunidadRequisitoService>(OportunidadRequisitoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
