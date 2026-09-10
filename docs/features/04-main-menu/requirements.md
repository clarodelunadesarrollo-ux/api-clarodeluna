# Feature 04 — Menú principal

**Etapa 1 · Momento 4 — Menú principal**

## Contexto

Desde la app, el cliente tiene acceso al menú del restaurante, su guía personal y
contenido especial sobre la huerta, el sistema de riego y el compostaje. Es el
hub de navegación de la experiencia una vez dentro.

## User story

> **Como** comensal de Claro de Luna,
> **quiero** un menú principal que reúna el menú del restaurante y el contenido de
> la experiencia,
> **para** explorar la propuesta gastronómica y conectar con el origen de lo que como.

## Actores

- **Cliente / comensal**.
- **Sistema**: app móvil + backend de contenido (menú, huerta, guía).

## Requerimientos funcionales

- **RF-04.1** — La app presenta un **menú principal** con navegación a las secciones
  clave: **Mapa**, **Menú**, **Huerta** y **Staff / Guía**.
- **RF-04.2** — Sección **Menú**: el cliente ve la **carta del restaurante**
  (platos, descripciones; precios si aplica).
- **RF-04.3** — Sección **Huerta**: contenido especial sobre la **huerta, el
  sistema de riego y el compostaje**.
- **RF-04.4** — Sección **Guía / Staff**: acceso a la **guía personal** del cliente
  y/o al equipo que lo acompaña.
- **RF-04.5** — La sección **Mapa** enlaza al recorrido interactivo (Feature 02).
- **RF-04.6** — El saludo personalizado se mantiene (ej. "¡Hola Daniela!").

## Requerimientos no funcionales

- **RNF-04.1** — Textos de cara al cliente en **español**; código y contratos en inglés.
- **RNF-04.2** — Navegación clara con acceso a cualquier sección en ≤ 2 toques.
- **RNF-04.3** — En esta fase (MVP) el contenido (menú, huerta) es **estático /
  precargado en la app** (data quemada). **No hay CMS ni panel de administración**;
  actualizar el contenido implica un nuevo despliegue. El contenido se estructura de
  forma que facilite migrar a una fuente de datos externa más adelante.
- **RNF-04.4** — Imágenes optimizadas para carga rápida en móvil.
- **RNF-04.5** — Compatibilidad iOS y Android.

## Criterios de aceptación (Gherkin)

```gherkin
Escenario: Validar navegación del menú principal
  Given un cliente autenticado dentro de la experiencia
  When abre el menú principal
  Then ve las secciones "Mapa", "Menú", "Huerta" y "Staff"
  And puede navegar a cada una

Escenario: Validar visualización de la carta del restaurante
  Given un cliente en la sección "Menú"
  When explora la carta
  Then ve los platos con su descripción

Escenario: Validar contenido de la huerta
  Given un cliente en la sección "Huerta"
  When abre el contenido
  Then ve información sobre la huerta, el riego y el compostaje
```

## Fuera de alcance (este feature)

- Pedido de platos desde la app / pago en mesa (etapa futura).
- Contenido de huerta en realidad aumentada.
- Recomendaciones personalizadas por IA.

## Decisiones tomadas

- **Sin CMS**: el contenido es **data quemada / estática** en la app (MVP). Actualizar
  requiere un nuevo despliegue.
- **Idioma**: todo el contenido de cara al cliente en **español**.

## Preguntas abiertas

- ¿El menú muestra precios? (el contenido es estático en esta fase)
- ¿La "guía personal" es una persona asignada, un chatbot, o contenido estático?
- ¿El contenido de huerta es estático o multimedia (video, 360°)?
