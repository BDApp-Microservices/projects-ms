import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, IsUUID } from "class-validator";


export class CreateProyectoDto {

    @IsString()
    @IsOptional()
    proyectoCUP?: string;

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    suf: string;

    @IsString()
    @IsOptional()
    codigo: string;

    @IsNumber()
    @IsOptional()
    anio: number;

    @IsDateString()
    @IsNotEmpty()
    fechaTentativa: Date;

    @IsBoolean()
    @IsOptional()
    estaActivo: boolean;

    @IsNumber()
    @IsOptional()
    pisos?: number;

    @IsNumber()
    @IsOptional()
    sotanos?: number;

    @IsString()
    @IsOptional()
    ubicacion?: string;

    @IsNumber()
    @IsOptional()
    latitud?: number;

    @IsNumber()
    @IsOptional()
    longitud?: number;

    @IsString()
    @IsOptional()
    numeroContacto?: string;

    @IsString()
    @IsOptional()
    nombreContacto?: string;

    @IsString()
    @IsOptional()
    correoContacto?: string;

    @IsString()
    @IsNotEmpty()
    estado: string;

    @IsUUID('4')
    @IsOptional()
    idCliente: string;

    @IsUUID('4')
    @IsNotEmpty()
    idComercial: string;

    @IsOptional()
    idIngeniero?: string;

    @IsOptional()
    idOficinaTecnica?: string;
}
