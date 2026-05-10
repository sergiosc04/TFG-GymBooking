# TFG-GymBooking

Trabajo de fin de grado de Sergio Serrano y Jesús Valladolid.

## Descripción

GymBooking es una aplicación móvil para la gestión de reservas de clases de un gimnasio. Incluye:

- Autenticación de usuarios (registro e inicio de sesión).
- Visualización de clases disponibles y detalle de cada clase.
- Reserva y cancelación de clases por parte de socios.
- Gestión de perfil personal y cambio de contraseña.
- Panel administrativo con CRUD de clases, subida de imágenes y gestión de socios.
- Backend conectado a Supabase y frontend construido con Expo / React Native.

## Arquitectura del proyecto

El repositorio contiene dos proyectos principales:

- `backend/`: servidor Express en TypeScript que actúa como API y middleware hacia Supabase.
- `frontend/gymbooking-app/`: aplicación móvil Expo en React Native.
- `database/`: scripts SQL de configuración de la base de datos y políticas de Supabase.

## Tecnologías principales

- Backend:
  - Node.js
  - Express
  - TypeScript
  - Supabase JS
  - CORS
  - dotenv
- Frontend:
  - Expo
  - React Native
  - React Navigation
  - AsyncStorage
  - Supabase JS
- Base de datos:
  - Supabase (PostgreSQL, Storage, RLS, funciones RPC)

## Funcionalidades

### Usuario socio

- Registro y login con email y contraseña.
- Visualización de clases disponibles.
- Consulta de detalle de clase con instructor, horario, sala, aforo y reservas actuales.
- Reserva de clases para fechas específicas.
- Cancelación de reservas propias.
- Visualización de próximas reservas y clases destacadas.
- Edición de datos personales y cambio de contraseña.

### Usuario administrador

- Acceso al panel administrativo.
- Listado completo de clases con datos de instructor.
- Creación, edición y eliminación de clases.
- Subida de imágenes de clases a Supabase Storage.
- Gestión de miembros registrados.
- Cambio de rol de socio a admin y viceversa.

## Componentes principales

### Backend

- `backend/src/index.ts`: arranque del servidor y configuración de rutas.
- `backend/src/supabaseClient.ts`: cliente Supabase para auth y operaciones de base de datos.
- `backend/src/middleware/auth.ts`: middleware de autenticación JWT.
- `backend/src/middleware/admin.ts`: middleware para verificar permisos de admin.
- `backend/src/routes/auth.ts`: rutas de registro, login, perfil y cambio de contraseña.
- `backend/src/routes/classes.ts`: rutas de consulta de clases.
- `backend/src/routes/bookings.ts`: rutas de reservas y cancelación.
- `backend/src/routes/admin.ts`: rutas para administración de clases, imágenes y socios.

### Frontend

- `frontend/gymbooking-app/App.tsx`: proveedor de contexto de autenticación y navegación principal.
- `frontend/gymbooking-app/src/navigation/AppNavigator.tsx`: controla flujo de pantallas según autenticación.
- `frontend/gymbooking-app/src/services/api.ts`: cliente HTTP para llamar al backend.
- `frontend/gymbooking-app/src/hooks/useAuth.ts`: manejo de estado de sesión local.
- `frontend/gymbooking-app/src/screens/`: pantallas para inicio, registro, clases, perfil, admin, etc.
- `frontend/gymbooking-app/.env`: configuración de URL de backend para Expo.

## Despliegue y ejecución

### Backend local

1. `cd backend`
2. `npm install`
3. Configurar `.env` con las variables necesarias:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PORT` (opcional)
4. `npm run dev`

### Frontend local

1. `cd frontend/gymbooking-app`
2. `npm install`
3. Configurar `.env`:
   - `EXPO_PUBLIC_API_URL=https://tu-backend/api`
4. `npm start`

> Nota: si pruebas en Expo Go desde un dispositivo móvil, la app intentará conectar al host local usando la IP del depurador.

## Backend desplegado

El backend funciona correctamente en Railway según la prueba realizada. Mantener la variable `EXPO_PUBLIC_API_URL` en el frontend apuntando a esa URL garantiza que la app use el servicio desplegado.

## Variables de entorno

### Backend (`backend/.env`)

- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_ANON_KEY`: clave anónima de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave service_role de Supabase (necesaria para cambiar contraseñas y operaciones admin).
- `PORT`: puerto opcional de escucha.

### Frontend (`frontend/gymbooking-app/.env`)

- `EXPO_PUBLIC_API_URL`: URL base del backend con `https://...`.

## Base de datos

- `database/reset_completo.sql`: script de creación completa de tablas y datos iniciales.
- `database/admin_setup.sql`: configuración de políticas RLS, funciones admin y bucket de Storage.

> Importante: la lógica crítica de negocio utiliza funciones RPC de Supabase, como `reservar_clase` y `contar_reservas_clase`, junto con políticas de acceso basadas en roles.

## Recomendaciones para presentación

- Explica la separación clara entre frontend Expo y backend Express.
- Destaca el uso de Supabase para autenticación, RLS y almacenamiento de imágenes.
- Muestra el login, la reserva de clases y el panel admin como casos de uso clave.
- Señala que el backend ya está desplegado en Railway y que la app móvil se conecta correctamente.

## Estado actual

- Backend: funcional y correctamente desplegado en Railway.
- Frontend: aplicación Expo con navegación, autenticación y todas las pantallas principales.
- Documentación: este README explica cómo instalar, ejecutar y qué componentes son relevantes.

## Contacto

- Sergio Serrano
- Jesús Valladolid
