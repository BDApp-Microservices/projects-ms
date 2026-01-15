import { PartialType } from '@nestjs/mapped-types';
import { CreateProyectoArchivoDto } from './create-proyecto-archivo.dto';

export class UpdateProyectoArchivoDto extends PartialType(CreateProyectoArchivoDto) {
  id: number;
}
