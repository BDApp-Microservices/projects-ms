import { PartialType } from '@nestjs/mapped-types';
import { CreateOportunidadDto } from './create-oportunidad.dto';

export class UpdateOportunidadDto extends PartialType(CreateOportunidadDto) {
  id: number;
}
