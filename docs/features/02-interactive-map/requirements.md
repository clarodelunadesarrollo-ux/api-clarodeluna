# Feature 02 — Mapa interactivo del recorrido

**Etapa 1 · Momento 2 — Mapa interactivo**

## Contexto

El cliente visualiza el recorrido del día, con horarios, puntos de interés y una
breve descripción de cada experiencia. Puede descargar la ruta en su celular o
(a futuro) verla en sus gafas.

## User story

> **Como** comensal de Claro de Luna,
> **quiero** ver el recorrido del día con sus horarios y puntos de interés,
> **para** entender qué voy a vivir y organizar mi visita.

## Actores

- **Cliente / comensal**.
- **Sistema**: app móvil + backend que provee el itinerario del día.

## Requerimientos funcionales

- **RF-02.1** — La app muestra el **recorrido del día** como una secuencia de
  hitos con **hora**, **nombre** y **descripción breve** (ej. Llegada y recepción
  9:00, Huerta 9:30, Restaurante 12:00, Cierre 15:00).
- **RF-02.2** — Cada punto de interés es **seleccionable** y muestra su detalle.
- **RF-02.3** — La app presenta una **vista de mapa basada en un plano propio del
  predio** (imagen/ilustración del lugar, **sin proveedor de mapas externo**) con los
  puntos de interés ubicados sobre él (restaurante, huerta, talleres, etc.).
- **RF-02.4** — El cliente puede **descargar / guardar la ruta** en su dispositivo
  para consultarla sin conexión.
- **RF-02.5** — El itinerario refleja los **horarios reales** de la experiencia
  reservada por el cliente.

## Requerimientos no funcionales

- **RNF-02.1** — Textos de cara al cliente en **español**; código y contratos en inglés.
- **RNF-02.2** — El mapa y el itinerario funcionan con conectividad limitada;
  la ruta descargada es consultable **offline**.
- **RNF-02.3** — Rendimiento fluido al desplazar/hacer zoom en el mapa.
- **RNF-02.4** — Compatibilidad iOS y Android.

## Criterios de aceptación (Gherkin)

```gherkin
Escenario: Validar visualización del recorrido del día
  Given un cliente autenticado con una experiencia reservada
  When abre el mapa interactivo
  Then ve la lista ordenada de hitos con su hora, nombre y descripción

Escenario: Validar detalle de un punto de interés
  Given un cliente en el mapa interactivo
  When selecciona el punto "Huerta"
  Then ve la descripción y el horario de esa experiencia

Escenario: Validar descarga de la ruta para uso offline
  Given un cliente en el mapa interactivo
  When toca "Descargar ruta"
  And luego pierde la conexión a internet
  Then puede seguir consultando la ruta guardada
```

## Fuera de alcance (este feature)

- Navegación GPS turn-by-turn en tiempo real.
- Visualización del recorrido en gafas AR.
- Personalización dinámica del itinerario por el cliente.

## Decisiones tomadas

- **Fuente del mapa**: plano propio del predio (asset ilustrado), sin proveedor externo.
  Al ser una imagen propia empaquetada con la app, el plano y la ruta quedan
  disponibles **offline de forma natural** (no requiere descarga de tiles).

## Preguntas abiertas

- ¿El itinerario es fijo por día o varía según el tipo de reserva/paquete?
- ¿Con qué formato/resolución se entrega el plano del predio (SVG, PNG de alta resolución)?
