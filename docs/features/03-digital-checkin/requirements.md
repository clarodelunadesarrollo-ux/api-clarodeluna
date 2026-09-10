# Feature 03 — Check-in digital (QR)

**Etapa 1 · Momento 3 — Check-in digital**

## Contexto

Al llegar, el cliente escanea un código QR en la entrada para registrar su llegada,
activar su perfil y recibir mensajes personalizados durante toda la experiencia.

## User story

> **Como** comensal que llega a Claro de Luna,
> **quiero** escanear un código QR en la entrada,
> **para** registrar mi llegada y activar mi experiencia personalizada.

## Actores

- **Cliente / comensal**.
- **Sistema**: app móvil (cámara/escáner) + backend de check-in.

## Requerimientos funcionales

- **RF-03.1** — La app permite **escanear un código QR** desde la cámara del
  dispositivo.
- **RF-03.2** — Existe un **QR fijo en la entrada**. Al escanearlo, el sistema
  **registra la llegada** (check-in) del cliente **autenticado**, asociándola a su
  reserva.
- **RF-03.3** — Tras el check-in, la app muestra una **confirmación** y activa el
  estado "en el restaurante" del perfil.
- **RF-03.4** — El cliente puede activar la experiencia **también desde la entrada**
  del restaurante (alternativa presencial al QR, ej. código manual).
- **RF-03.5** — Un QR inválido, expirado o no correspondiente a la reserva muestra
  un **mensaje de error claro** en español.
- **RF-03.6** — Tras el check-in, la app puede **entregar mensajes personalizados**
  de bienvenida al recinto.
- **RF-03.7** — Los mensajes personalizados se entregan mediante **notificaciones push**
  remotas (disparadas por el backend vía Expo Push) y/o **notificaciones locales**
  programadas en el dispositivo. La app solicita permiso de notificaciones y registra
  su push token.

## Requerimientos no funcionales

- **RNF-03.1** — Textos de cara al cliente en **español**; código y contratos en inglés.
- **RNF-03.2** — El escaneo solicita permiso de cámara de forma explícita y maneja
  el rechazo con un flujo alternativo (RF-03.4).
- **RNF-03.3** — El QR de entrada es **fijo** (no expira). La seguridad del check-in
  recae en la **sesión autenticada del cliente** y en la validación de su reserva en
  el backend: el QR identifica el punto de entrada, **no autentica por sí solo**.
- **RNF-03.4** — El check-in responde en < 2 s tras un escaneo válido.
- **RNF-03.5** — Compatibilidad iOS y Android.

## Criterios de aceptación (Gherkin)

```gherkin
Escenario: Validar check-in exitoso con QR válido
  Given un cliente autenticado con reserva para el día de hoy
  When escanea el código QR de la entrada
  Then el sistema registra su llegada
  And la app muestra la confirmación de check-in

Escenario: Validar rechazo de un QR no reconocido
  Given un cliente autenticado en la pantalla de escaneo
  When escanea un código QR que no corresponde a la entrada de Claro de Luna
  Then la app muestra un mensaje de error claro en español
  And no registra el check-in

Escenario: Validar activación alternativa sin cámara
  Given un cliente que no otorga permiso de cámara
  When elige la opción de activación desde la entrada
  Then puede registrar su llegada mediante el método alternativo
```

## Fuera de alcance (este feature)

- Geofencing / detección automática de llegada por ubicación.
- Activación de contenido por gafas AR.

## Decisiones tomadas

- **QR**: un único **QR fijo en la entrada** (no por reserva ni por mesa) en esta fase.
- **Mensajes personalizados**: se entregan por **notificaciones push** (locales +
  remotas vía Expo Push).

## Preguntas abiertas

- ¿El check-in tiene ventana horaria (ej. ±30 min de la reserva)?
