import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { CreateProyectoDto } from './create-proyecto.dto';

// DTO para datos del cliente nuevo
export class ClienteNuevoDto {
    @IsString()
    @IsNotEmpty()
    nombreComercial: string;

    @IsString()
    @IsOptional()
    razonSocial?: string;

    @IsString()
    @IsOptional()
    ruc?: string;



    @IsString()
    @IsOptional()
    credito?: string;

    @IsString()
    @IsOptional()
    condicion?: string;

    @IsString()
    @IsOptional()
    datos?: string;
}

// DTO para productos asociados
export class ProductoAsociadoDto {
    @IsUUID('4')
    @IsNotEmpty()
    idProducto: string;

    @IsOptional()
    cantidad?: number;

    @IsOptional()
    precioVenta?: number;

    @IsOptional()
    observaciones?: string;

    @IsOptional()
    @IsDateString()
    fechaAproxEnvio?: string;
}

// DTO principal para creación completa
export class CreateProyectoCompletoDto {
    @ValidateNested()
    @Type(() => CreateProyectoDto)
    @IsNotEmpty()
    proyecto: CreateProyectoDto;

    @ValidateNested()
    @Type(() => ClienteNuevoDto)
    @IsOptional()
    clienteNuevo?: ClienteNuevoDto;

    @IsUUID('4')
    @IsOptional()
    idClienteExistente?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductoAsociadoDto)
    @IsNotEmpty()
    productos: ProductoAsociadoDto[];

    @IsBoolean()
    @IsNotEmpty()
    esProyectoNuevo: boolean;
}
