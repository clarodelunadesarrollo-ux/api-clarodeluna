# Claro de Luna — App móvil del cliente

> "Más que un restaurante… una experiencia que nace de la tierra."

Aplicación móvil nativa (React Native, iOS + Android) que acompaña al comensal de
**Claro de Luna** a lo largo de toda su experiencia: desde la bienvenida digital
hasta la conexión con la huerta, la historia y la sostenibilidad del lugar.

## Objetivo del producto

Que el cliente se sienta **recibido, informado y conectado con el propósito del
restaurante** desde el primer contacto, generando una expectativa positiva y única
antes, durante y después de su visita.

## Principios de diseño

- **Cliente primero**: cada pantalla reduce fricción y aporta contexto.
- **Conexión con la tierra**: la narrativa de origen, huerta y sostenibilidad
  atraviesa toda la experiencia.
- **Español de cara al cliente**: todo el texto visible para el comensal está en
  español. El código, contratos de API, identificadores y documentación técnica
  permanecen en inglés.
- **Móvil nativo**: React Native para iOS y Android desde una única base de código.

## Alcance actual — Etapa 1: Llegada y conexión con la tierra

Esta primera etapa está **definida en detalle** y se compone de cuatro momentos.
Cada uno tiene su propia carpeta con user story, requerimientos y criterios de
aceptación:

| # | Momento | Carpeta |
|---|---------|---------|
| 1 | Bienvenida y reserva | [`01-welcome-and-reservation/`](./01-welcome-and-reservation/requirements.md) |
| 2 | Mapa interactivo del recorrido | [`02-interactive-map/`](./02-interactive-map/requirements.md) |
| 3 | Check-in digital (QR) | [`03-digital-checkin/`](./03-digital-checkin/requirements.md) |
| 4 | Menú principal | [`04-main-menu/`](./04-main-menu/requirements.md) |

### Resultado esperado de la Etapa 1

- El cliente se siente bienvenido, informado y conectado con el propósito.
- Conoce el lugar, la historia y el recorrido.
- Se genera una expectativa positiva y única desde el inicio.

### Diseño técnico

El **CÓMO** de la Etapa 1 (arquitectura, stack, modelo de datos, contratos de API y
flujos) está en [`../design/technical-design.md`](../design/technical-design.md).

### Plan de tareas

El desglose accionable por fases (fundaciones → features → deploy) está en
[`../tasks/etapa-1-tasks.md`](../tasks/etapa-1-tasks.md).

## Roadmap — visión a futuro (NO definido en detalle)

Las siguientes etapas forman parte de la visión completa del producto, pero **aún
no cuentan con información suficiente para escribir requerimientos**. Se documentan
aquí como marco. Cada una se bajará a requerimientos detallados cuando se disponga
de su alcance, reglas de negocio y criterios de aceptación.

- **Etapa 2+ (por definir)**: experiencia durante la visita (talleres, huerta,
  pedido en mesa, maridajes, etc.).
- **Cierre y post-visita (por definir)**: feedback, fidelización, contenido de
  seguimiento.

> Regla: no se escribe requerimiento detallado de una etapa sin información real.
> La ficción en requerimientos es deuda técnica disfrazada de plan.

## Decisiones clave confirmadas

| Tema | Decisión |
|------|----------|
| Plataforma | React Native (iOS + Android), móvil nativo |
| Autenticación | Email + código OTP de un solo uso (sin contraseña, sin login social) |
| Reservas | Se pueden crear; **no** se modifican ni cancelan desde la app en esta fase |
| Mapa | **Plano propio del predio en SVG interactivo** (puntos clicables, pan/zoom) |
| Check-in | Un único **QR fijo** en la entrada (no por reserva ni mesa) |
| Notificaciones | **Push locales + remotas** (Expo Push) — dentro de esta etapa |
| Backend | **NestJS propio** desde cero, hosting free + **dominio propio** |
| Email OTP | Proveedor **gratis** (Resend free tier) |
| Base de datos | Postgres gestionado gratis (Neon) |
| Contenido (menú/huerta) | **Data quemada / estática** (MVP), sin CMS ni panel de administración |
| Idioma | Contenido de cara al cliente en **español**; código en inglés |

## Fuera de alcance (esta versión)

Documentado explícitamente para evitar ambigüedad. Son **visión a futuro**:

- Gafas de realidad aumentada (AR) y contenido interactivo en tiempo real.
- Conectividad 5G / satélite como requisito de infraestructura del producto.
- Versión web / PWA (esta fase es móvil nativa).

## Convenciones de esta documentación

- Un feature = una carpeta bajo `docs/features/`.
- Cada feature contiene, como mínimo, `requirements.md` con:
  user story, requerimientos funcionales, requerimientos no funcionales,
  criterios de aceptación (Gherkin), fuera de alcance y preguntas abiertas.
- Criterios de aceptación en formato **Given / When / Then** (Arrange / Act / Assert).
