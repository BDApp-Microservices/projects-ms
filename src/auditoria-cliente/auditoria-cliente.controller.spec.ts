import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaClienteController } from './auditoria-cliente.controller';
import { AuditoriaClienteService } from './auditoria-cliente.service';

describe('AuditoriaClienteController', () => {
  let controller: AuditoriaClienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaClienteController],
      providers: [AuditoriaClienteService],
    }).compile();

    controller = module.get<AuditoriaClienteController>(AuditoriaClienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
