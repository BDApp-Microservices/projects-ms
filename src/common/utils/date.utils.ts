/**
 * Utilidades para manejo de fechas
 * 
 * Este módulo contiene funciones reutilizables para operaciones
 * relacionadas con fechas según el estándar ISO 8601.
 * Usa date-fns para cálculos precisos.
 */

import { getWeek } from 'date-fns';

/**
 * Obtiene el número de semana del año según el estándar ISO 8601
 * 
 * El estándar ISO 8601 define:
 * - La semana empieza en lunes
 * - La primera semana del año es aquella que contiene el primer jueves del año
 * - Las semanas están numeradas del 1 al 52 o 53
 * 
 * @param date - Fecha de la cual se quiere obtener el número de semana (por defecto: fecha actual)
 * @returns Número de semana del año (1-53)
 * 
 * @example
 * ```typescript
 * // Obtener semana de la fecha actual
 * const semanaActual = getWeekNumber();
 * 
 * // Obtener semana de una fecha específica
 * const semana = getWeekNumber(new Date('2025-02-10'));
 * ```
 */
export function getWeekNumber(date: Date = new Date()): number {
  // getWeek de date-fns calcula según ISO 8601
  // weekStartsOn: 1 = lunes (ISO 8601)
  // firstWeekContainsDate: 4 = la primera semana contiene el 4 de enero (jueves)
  return getWeek(date, {
    weekStartsOn: 1,
    firstWeekContainsDate: 4
  });
}

/**
 * Formatea una fecha como YYYY-MM-DD sin conversión a UTC
 * 
 * @param date - Fecha a formatear
 * @returns String en formato YYYY-MM-DD
 * 
 * @example
 * ```typescript
 * const fecha = new Date('2025-12-16');
 * const formatted = formatDateLocal(fecha); // "2025-12-16"
 * ```
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el siguiente lunes a partir de una fecha
 * Si la fecha ya es lunes, retorna la misma fecha
 * 
 * @param date - Fecha de referencia
 * @returns Fecha del siguiente lunes (o la misma si ya es lunes)
 * 
 * @example
 * ```typescript
 * const viernes = new Date('2025-12-19'); // Viernes
 * const lunes = getNextMonday(viernes);   // 2025-12-22 (Lunes)
 * 
 * const yaEsLunes = new Date('2025-12-22'); // Lunes
 * const mismoLunes = getNextMonday(yaEsLunes); // 2025-12-22 (mismo día)
 * ```
 */
export function getNextMonday(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  // Si es lunes, retornar la misma fecha
  if (dayOfWeek === 1) {
    return new Date(date);
  }

  // Calcular días hasta el siguiente lunes
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(date);
  nextMonday.setDate(date.getDate() + daysUntilMonday);

  return nextMonday;
}

/**
 * Agrega días a una fecha
 * 
 * @param date - Fecha base
 * @param days - Número de días a agregar
 * @returns Nueva fecha con los días agregados
 * 
 * @example
 * ```typescript
 * const hoy = new Date('2025-12-16');
 * const enUnaSemana = addDays(hoy, 7); // 2025-12-23
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
