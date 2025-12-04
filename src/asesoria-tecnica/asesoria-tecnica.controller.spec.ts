import { Test, TestingModule } from '@nestjs/testing';
import { AsesoriaTecnicaController } from './asesoria-tecnica.controller';
import { AsesoriaTecnicaService } from './asesoria-tecnica.service';

describe('AsesoriaTecnicaController', () => {
  let controller: AsesoriaTecnicaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsesoriaTecnicaController],
      providers: [AsesoriaTecnicaService],
    }).compile();

    controller = module.get<AsesoriaTecnicaController>(AsesoriaTecnicaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
