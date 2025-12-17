import { PartialType } from '@nestjs/mapped-types';
import { CreateProyeccionDto } from './create-proyeccion.dto';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO para actualizar una proyección existente
 * 
 * Todos los campos son opcionales
 * 
 * forzarRecalculo: Fuerza la regeneración completa de todas las semanas
 * incluso si solo cambia el estado. Útil cuando se necesita recalcular
 * todo desde cero.
 */
export class UpdateProyeccionDto extends PartialType(CreateProyeccionDto) {
  @IsOptional()
  @IsBoolean()
  forzarRecalculo?: boolean;
}

