import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import {
  ActividadEnum,
  EstadoEnum,
  SistemaInicialEnum,
} from 'src/common/enums/proyecto-producto.enum';

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

  @IsNotEmpty()
  @IsDateString()
  fechaAproxEnvio: Date;

  @IsNotEmpty()
  @IsEnum(ActividadEnum)
  actividad: ActividadEnum; // COTIZACION, ACTUALIZACION

  @IsOptional()
  observaciones?: string;

  @IsNotEmpty()
  @IsEnum(EstadoEnum)
  estado: EstadoEnum; // PENDIENTE, PROCESO, ENVIADO, NO_COTIZAR, EN_PAUSA

  @IsOptional()
  @IsEnum(SistemaInicialEnum)
  sistemaInicial?: SistemaInicialEnum;

  @IsOptional()
  @IsDateString()
  fechaEnvio?: Date;

  @IsUUID('4')
  @IsNotEmpty()
  elaboradoPor: string;
}
