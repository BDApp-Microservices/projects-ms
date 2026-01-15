import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { TipoArchivo } from "src/common/enums/proyecto-archivo.enum";

export class CreateProyectoArchivoDto {

    @IsString()
    @IsNotEmpty()
    archivoUrl: string;

    @IsEnum(TipoArchivo)
    @IsNotEmpty()
    tipoArchivo: TipoArchivo;

    @IsString()
    @IsNotEmpty()
    idProyecto: string;
}
