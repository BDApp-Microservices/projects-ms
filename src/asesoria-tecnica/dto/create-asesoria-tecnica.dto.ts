import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ImagenEvidenciaDto {
    @IsString()
    @IsNotEmpty()
    imagenUrl: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}

export class CreateAsesoriaTecnicaDto {
    @IsDateString()
    @IsNotEmpty()
    fecha: string;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsString()
    @IsNotEmpty()
    responsable: string;

    @IsUUID()
    @IsNotEmpty()
    registradoPor: string;

    @IsUUID()
    @IsNotEmpty()
    idProyecto: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImagenEvidenciaDto)
    @IsOptional()
    imagenes?: ImagenEvidenciaDto[];
}

