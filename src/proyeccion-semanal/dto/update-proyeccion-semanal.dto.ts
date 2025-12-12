import { PartialType } from '@nestjs/mapped-types';
import { CreateProyeccionSemanalDto } from './create-proyeccion-semanal.dto';

export class UpdateProyeccionSemanalDto extends PartialType(CreateProyeccionSemanalDto) {
  id: number;
}
