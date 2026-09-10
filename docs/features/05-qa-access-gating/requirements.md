# Feature 05 — Acceso QA y gating por check-in

**Etapa 1 · Control de acceso a la experiencia**

## Contexto

La experiencia de Claro de Luna solo debe estar disponible para clientes que ya
registraron su llegada (check-in). Antes del check-in, el cliente no puede acceder
a ninguna sección (mapa, menú, huerta, staff). Para poder operar y probar, un rol
**QA** puede ver el código de entrada de 4 dígitos (QR + texto) desde la propia app,
y un rol **Admin** puede regenerarlo. El código rota automáticamente cada semana.

## User story

> **Como** comensal que llega a Claro de Luna,
> **quiero** que la app me habilite las secciones solo después de hacer check-in,
> **para** que la experiencia digital acompañe mi llegada real al recinto.

> **Como** miembro del equipo QA,
> **quiero** ver el código de entrada de 4 dígitos (QR + texto) desde la app,
> **para** poder ejecutar y validar el flujo de check-in sin depender del QR físico.

> **Como** admin,
> **quiero** regenerar el código de entrada cuando lo necesite,
> **para** controlar el acceso al recinto además de la rotación automática semanal.

## Actores

- **Cliente / comensal** (rol `guest`).
- **QA** (rol `qa`) — puede ver el código de entrada. Correo autorizado: `kanekydanfort@gmail.com`.
- **Admin** (rol `admin`) — todo lo de QA, más regenerar el código de entrada.
  Correo autorizado: `dlunaj95@gmail.com`.
- **Sistema**: app móvil (navegación por tabs) + backend (roles + check-in + código de entrada).

## Requerimientos funcionales

- **RF-05.1** — El backend asigna el rol `admin` a los correos de `ADMIN_EMAILS`,
  `qa` a los de `QA_EMAILS` y `guest` al resto (jerarquía admin > qa > guest). El rol
  viaja firmado en el JWT de acceso (no falsificable desde el cliente).
- **RF-05.2** — Existe un endpoint protegido que devuelve el **código de entrada de
  4 dígitos** vigente **solo** a usuarios `qa` o `admin`; cualquier otro rol recibe
  `403 Forbidden`.
- **RF-05.3** — La app muestra un tab **"QA"** que renderiza el código QR de entrada
  (que codifica el código de 4 dígitos) y muestra esos 4 dígitos en texto debajo. El
  tab es visible **solo** para usuarios `qa` o `admin`.
- **RF-05.4** — Antes de un check-in exitoso, el cliente `guest` solo ve el tab de
  **Llegada** (check-in). Los tabs Mapa, Menú, Huerta y Staff permanecen **ocultos**.
- **RF-05.5** — Tras un check-in exitoso, la app **habilita** (muestra) el resto de
  los tabs.
- **RF-05.6** — El estado de check-in **persiste**: al reabrir la app, el cliente
  consulta al backend (`GET /checkin/status`) y recupera su acceso si ya hizo check-in.
- **RF-05.7** — Los roles `qa` y `admin` **no están sujetos al gating**: ven todos los
  tabs sin necesidad de check-in, más el tab QA.
- **RF-05.8** — El código de entrada es de **4 dígitos** y **rota automáticamente**
  cada 7 días: si pasó una semana desde el último cambio, se regenera al consultarlo
  (sin cron). El check-in (cámara o manual) valida contra el código vigente.
- **RF-05.9** — Solo el rol `admin` puede **regenerar** el código de entrada a demanda
  (endpoint protegido que genera un código aleatorio nuevo); `qa` y `guest` reciben `403`.
- **RF-05.10** — En el modo "Activar sin cámara", el comensal **tipea** los 4 dígitos
  que ve en la pantalla QA (campo numérico, sin autocompletado, para exigir presencia física).

## Requerimientos no funcionales

- **RNF-05.1** — La autorización del rol se valida en el **backend** (JWT firmado +
  verificación en el endpoint). El cliente nunca decide el rol por sí mismo.
- **RNF-05.2** — Textos de cara al cliente en **español**; código y contratos en inglés.
- **RNF-05.3** — Los correos autorizados se configuran por variables de entorno
  (`QA_EMAILS`, `ADMIN_EMAILS`), no hardcodeados en el bundle del cliente.
- **RNF-05.4** — Compatibilidad iOS y Android.
- **RNF-05.5** — El código de entrada se **persiste** en el backend (modelo
  `EntranceCode`), única fuente de verdad para QR, pantalla QA y validación de check-in.

## Criterios de aceptación

- **AC-1** — Con un correo QA, tras loguear, aparece el tab "QA" y al abrirlo se ve
  un código QR escaneable; el resto de tabs está disponible sin check-in.
- **AC-2** — Con un correo `guest` sin check-in, solo se ve el tab "Llegada"; no hay
  tab "QA" ni acceso a Mapa/Menú/Huerta/Staff.
- **AC-3** — Un `guest` que escanea el QR generado por QA y hace check-in exitoso ve
  aparecer los tabs Mapa/Menú/Huerta/Staff.
- **AC-4** — Tras cerrar y reabrir la app, el `guest` que ya hizo check-in mantiene
  el acceso a todos los tabs (rehidratado desde el backend).
- **AC-5** — Un `guest` que llama al endpoint del código de entrada recibe `403`.
- **AC-6** — En la pantalla QA, el código QR codifica los mismos 4 dígitos que se
  muestran en texto debajo; ambos coinciden con el que valida el check-in.
- **AC-7** — El `admin` (dlunaj95) ve un botón "Generar nuevo código" que reemplaza
  el código; el `qa` (kaneky) ve el código pero **no** el botón, y su POST de
  regeneración recibe `403`.
- **AC-8** — En "Activar sin cámara", el campo acepta exactamente 4 dígitos numéricos
  y el check-in solo procede si coinciden con el código vigente.

## Fuera de alcance

- Panel de administración de roles (se asignan por `QA_EMAILS` / `ADMIN_EMAILS`).
- Que el admin elija manualmente los dígitos del código (siempre se genera aleatorio).
