import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateProyectoDto } from './create-proyecto.dto';

export class UpdateProyectoDto extends PartialType(CreateProyectoDto) {
    // Campos opcionales para auditoría cuando el proyecto se marca como PERDIDO
    @IsOptional()
    @IsString()
    detallePerdida?: string;

    @IsOptional()
    @IsString()
    detalleTextual?: string;
}
