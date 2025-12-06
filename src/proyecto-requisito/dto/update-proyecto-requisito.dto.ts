import { PartialType } from '@nestjs/mapped-types';
import { CreateProyectoRequisitoDto } from './create-proyecto-requisito.dto';

export class UpdateProyectoRequisitoDto extends PartialType(CreateProyectoRequisitoDto) {
  id: number;
}
