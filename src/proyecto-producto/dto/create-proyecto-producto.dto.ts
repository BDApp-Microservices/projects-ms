import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateProyectoProductoDto {
    @IsUUID('4')
    @IsNotEmpty()
    idProyecto: string;

    @IsUUID('4')
    @IsNotEmpty()
    idProducto: string;

    @IsNumber()
    @IsOptional()
    cantidad?: number;
}
