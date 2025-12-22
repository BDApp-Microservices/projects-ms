# Configuración de Cloudinary para Asesoría Técnica

## Resumen de Cambios Implementados

### 1. **Frontend** (✅ Completo)
- Refactorizado el modal `RegistrarAsesoriaTecnica.tsx` usando componentes UI del proyecto
- Utiliza `ModalContainer`, `Modal`, `ModalHeader`, `Form`, `ModalBody`, `FormGroup`, etc.
- Envía archivos mediante `FormData` con campo `imagenes` y descripciones indexadas

### 2. **Backend - API Gateway** (✅ Completo)
- Instaladas dependencias: `multer`, `@nestjs/platform-express`, `cloudinary`, `@types/multer`
- Modificado `AsesoriaTecnicaController`:
  - Usa `@UseInterceptors(FileFieldsInterceptor)` para capturar archivos
  - Extrae descripciones del body y las asocia con los archivos
  - Envía todo al microservicio mediante NATS con patrón `createAsesoriaTecnicaWithFiles`

### 3. **Backend - Projects Microservice** (✅ Completo)
- Creado `CloudinaryService` en `src/common/services/cloudinary.service.ts`
  - Método `uploadImage()`: Sube imagen a Cloudinary y retorna URL segura
  - Método `deleteImage()`: Elimina imagen de Cloudinary por URL
- Agregado al módulo `AsesoriaTecnicaModule` como provider
- Creado nuevo método `createWithFiles()` en `AsesoriaTecnicaService`:
  - Recibe archivos serializados desde NATS
  - Convierte buffers a formato Multer
  - Sube cada imagen a Cloudinary
  - Guarda URLs en la tabla `evidencia_imagen`
- Nuevo `@MessagePattern('createAsesoriaTecnicaWithFiles')` en el controller

---

## ⚠️ **CONFIGURACIÓN REQUERIDA** ⚠️

### Paso 1: Crear archivo `.env` en `projects-ms`

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cd c:\Users\eduar\OneDrive\Documentos\BDAPPV2\projects-ms
copy .env.example .env
```

### Paso 2: Obtener credenciales de Cloudinary

1. Ve a [https://cloudinary.com/](https://cloudinary.com/)
2. Inicia sesión o crea una cuenta gratuita
3. En el Dashboard, encontrarás:
   - **Cloud Name** (nombre único de tu cuenta)
   - **API Key** (clave pública)
   - **API Secret** (clave secreta - mantén esto privado)

### Paso 3: Editar el archivo `.env` de `projects-ms`

Reemplaza los valores de ejemplo con tus credenciales reales:

```env
#Configuracion de Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name_real
CLOUDINARY_API_KEY=tu_api_key_real
CLOUDINARY_API_SECRET=tu_api_secret_real
```

**Ejemplo:**
```env
CLOUDINARY_CLOUD_NAME=dxyz1234abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### Paso 4: Reiniciar el microservicio

Después de configurar las variables, reinicia el microservicio `projects-ms`:

```bash
# Detener el servicio actual (Ctrl+C si está corriendo)
# Luego iniciar nuevamente:
cd c:\Users\eduar\OneDrive\Documentos\BDAPPV2\projects-ms
npm run start:dev
```

---

## 📋 Flujo Completo de Subida de Imágenes

```
┌─────────────┐
│  Frontend   │
│  (React)    │
└──────┬──────┘
       │ FormData (files + data)
       ▼
┌─────────────────┐
│  API Gateway    │
│  Port: 3000     │
│  ├─ Multer      │ ◄── Intercepta archivos con FileFieldsInterceptor
│  └─ NATS Client │
└──────┬──────────┘
       │ createAsesoriaTecnicaWithFiles (NATS)
       ▼
┌──────────────────────┐
│  Projects MS         │
│  Port: 3003          │
│  ├─ Controller       │ ◄── @MessagePattern
│  ├─ Service          │
│  │  └─ CloudinaryService
│  └─ Database (PG)   │
└──────┬───────────────┘
       │
       ▼
┌─────────────────┐
│  Cloudinary CDN │ ◄── Almacenamiento en la nube
└─────────────────┘
```

---

## 🔍 Verificación

### Comprobar que las variables están cargadas:

Agrega esto temporalmente en `CloudinaryService` constructor para debug:

```typescript
constructor() {
  console.log('🔑 Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '✅ Configurada' : '❌ Falta',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Configurada' : '❌ Falta',
  });
  // ... resto del código
}
```

Si al iniciar el microservicio ves `❌ Falta`, revisa que:
1. El archivo `.env` existe en la raíz de `projects-ms`
2. Las variables están escritas correctamente (sin espacios extra)
3. Reiniciaste el servicio después de crear el `.env`

---

## 🚨 Solución de Problemas

### Error: "Upload failed without error"
**Causa:** Credenciales incorrectas o faltantes
**Solución:** Verifica que las credenciales en `.env` sean correctas

### Error: "CLOUDINARY_CLOUD_NAME is undefined"
**Causa:** Archivo `.env` no encontrado o mal ubicado
**Solución:** Asegúrate de que `.env` esté en la raíz de `projects-ms/`

### Error: "Invalid signature"
**Causa:** `CLOUDINARY_API_SECRET` incorrecto
**Solución:** Copia nuevamente el API Secret desde el dashboard de Cloudinary

### Las imágenes no aparecen en Cloudinary
**Causa:** Posible error en el buffer conversion
**Solución:** Revisa los logs del microservicio para ver errores específicos

---

## 📂 Estructura de Carpetas en Cloudinary

Las imágenes se suben a la carpeta:
```
/asesoria-tecnica/
```

Puedes modificar esto en el método `createWithFiles()` del servicio cambiando:
```typescript
await this.cloudinaryService.uploadImage(fileToUpload, 'asesoria-tecnica')
```

---

## ✅ Checklist Final

- [ ] Archivo `.env` creado en `projects-ms/`
- [ ] Variables de Cloudinary configuradas con valores reales
- [ ] Microservicio `projects-ms` reiniciado
- [ ] API Gateway corriendo
- [ ] Frontend puede subir imágenes
- [ ] Las URLs de Cloudinary se guardan correctamente en la base de datos

---

## 🎯 Próximos Pasos Recomendados

1. **Implementar modal de edición** (`EditarAsesoriaTecnica.tsx`)
   - Mostrar imágenes existentes
   - Permitir agregar nuevas imágenes
   - Permitir eliminar imágenes (llamar a `deleteImage()`)

2. **Implementar modal de detalle** (`DetalleAsesoriaTecnica.tsx`)
   - Mostrar galería de imágenes
   - Zoom en imágenes
   - Lightbox para navegación

3. **Agregar validaciones**
   - Límite de tamaño de archivo (ej: 10MB)
   - Tipos de archivo permitidos (JPG, PNG, WEBP)
   - Máximo número de imágenes por asesoría

4. **Optimización**
   - Comprimir imágenes antes de subir
   - Generar thumbnails automáticamente en Cloudinary
   - Implementar lazy loading en la galería
