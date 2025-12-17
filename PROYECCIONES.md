# 📊 Sistema de Proyecciones - projects-ms

## Índice
1. [Análisis del Backend Original](#análisis-del-backend-original)
2. [Implementación en projects-ms](#implementación-en-projects-ms)
3. [Comparación: Backend vs Microservicio](#comparación-backend-vs-microservicio)
4. [Guía de Uso](#guía-de-uso)
5. [Estructura de Datos](#estructura-de-datos)

---

## 1. Análisis del Backend Original

### 📋 Resumen General

El sistema de proyecciones en el backend monolítico permitía planificar la distribución semanal de productos en proyectos de construcción, calculando automáticamente el metrado (cantidad) por semana según la velocidad de construcción.

### 🏗️ Estructura de Entidades (Backend Original)

#### **Proyeccion**
```typescript
{
  idProyeccion: UUID
  fechaInicio: date
  fechaFin: date (calculada)
  metradoPiso: numeric(10,2) - calculado
  pisos: integer
  sotanos: integer
  pisosSemana: number (decimal, ej: 1.5)
  total: numeric(10,2)
  estado: string(20)
  idProyecto: FK → Proyecto
  idProducto: FK → Producto
  idTipoProyeccion: FK → TipoProyeccion
  proyeccionSemanals: ProyeccionSemanal[]
}
```

#### **ProyeccionSemanal**
```typescript
{
  idProyeccionSemanal: integer (auto-increment)
  numeroSemana: integer (ISO 8601)
  fecha: date (siempre lunes)
  cantidad: numeric(10,2)
  unidad: string(10) - M2, ML, KG, UND
  idProyeccion: FK → Proyeccion
}
```

#### **TipoProyeccion**
```typescript
{
  idTipoProyeccion: UUID
  nombre: string(50)
  descripcion: text
}
```

### 🔧 Lógica de Creación (Backend Original)

#### **Input del Usuario:**
- `fechaInicio`
- `pisos`, `sotanos`
- `pisosSemana` (puede ser decimal: 1.5, 2.0)
- `total` (cantidad total del producto)
- `estado`
- `idProyecto`, `idProducto`, `idTipoProyeccion`

#### **Cálculos Automáticos:**

1. **Metrado por Piso:**
   ```
   metradoPiso = total / ((pisos + sotanos) / pisosSemana)
   ```
   
   **Ejemplo:**
   - Total: 1000 M²
   - Pisos: 10, Sótanos: 2
   - Pisos/Semana: 1.5
   
   ```
   metradoPiso = 1000 / ((10 + 2) / 1.5) = 1000 / 8 = 125 M² por semana
   ```

2. **Número de Semanas:**
   ```
   numeroSemanas = Math.ceil((pisos + sotanos) / pisosSemana)
   ```
   Ejemplo: `Math.ceil(12 / 1.5) = 8 semanas`

3. **Unidad de Medida:**
   Determinada desde el Producto:
   ```typescript
   if (producto.usaMetrosCuadrados) → "M2"
   if (producto.usaMetrosLineales) → "ML"
   if (producto.usaKilogramos) → "KG"
   if (producto.usaUnidades) → "UND"
   ```

4. **Generación de Semanas:**
   - Obtiene el siguiente lunes desde `fechaInicio`
   - Crea registros semanales con:
     - `numeroSemana`: ISO 8601 (usando `getWeekNumber()`)
     - `fecha`: siempre un lunes
     - `cantidad`: metradoPiso
     - `unidad`: según producto
   - Avanza 7 días por cada iteración

5. **Fecha Fin:**
   Se asigna la fecha de la última semana generada

### 🔄 Sistema de Actualización (Backend Original)

El backend implementaba **3 tipos de actualización** según el impacto de los cambios:

#### **Tipo 1: INOFENSIVO**
- **Cambios:** Solo `estado` o `total`
- **Comportamiento:** 
  - Actualiza solo campos de la proyección
  - Si cambia `total`, recalcula `metradoPiso`
  - **NO modifica las semanas existentes**

#### **Tipo 2: MOVIMIENTO**
- **Cambios:** Solo `fechaInicio`
- **Comportamiento:**
  - Mantiene las semanas existentes
  - Recalcula `numeroSemana` (nuevo ISO 8601)
  - Recalcula `fecha` (nuevo lunes)
  - **NO cambia** `cantidad` ni `unidad`
  - Actualiza `fechaFin`

#### **Tipo 3: ESTRUCTURAL**
- **Cambios:** `pisos`, `sotanos`, `pisosSemana` o `forzarRecalculo: true`
- **Comportamiento:**
  - **Elimina TODAS las semanas**
  - Recalcula `metradoPiso`
  - Recalcula `numeroSemanas`
  - **Regenera todas las semanas** desde cero
  - Actualiza `fechaFin`

### 📐 Función getWeekNumber (ISO 8601)

**Características:**
- Semana comienza en **lunes** (no domingo)
- Primera semana del año: contiene el primer jueves
- Rango: semanas 1-53
- Usa `date-fns`:
  ```typescript
  getWeek(date, {
    weekStartsOn: 1,        // lunes
    firstWeekContainsDate: 4 // jueves
  })
  ```

### ⚠️ Limitaciones del Backend Original

1. **Datos Duplicados:** Usuario debe proporcionar `pisos`, `sotanos` manualmente aunque ya existen en `Proyecto`
2. **Relación Directa:** Proyección vinculada directamente a `Producto`, no a una relación `Proyecto-Producto`
3. **Entidad Adicional:** Requiere `TipoProyeccion` como catálogo separado
4. **Metrado Manual:** Usuario proporciona el `total` manualmente
5. **Unidad Compleja:** Producto tiene 4 campos booleanos para determinar la unidad

---

## 2. Implementación en projects-ms

### 🎯 Objetivos de la Migración

1. **Simplificar Input:** Reducir datos requeridos del usuario
2. **Aprovechar Relaciones:** Usar `ProyectoProducto` como base
3. **Automatizar Más:** Obtener datos desde relaciones existentes
4. **Enums Modernos:** Usar enums TypeScript en lugar de catálogos
5. **Comunicación entre Microservicios:** Obtener datos de `dispatch-ms`

### 📦 Estructura de Entidades (projects-ms)

#### **Proyeccion**
```typescript
{
  idProyeccion: UUID
  fechaInicio: Date (desde Proyecto.fechaTentativa)
  fechaFin: Date (calculada)
  tipoProyeccion: TipoProyeccion (ENUM: REAL | PROSPECTO)
  estado: EstadoProyeccion (ENUM: NEGOCIACIONES | CALIENTITO | CERRADO | DESPACHANDO | TERMINADO)
  metradoPiso: number (calculado)
  pisos: number (desde Proyecto.pisos, default: 0)
  sotanos: number (desde Proyecto.sotanos, default: 0)
  pisosSemana: number
  total: number (desde ProyectoProducto.cantidad)
  idProyecto: FK → Proyecto
  idProyectoProducto: FK → ProyectoProducto
  proyeccionesSemanales: ProyeccionSemanal[]
}
```

#### **ProyeccionSemanal**
```typescript
{
  idProyeccionSemanal: string (identity)
  numeroSemana: string
  fecha: Date (siempre lunes)
  cantidad: number
  unidad: string (desde Producto.unidadMedida en dispatch-ms)
  idProyeccion: FK → Proyeccion (CASCADE DELETE)
}
```

### 🎨 Enums

#### **TipoProyeccion**
```typescript
enum TipoProyeccion {
  REAL = 'REAL',
  PROSPECTO = 'PROSPECTO'
}
```

#### **EstadoProyeccion**
```typescript
enum EstadoProyeccion {
  NEGOCIACIONES = 'NEGOCIACIONES',
  CALIENTITO = 'CALIENTITO',
  CERRADO = 'CERRADO',
  DESPACHANDO = 'DESPACHANDO',
  TERMINADO = 'TERMINADO'
}
```

### 📝 DTO Simplificado

#### **CreateProyeccionDto**
```typescript
{
  idProyectoProducto: UUID  // Solo esto relaciona todo
  tipoProyeccion: TipoProyeccion
  estado: EstadoProyeccion
  pisosSemana: number
}
```

**Datos Obtenidos Automáticamente:**
- `fechaInicio` ← `Proyecto.fechaTentativa`
- `pisos` ← `Proyecto.pisos`
- `sotanos` ← `Proyecto.sotanos`
- `total` ← `ProyectoProducto.cantidad`
- `unidad` ← `Producto.unidadMedida` (desde dispatch-ms vía NATS)
- `metradoPiso` ← Calculado
- `fechaFin` ← Última semana generada

### 🔌 Comunicación con dispatch-ms

#### **ProductoClientService**
```typescript
@Injectable()
export class ProductoClientService {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {}

  async getUnidadMedida(idProducto: string): Promise<string> {
    const producto = await firstValueFrom(
      this.client.send({ cmd: 'get.producto' }, { idProducto })
    );
    return producto.unidadMedida || 'UND';
  }
}
```

### 🛠️ Algoritmo de Creación

```typescript
async create(dto: CreateProyeccionDto): Promise<Proyeccion> {
  // 1. Validar unicidad (proyecto-producto + tipo)
  // 2. Obtener ProyectoProducto con relaciones
  // 3. Cargar Proyecto
  // 4. Obtener unidad desde dispatch-ms (NATS)
  // 5. Calcular metradoPiso y numeroSemanas
  // 6. Crear Proyeccion
  // 7. Generar ProyeccionSemanal[] (siempre lunes)
  // 8. Actualizar fechaFin
  // 9. Guardar todo en TRANSACCIÓN
}
```

### 🔄 Sistema de Actualización (Idéntico al Backend)

Mantiene los mismos 3 tipos: **INOFENSIVO**, **MOVIMIENTO** y **ESTRUCTURAL** con la misma lógica.

### 🗄️ Restricción de Unicidad

```sql
UNIQUE(id_proyecto_producto, tipo_proyeccion)
```

**Significa:** Solo puede existir:
- 1 proyección REAL por proyecto-producto
- 1 proyección PROSPECTO por proyecto-producto

### 📡 Endpoints NATS

```typescript
{ cmd: 'create.proyeccion' }
{ cmd: 'findAll.proyeccion' }
{ cmd: 'findOne.proyeccion' }
{ cmd: 'findByProyectoProducto.proyeccion' }
{ cmd: 'findByProyecto.proyeccion' }
{ cmd: 'update.proyeccion' }
{ cmd: 'remove.proyeccion' }
```

---

## 3. Comparación: Backend vs Microservicio

### 📊 Tabla Comparativa

| Aspecto | Backend Original | projects-ms | Mejora |
|---------|------------------|-------------|--------|
| **Datos del Usuario** | 9 campos | 4 campos | ✅ -56% input |
| **Relación Base** | `Producto` directo | `ProyectoProducto` | ✅ Mejor modelado |
| **Tipo Proyección** | Tabla `TipoProyeccion` | Enum TypeScript | ✅ Sin BD adicional |
| **Estado** | String libre | Enum con validación | ✅ Más seguro |
| **Obtención de Unidad** | 4 booleanos en Producto | `unidadMedida` directo | ✅ Más simple |
| **Pisos/Sótanos** | Usuario los ingresa | Desde Proyecto | ✅ Evita duplicación |
| **Fecha Inicio** | Usuario la ingresa | Desde `fechaTentativa` | ✅ Sincronización automática |
| **Total** | Usuario lo ingresa | Desde `ProyectoProducto.cantidad` | ✅ Fuente única de verdad |
| **Comunicación** | Monolítico | NATS (microservicios) | ✅ Escalable |
| **Eliminación Cascada** | Manual en código | `CASCADE` en BD | ✅ Más seguro |
| **Transacciones** | QueryRunner | QueryRunner | ✅ Igual de robusto |

### 🎯 Ventajas del Microservicio

1. **Menos Errores Humanos:** El usuario solo proporciona 4 campos en lugar de 9
2. **Consistencia de Datos:** Todos los datos vienen de una fuente única
3. **Mantenibilidad:** Enums en código son más fáciles de modificar que tablas de catálogo
4. **Escalabilidad:** Comunicación NATS permite distribuir carga
5. **Tipado Fuerte:** TypeScript + Enums previenen errores en tiempo de compilación

### 🔄 Proceso Comparado

#### Backend Original:
```
Usuario → Ingresa 9 campos → Valida → Obtiene Producto (mismo servicio)
     → Calcula → Genera Semanas → Guarda
```

#### projects-ms:
```
Usuario → Ingresa 4 campos → Obtiene ProyectoProducto → Obtiene Proyecto
     → Consulta dispatch-ms (NATS) → Calcula → Genera Semanas → Guarda
```

**Diferencia clave:** El microservicio hace **más trabajo automático** pero requiere **más consultas** (tradeoff entre simplicidad y latencia).

### 📈 Ejemplo Práctico

#### Backend Original - Input:
```json
{
  "fechaInicio": "2025-01-15",
  "pisos": "10",
  "sotanos": "2",
  "pisosSemana": "1.5",
  "total": "1000.50",
  "estado": "CALIENTITO",
  "idProyecto": "uuid-proyecto",
  "idProducto": "uuid-producto",
  "idTipoProyeccion": "uuid-tipo"
}
```

#### projects-ms - Input:
```json
{
  "idProyectoProducto": "uuid-proyecto-producto",
  "tipoProyeccion": "REAL",
  "estado": "CALIENTITO",
  "pisosSemana": 1.5
}
```

**Resultado:** Los mismos datos se obtienen, pero el usuario solo proporciona **4 campos vs 9**.

---

## 4. Guía de Uso

### 📘 Crear una Proyección

#### Prerrequisitos:
1. Existe un `Proyecto` con `pisos`, `sotanos` y `fechaTentativa`
2. Existe un `ProyectoProducto` vinculando el proyecto con un producto
3. El producto existe en `dispatch-ms` con `unidadMedida`

#### Pasos:

1. **Enviar mensaje NATS:**
   ```typescript
   this.client.send(
     { cmd: 'create.proyeccion' },
     {
       idProyectoProducto: 'uuid-aqui',
       tipoProyeccion: 'REAL',
       estado: 'NEGOCIACIONES',
       pisosSemana: 1.5
     }
   )
   ```

2. **El sistema automáticamente:**
   - Obtiene el proyecto
   - Obtiene pisos (10), sótanos (2), fechaTentativa (2025-01-15)
   - Obtiene la cantidad total (1000)
   - Consulta dispatch-ms para obtener unidad (M2)
   - Calcula metradoPiso: `1000 / ((10+2) / 1.5) = 125 M²/semana`
   - Calcula semanas: `Math.ceil(12 / 1.5) = 8 semanas`
   - Genera 8 registros de `ProyeccionSemanal`
   - Establece fechaFin como la fecha de la semana 8

3. **Respuesta:**
   ```json
   {
     "idProyeccion": "uuid-generado",
     "fechaInicio": "2025-01-15",
     "fechaFin": "2025-03-05",
     "tipoProyeccion": "REAL",
     "estado": "NEGOCIACIONES",
     "metradoPiso": 125,
     "pisos": 10,
     "sotanos": 2,
     "pisosSemana": 1.5,
     "total": 1000,
     "proyeccionesSemanales": [
       {
         "numeroSemana": "3",
         "fecha": "2025-01-20",
         "cantidad": 125,
         "unidad": "M2"
       },
       // ... 7 semanas más
     ]
   }
   ```

### 🔄 Actualizar una Proyección

#### Actualización INOFENSIVA (solo estado):
```typescript
this.client.send(
  { cmd: 'update.proyeccion' },
  {
    id: 'uuid-proyeccion',
    dto: { estado: 'CERRADO' }
  }
)
```

#### Actualización ESTRUCTURAL (cambiar velocidad):
```typescript
this.client.send(
  { cmd: 'update.proyeccion' },
  {
    id: 'uuid-proyeccion',
    dto: {
      pisosSemana: 2.0,  // Cambió de 1.5 a 2.0
      // Regenerará TODAS las semanas
    }
  }
)
```

#### Forzar Recálculo Completo:
```typescript
this.client.send(
  { cmd: 'update.proyeccion' },
  {
    id: 'uuid-proyeccion',
    dto: { forzarRecalculo: true }
  }
)
```

### 🔍 Consultar Proyecciones

#### Por Proyecto-Producto:
```typescript
this.client.send(
  { cmd: 'findByProyectoProducto.proyeccion' },
  'uuid-proyecto-producto'
)
```

#### Por Proyecto:
```typescript
this.client.send(
  { cmd: 'findByProyecto.proyeccion' },
  'uuid-proyecto'
)
```

### 🗑️ Eliminar Proyección

```typescript
this.client.send(
  { cmd: 'remove.proyeccion' },
  'uuid-proyeccion'
)
// Las ProyeccionSemanal se eliminan automáticamente (CASCADE)
```

---

## 5. Estructura de Datos

### 📁 Archivos Creados

```
projects-ms/src/
├── common/
│   ├── enums/
│   │   ├── tipo-proyeccion.enum.ts
│   │   ├── estado-proyeccion.enum.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── date.utils.ts
│   └── services/
│       └── producto-client.service.ts
├── proyeccion/
│   ├── dto/
│   │   ├── create-proyeccion.dto.ts
│   │   └── update-proyeccion.dto.ts
│   ├── entities/
│   │   └── proyeccion.entity.ts
│   ├── proyeccion.controller.ts
│   ├── proyeccion.service.ts
│   └── proyeccion.module.ts
└── proyeccion-semanal/
    └── entities/
        └── proyeccion-semanal.entity.ts
```

### 🗂️ Dependencias Agregadas

```json
{
  "date-fns": "^3.x" // Para cálculo de semanas ISO 8601
}
```

### 🔗 Relaciones

```
Proyecto
    ↓ 1:N
ProyectoProducto
    ↓ 1:N
Proyeccion
    ↓ 1:N
ProyeccionSemanal
```

**Producto (dispatch-ms)** se consulta vía NATS para obtener `unidadMedida`.

---

## 📚 Conclusión

La implementación en `projects-ms` moderniza el sistema de proyecciones del backend original, manteniendo la misma lógica de negocio robusta (con sus 3 tipos de actualización) pero simplificando drásticamente el input del usuario y aprovechando las relaciones existentes en la base de datos.

**Cambios principales:**
- ✅ **Menos input:** 4 campos vs 9 campos
- ✅ **Enums TypeScript:** En lugar de tablas de catálogo
- ✅ **Relación proyecto-producto:** Base más lógica
- ✅ **Comunicación microservicios:** NATS para obtener datos de productos
- ✅ **Automatización:** Más datos obtenidos del sistema
- ✅ **Tipado fuerte:** Prevención de errores en compilación

**Lógica conservada:**
- ✅ Cálculo de metrado por piso (idéntico)
- ✅ Generación de semanas ISO 8601 (idéntico)
- ✅ 3 tipos de actualización (INOFENSIVO, MOVIMIENTO, ESTRUCTURAL)
- ✅ Transacciones con QueryRunner
- ✅ Validaciones de unicidad

El sistema está listo para integrarse con el API Gateway y comenzar a usarse en producción.

---

**Fecha de Implementación:** 16 de diciembre de 2025  
**Microservicio:** projects-ms  
**Versión:** 1.0.0
