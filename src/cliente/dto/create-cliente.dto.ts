import { IsOptional, IsString, IsBoolean, IsNotEmpty } from "class-validator";


export class CreateClienteDto {
    @IsString()
    @IsOptional()
    ruc?: string;

    @IsString()
    @IsOptional()
    razonSocial?: string;

    @IsString()
    @IsNotEmpty()
    nombreComercial: string;

    @IsString()
    @IsOptional()
    tipo?: string;

    @IsString()
    @IsOptional()
    credito?: string;

    @IsString()
    @IsOptional()
    condicion?: string;

    @IsString()
    @IsOptional()
    datos?: string;

    @IsString()
    @IsOptional()
    tipoCliente?: string; // 'NUEVO' o 'ANTIGUO'

    @IsBoolean()
    @IsOptional()
    estaActivo?: boolean;
}
