import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';
import { TipoProyeccion } from 'src/common/enums/tipo-proyeccion.enum';
import { EstadoProyeccion } from 'src/common/enums/estado-proyeccion.enum';

/**
 * DTO para crear una nueva proyección
 * 
 * El usuario solo debe proporcionar:
 * - idProyectoProducto: Relación con proyecto-producto (de aquí se obtiene proyecto, producto, cantidad)
 * - tipoProyeccion: REAL o PROSPECTO
 * - estado: Estado actual de la negociación
 * - pisosSemana: Velocidad de construcción (puede ser decimal, ej: 1.5)
 * 
 * El sistema calcula automáticamente:
 * - fechaInicio: desde Proyecto.fechaTentativa
 * - pisos, sotanos: desde Proyecto
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

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.1, { message: 'pisosSemana debe ser mayor a 0' })
  pisosSemana: number; // Puede ser 1.5, 2.0, etc.
}

