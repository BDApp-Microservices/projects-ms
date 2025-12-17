import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsUUID, Min, IsDateString, IsInt, IsString } from 'class-validator';
import { TipoProyeccion } from 'src/common/enums/tipo-proyeccion.enum';
import { EstadoProyeccion } from 'src/common/enums/estado-proyeccion.enum';

/**
 * DTO para crear una nueva proyección
 * 
 * El frontend debe proporcionar:
 * - idProyectoProducto: Relación con proyecto-producto (de aquí se obtiene producto, cantidad)
 * - tipoProyeccion: REAL o PROSPECTO
 * - estado: Estado actual de la negociación
 * - pisosSemana: Velocidad de construcción (puede ser decimal, ej: 1.5)
 * - fechaInicio: Fecha de inicio de la proyección
 * - pisos: Número de pisos del proyecto
 * - sotanos: Número de sótanos del proyecto
 * 
 * El sistema calcula automáticamente:
 * - total: desde ProyectoProducto.cantidad
 * - unidad: desde Producto.unidadMedida (dispatch-ms)
 * - metradoPiso: total / ((pisos + sotanos) / pisosSemana)
 * - fechaFin: fecha de la última semana generada
 */
export class CreateProyeccionDto {
  @IsUUID()
  @IsNotEmpty()
  idProyectoProducto: string;

  @IsEnum(TipoProyeccion)
  @IsNotEmpty()
  tipoProyeccion: TipoProyeccion;

  @IsEnum(EstadoProyeccion)
  @IsNotEmpty()
  estado: EstadoProyeccion;

  @IsNumber({ maxDecimalPlaces: 1 })
  @IsPositive()
  @Min(0.1, { message: 'pisosSemana debe ser mayor a 0' })
  pisosSemana: number;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio: string;

  @IsInt()
  @Min(0, { message: 'pisos debe ser mayor o igual a 0' })
  pisos: number;

  @IsInt()
  @Min(0, { message: 'sotanos debe ser mayor o igual a 0' })
  sotanos: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total: number;

  @IsString()
  @IsNotEmpty()
  unidadMedida: string;
}

