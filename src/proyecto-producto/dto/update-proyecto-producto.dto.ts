import { PartialType } from '@nestjs/mapped-types';
import { CreateProyectoProductoDto } from './create-proyecto-producto.dto';

export class UpdateProyectoProductoDto extends PartialType(CreateProyectoProductoDto) {
  id: number;
}
