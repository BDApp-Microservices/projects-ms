import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditoriaClienteDto } from './create-auditoria-cliente.dto';

export class UpdateAuditoriaClienteDto extends PartialType(CreateAuditoriaClienteDto) {
  id: number;
}
