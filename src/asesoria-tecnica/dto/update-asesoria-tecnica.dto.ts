import { PartialType } from '@nestjs/mapped-types';
import { CreateAsesoriaTecnicaDto } from './create-asesoria-tecnica.dto';

export class UpdateAsesoriaTecnicaDto extends PartialType(CreateAsesoriaTecnicaDto) {
  id: number;
}
