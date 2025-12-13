import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAuditoriaProyectoDto {
    @IsUUID()
    idProyecto: string;

    @IsDate()
    @Type(() => Date)
    fechaBaja: Date;

    @IsOptional()
    @IsString()
    motivoPrincipal?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;
}
