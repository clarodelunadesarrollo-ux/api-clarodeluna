# Plan de tareas — Etapa 1 (Claro de Luna)

> Desglose accionable del **QUÉ** ([requerimientos](../features/README.md)) y el
> **CÓMO** ([diseño técnico](../design/technical-design.md)) en tareas ejecutables,
> ordenadas por dependencias.

**Convenciones**
- `[ ]` pendiente · `[x]` hecho.
- Cada tarea referencia el requerimiento (RF) o la sección de diseño que satisface.
- Las **fases** van en orden de dependencia: no empezar una hasta cerrar la anterior
  (salvo donde se indique que son paralelizables).

---

## Fase 0 — Fundaciones del monorepo

Sin esto, nada compila. Es la base de todo.

- [x] **T0.1** Inicializar monorepo con workspaces (`apps/`, `packages/`) · diseño §2.3
- [~] **T0.2** Config base: `tsconfig` base, Prettier, `.editorconfig`, `.gitignore` hechos · **ESLint pendiente** (inicio Fase 1)
- [x] **T0.3** `packages/shared`: tipos/DTOs y esquemas `zod` compartidos · diseño §6
- [x] **T0.4** Scaffold `apps/api` (NestJS): `ConfigModule`, validación de env (zod), health check · diseño §4
- [x] **T0.5** Scaffold `apps/mobile` (Expo SDK 57): navegación (RootStack + MainTabs), `QueryClientProvider`, theme tokens · diseño §3
- [~] **T0.6** Prisma `schema.prisma` + `PrismaService` + cliente generado · **conexión a Neon pendiente** (falta `DATABASE_URL`)
- [x] **T0.7** `.env.example` (API y mobile) con variables necesarias, sin secretos reales

> Estado: monorepo funcional, ambos apps compilan sin errores de TypeScript.
> Pendientes que NO bloquean Fase 1: configurar ESLint y conectar Neon (poner
> `DATABASE_URL` real y correr `npm run api:prisma:generate` + `prisma migrate`).

---

## Fase 1 — Feature 01: Auth OTP + Bienvenida + Reserva

Cimiento funcional: sin sesión no hay reserva, check-in ni push.
Referencia: [F01 requirements](../features/01-welcome-and-reservation/requirements.md)

### Backend

- [x] **T1.1** Prisma models: `User`, `OtpCode`, `Reservation` (+ `RefreshToken`) + migración `init` aplicada (Postgres local vía Docker; Neon queda para prod) · diseño §5
- [x] **T1.2** `MailModule` con Resend: envío del código OTP por email (modo dev loguea el código si no hay API key) · RF-01.2, diseño §2.2
- [x] **T1.3** `AuthModule` — `POST /auth/request-otp`: genera código, guarda **hash** + `expiresAt` · RF-01.2, RNF-01.3
- [x] **T1.4** `POST /auth/verify-otp`: valida hash/expiración/intentos, emite `accessToken` + `refreshToken` · RF-01.2
- [x] **T1.5** `POST /auth/refresh` y `POST /auth/logout` (rotación e invalidación de refresh) · diseño §6
- [x] **T1.6** `JwtAuthGuard` + validación JWT en `common/` (guard propio con `JwtService`, sin passport) · diseño §4
- [x] **T1.7** **Rate limiting** en `request-otp` y `verify-otp` + respuesta genérica (anti-enumeración) · RNF-01.3, diseño §8
- [x] **T1.8** `UsersModule` — `GET /users/me` · diseño §6
- [x] **T1.9** `ReservationsModule` — `GET /reservations/me` · RF-01.4
- [x] **T1.10** `POST /reservations` (crear: fecha, hora, personas, estado `confirmed`) · RF-01.6
- [ ] **T1.11** Tests: use-cases de auth (OTP válido/expirado/intentos) y reservas · seguridad

### Mobile

- [x] **T1.12** `apiClient` con inyección JWT (adjunta token, refresca en 401 con single-flight) · diseño §3
- [x] **T1.13** `authStore` (Zustand) + `expo-secure-store`: sesión, tokens, hidratación · diseño §3
- [x] **T1.14** Pantalla **ingreso de email** → solicita OTP (`react-hook-form + zod`) · RF-01.2
- [x] **T1.15** Pantalla **ingreso de código OTP** (reenvío, error claro en ES) · RF-01.2
- [x] **T1.16** Pantalla **Bienvenida**: saludo personalizado + "Comenzar"/"Ver mi reserva" + logout · RF-01.1, RF-01.3, RF-01.7
- [x] **T1.17** Pantalla **detalle de reserva** (lista de reservas) · RF-01.4
- [x] **T1.18** Pantalla **crear reserva** (cuando no hay una) · RF-01.6
- [x] **T1.19** Navegación: auth flow → MainTabs según sesión (hydrate + estado del store) · diseño §3

**Criterios de aceptación a cubrir**: login OTP, rechazo de OTP inválido/expirado,
creación de reserva, acceso a vista previa del recorrido.

---

## Fase 2 — Feature 02: Mapa interactivo (plano ilustrado)

> **Estado: COMPLETADA (2026-09-09)** — T2.1–T2.6 implementadas y validadas (tsc api/mobile exit 0, bundle Metro 200). Tests automatizados pendientes junto con T1.11.

Referencia: [F02 requirements](../features/02-interactive-map/requirements.md)

### Backend

- [x] **T2.1** `ItineraryModule` — `GET /itinerary`: hitos del día para la reserva · RF-02.1, RF-02.5

### Mobile

- [x] **T2.2** **Plano del predio** con imagen ilustrada (`ImageBackground`) y pines dinámicos desde el backend · RF-02.3, diseño §2.1 _(se descartó el SVG abstracto; pan/zoom diferido, el mapa cuadrado entra en pantalla)_
- [x] **T2.3** Puntos de interés **clicables** sobre el plano (abren el popup de detalle) · RF-02.2
- [x] **T2.4** **Hitos del recorrido** (hora, nombre, descripción) mostrados en el popup de detalle · RF-02.1
- [x] **T2.5** Vista de **detalle de un punto** (popup/bottom-sheet al tocar el pin) · RF-02.2
- [x] **T2.6** **Guardar ruta offline** (persistir itinerario en el dispositivo con AsyncStorage; botón "Descargar ruta" + fallback offline en el fetch) · RF-02.4, RNF-02.2

> Asset del plano: imagen ilustrada propia empaquetada en `apps/mobile/assets/map/venue-map.png` (sin proveedor externo, disponible offline de forma natural).

---

## Fase 3 — Feature 03: Check-in QR + Notificaciones push

Referencia: [F03 requirements](../features/03-digital-checkin/requirements.md)

### Backend

- [x] **T3.1** `CheckinModule` — `POST /checkin`: valida `qrToken` de entrada + reserva confirmada de hoy, crea `CheckIn` (idempotente) · RF-03.2, diseño §7.2
- [x] **T3.2** Prisma model `DeviceToken` + migración (tablas `CheckIn`/`DeviceToken` aplicadas) · diseño §5
- [ ] **T3.3** `NotificationsModule` — `POST /devices` y `DELETE /devices/:token` · RF-03.7, diseño §6 _(Lote C — diferido hasta development build)_
- [ ] **T3.4** Envío de **push remotas** vía Expo Push API (ej. bienvenida al check-in) · RF-03.6, diseño §7.3 _(Lote C — diferido: Expo Go no soporta push remotas desde SDK 53)_

### Mobile

- [x] **T3.5** **Escáner QR** con `expo-camera` + manejo de permisos · RF-03.1, RNF-03.2
- [x] **T3.6** Flujo de **confirmación de check-in** + mensaje de error claro (ES) para QR no reconocido · RF-03.3, RF-03.5
- [x] **T3.7** **Método alternativo** de activación sin cámara (código manual) · RF-03.4
- [ ] **T3.8** Solicitud de permiso de notificaciones + **registro del push token** (`POST /devices`) · RF-03.7 _(Lote C — diferido hasta development build)_
- [x] **T3.9** **Notificaciones locales** (recordatorio de reserva) · RF-03.7, diseño §7.3 _(código completo y type-safe; degradación elegante en Expo Go Android — verificación en dispositivo Android diferida al development build de Lote C)_
- [ ] **T3.10** Recepción/manejo de **push remotas** en foreground/background · RF-03.6 _(Lote C — diferido hasta development build)_

---

## Fase 4 — Feature 04: Menú principal

> **Estado: COMPLETADA (2026-09-09)** — T4.1–T4.6 implementadas y validadas (tsc shared/mobile exit 0). Decisiones: menú **sin precios**; Staff = **chatbot con Q&A predefinido** (sin IA); huerta **texto + imágenes** (por URL). El contenido vive en un **artefacto editable** (`apps/mobile/src/content/`) que el equipo edita para crear su data.

Referencia: [F04 requirements](../features/04-main-menu/requirements.md)

### Mobile (sin backend — data quemada)

- [x] **T4.1** Contenido estático tipado (`apps/mobile/src/content/` menu/garden/guide) con contratos en `packages/shared` en **español** · RNF-04.3
- [x] **T4.2** **Bottom tabs**: Mapa · Menú · Huerta · Staff (ya cableadas en `MainTabs`) · RF-04.1, diseño §3
- [x] **T4.3** Pantalla **Menú** (carta del restaurante, sin precios, con imágenes) · RF-04.2
- [x] **T4.4** Pantalla **Huerta** (huerta/riego/compostaje, texto + imágenes) · RF-04.3
- [x] **T4.5** Pantalla **Staff / Guía** (chatbot con Q&A predefinido, sin IA) · RF-04.4
- [x] **T4.6** Saludo personalizado persistente ("¡Hola Daniela!") en la pantalla Menú · RF-04.6

---

## Fase 5 — Despliegue y endurecimiento

- [ ] **T5.1** Migraciones Prisma aplicadas en Neon (prod) · diseño §2.2
- [ ] **T5.2** Deploy de `apps/api` en hosting free (Render/Fly.io) bajo **dominio propio** · diseño §2.2
- [ ] **T5.3** **Health-check / keep-alive** periódico para mitigar cold start · diseño §10
- [ ] **T5.4** Endurecer: **CORS** restringido, HTTPS, secrets en env, no loguear OTP/tokens · diseño §8
- [ ] **T5.5** Build de la app con **EAS** (Expo) para instalar en dispositivo · diseño §2.1
- [ ] **T5.6** Smoke test end-to-end del recorrido completo (login → reserva → check-in → push)

---

## Notas de secuencia

- **Fase 0 → 1** son bloqueantes y secuenciales.
- **Fases 2, 3 y 4** pueden avanzar en paralelo una vez cerrada la Fase 1
  (comparten el auth/API client, pero no dependen entre sí).
- **Fase 5** se hace al final, aunque conviene desplegar temprano un "hola mundo"
  de la API para validar dominio + cold start desde el inicio.

## Pendientes que no bloquean el arranque

- Proveedor final de hosting y dominio a comprar (Fase 5).
- Asset SVG del plano del predio (Fase 2).
- ~~¿Ventana horaria del check-in?~~ **Resuelto (2026-09-09)**: el día del negocio se define en `America/Bogota` (constante `RESTAURANT_TIME_ZONE` en `packages/shared`), usado por `checkin.service.ts` para calcular "hoy" de forma determinística (no depende de la zona del proceso/contenedor).

## Visión a futuro (fuera de Etapa 1)

- **Guía inteligente con IA (LLM)**: reemplaza el chatbot de Q&A predefinido por un asistente real. Requiere backend + proveedor de LLM (API key) + costo por uso. Feature aparte, a definir.
- **Mini-CMS de contenido**: subir imágenes desde la app y editar menú/huerta en runtime (backend + storage). Hoy el contenido es un artefacto tipado editable en el repo.
