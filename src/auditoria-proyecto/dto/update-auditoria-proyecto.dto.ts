import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditoriaProyectoDto } from './create-auditoria-proyecto.dto';

export class UpdateAuditoriaProyectoDto extends PartialType(CreateAuditoriaProyectoDto) {
  id: number;
}
