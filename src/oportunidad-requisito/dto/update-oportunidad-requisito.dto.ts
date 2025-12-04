import { PartialType } from '@nestjs/mapped-types';
import { CreateOportunidadRequisitoDto } from './create-oportunidad-requisito.dto';

export class UpdateOportunidadRequisitoDto extends PartialType(CreateOportunidadRequisitoDto) {
  id: number;
}
