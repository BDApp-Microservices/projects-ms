import { IsOptional, IsString, IsBoolean } from "class-validator";


export class CreateClienteDto {
    @IsString()
    @IsOptional()
    ruc?: string;

    @IsString()
    razonSocial: string;

    @IsString()
    @IsOptional()
    nombreComercial?: string;

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
