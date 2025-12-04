import { Test, TestingModule } from '@nestjs/testing';
import { OportunidadController } from './oportunidad.controller';
import { OportunidadService } from './oportunidad.service';

describe('OportunidadController', () => {
  let controller: OportunidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OportunidadController],
      providers: [OportunidadService],
    }).compile();

    controller = module.get<OportunidadController>(OportunidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
