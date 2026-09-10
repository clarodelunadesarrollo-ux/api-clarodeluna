# Feature 01 — Bienvenida y reserva

**Etapa 1 · Momento 1 — App / Web / AR**

## Contexto

Desde el primer contacto, el cliente es recibido por una experiencia digital y
sensorial que lo conecta con la historia, la tierra y la esencia del restaurante.
Al abrir la app, el cliente recibe un mensaje de bienvenida personalizado, ve la
información de su reserva y una vista previa del recorrido del día.

## User story

> **Como** comensal con una reserva en Claro de Luna,
> **quiero** recibir una bienvenida personalizada y ver los datos de mi reserva al
> abrir la app,
> **para** sentirme esperado y saber qué experiencia me aguarda.

## Actores

- **Cliente / comensal**: usuario final con o sin reserva activa.
- **Sistema**: app móvil (React Native) + backend de autenticación y reservas.

## Requerimientos funcionales

- **RF-01.1** — La app muestra una pantalla de bienvenida con el nombre del cliente
  (ej. "¡Bienvenida, Daniela!") cuando existe una sesión autenticada.
- **RF-01.2** — La app autentica al cliente mediante **email + código de un solo uso
  (OTP)**: el cliente ingresa su email, recibe un código temporal en su correo y lo
  introduce para iniciar sesión (**sin contraseña**). Incluye reenvío de código y
  cierre de sesión.
- **RF-01.3** — La pantalla de bienvenida muestra un mensaje de contexto sobre la
  experiencia del día (ej. "Hoy te espera una experiencia única, de la huerta a la mesa.").
- **RF-01.4** — El cliente puede ver el **detalle de su reserva** (fecha, hora,
  cantidad de personas, estado).
- **RF-01.5** — El cliente puede acceder a una **vista previa del recorrido** del día
  desde la bienvenida (enlace al Feature 02 — Mapa interactivo).
- **RF-01.6** — Si el cliente **no tiene reserva**, la app ofrece la opción de
  **crear una reserva** (fecha, hora, número de comensales).
- **RF-01.7** — Acciones primarias visibles en la bienvenida: **"Comenzar"** y
  **"Ver mi reserva"**.

## Requerimientos no funcionales

- **RNF-01.1** — Textos de cara al cliente en **español**; código y contratos en inglés.
- **RNF-01.2** — La pantalla de bienvenida carga en < 2 s con conexión estándar.
- **RNF-01.3** — Autenticación segura sin contraseña: el código OTP tiene **expiración
  corta** (ej. 5–10 min) y es de **un solo uso**; límite de intentos y de reenvíos para
  evitar abuso (**rate limiting**); tokens de sesión con expiración; validación de
  entrada en el backend (boundary).
- **RNF-01.4** — Compatibilidad iOS y Android desde una única base de código.
- **RNF-01.5** — Accesibilidad: contraste adecuado, tamaños de fuente escalables,
  labels accesibles en controles.

## Criterios de aceptación (Gherkin)

```gherkin
Escenario: Validar bienvenida personalizada con sesión activa
  Given un cliente autenticado llamado "Daniela" con una reserva confirmada
  When abre la aplicación
  Then ve el mensaje "¡Bienvenida, Daniela!"
  And ve los datos de su reserva
  And ve las acciones "Comenzar" y "Ver mi reserva"

Escenario: Validar inicio de sesión con código OTP por email
  Given un visitante que ingresa un email válido
  When solicita el código de acceso
  Then recibe un código de un solo uso en su correo
  When ingresa el código correcto antes de que expire
  Then queda autenticado en la aplicación

Escenario: Validar rechazo de código OTP incorrecto o expirado
  Given un visitante que solicitó un código de acceso
  When ingresa un código incorrecto o ya expirado
  Then la app muestra un mensaje de error claro en español
  And no inicia la sesión

Escenario: Validar creación de reserva cuando no existe una
  Given un cliente autenticado sin reserva activa
  When selecciona fecha, hora y número de comensales válidos
  And confirma la reserva
  Then la reserva queda registrada con estado "confirmada"
  And el cliente puede verla en el detalle de su reserva

Escenario: Validar acceso a la vista previa del recorrido
  Given un cliente autenticado en la pantalla de bienvenida
  When toca "Comenzar"
  Then navega a la vista previa del recorrido del día
```

## Fuera de alcance (este feature)

- Login con contraseña o login social (Google/Apple): el acceso es únicamente por OTP.
- **Modificación y cancelación de reservas** desde la app (no en esta fase).
- Activación de contenido por gafas AR.
- Pagos / anticipo de reserva (a definir en etapa futura).

## Decisiones tomadas

- **Autenticación**: email + código OTP (passwordless). Sin contraseña ni login social.
- **Reservas**: no se pueden modificar ni cancelar desde la app en esta fase.

## Preguntas abiertas

- ¿Qué campos mínimos definen una reserva válida (alergias, ocasión especial)?
