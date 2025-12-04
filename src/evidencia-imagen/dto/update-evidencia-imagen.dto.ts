import { PartialType } from '@nestjs/mapped-types';
import { CreateEvidenciaImagenDto } from './create-evidencia-imagen.dto';

export class UpdateEvidenciaImagenDto extends PartialType(CreateEvidenciaImagenDto) {
  id: number;
}
