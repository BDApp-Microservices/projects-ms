import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaClienteService } from './auditoria-cliente.service';

describe('AuditoriaClienteService', () => {
  let service: AuditoriaClienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditoriaClienteService],
    }).compile();

    service = module.get<AuditoriaClienteService>(AuditoriaClienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
