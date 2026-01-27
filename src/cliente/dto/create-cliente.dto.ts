import { IsOptional, IsString, IsBoolean, IsNotEmpty, IsEnum } from "class-validator";
import { TipoClienteProyecto } from "src/common/enums/cliente.enum";


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
