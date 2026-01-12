import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAuditoriaProyectoDto {
    @IsUUID()
    idProyecto: string;

    // fechaPerdida se establece automáticamente en el backend

    @IsOptional()
    @IsString()
    detallePerdida?: string;

    @IsOptional()
    @IsString()
    detalleTextual?: string;
}
