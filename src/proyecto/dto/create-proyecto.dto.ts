import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, IsUUID } from "class-validator";


export class CreateProyectoDto {

    @IsString()
    @IsOptional()
    proyectoCUP: string;

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
    totalNiveles?: number;

    @IsString()
    @IsNotEmpty()
    estado: string;

    @IsUUID('4')
    @IsOptional()
    idCliente: string;

    @IsUUID('4')
    @IsNotEmpty()
    idComercial: string;
}
