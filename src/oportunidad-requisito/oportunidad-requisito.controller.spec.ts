import { Test, TestingModule } from '@nestjs/testing';
import { OportunidadRequisitoController } from './oportunidad-requisito.controller';
import { OportunidadRequisitoService } from './oportunidad-requisito.service';

describe('OportunidadRequisitoController', () => {
  let controller: OportunidadRequisitoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OportunidadRequisitoController],
      providers: [OportunidadRequisitoService],
    }).compile();

    controller = module.get<OportunidadRequisitoController>(OportunidadRequisitoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
