# Realidad Virtual — Conexión con gafas AR

## User Story

Como cliente de Claro de Luna que ya hizo check-in, quiero entrar a un menú de
Realidad Virtual y conectar mis gafas de realidad aumentada, para iniciar la
experiencia inmersiva "de la huerta a la mesa".

## Scope (Etapa 1 — Demo)

Esta primera etapa es una **experiencia simulada (mockup)** con la estética de la
marca. No integra hardware real de gafas ni SDKs de fabricantes. El objetivo es
presentar el flujo al cliente y dejar el punto de extensión para una integración
real posterior (BLE o SDK específico).

## Requirements

- Nuevo tab "VR" en la barra inferior, visible **solo después del check-in**
  (mismo gating que Mapa / Menú / Huerta).
- La pantalla presenta la experiencia con copy de marca en español.
- Botón principal "Conectar mis gafas" que dispara un flujo de estados simulado:
  1. `searching` — "Buscando gafas cercanas…"
  2. `connecting` — "Conectando con tus gafas…"
  3. `connected` — "¡Gafas conectadas!"
- En estado conectado se muestra el nombre del dispositivo simulado y las
  acciones "Iniciar experiencia" (placeholder) y "Desconectar".
- Los temporizadores del flujo se limpian al desmontar o al desconectar (sin
  fugas de memoria).

## Acceptance Criteria

- [ ] El tab VR aparece únicamente cuando el invitado ya hizo check-in (o es staff).
- [ ] Al tocar "Conectar mis gafas" se ve la secuencia Buscando → Conectando → Conectado.
- [ ] "Desconectar" vuelve el estado a inicial y detiene cualquier temporizador pendiente.
- [ ] La UI usa la paleta y componentes existentes (Screen, Button, theme).
- [ ] Sin errores de TypeScript (`tsc --noEmit`).

## Out of Scope (etapas futuras)

- Emparejamiento/escaneo Bluetooth (BLE) real (`react-native-ble-plx`, permisos,
  dev-client, rebuild).
- Integración con un SDK de gafas específico (Meta Quest, XREAL, Rokid, Vuzix…).
- Streaming/render de contenido AR.

## Technical Notes

- Frontend: `apps/mobile/src/screens/VrScreen.tsx`.
- Navegación: nuevo `Tab.Screen name="VR"` en `apps/mobile/src/navigation/MainTabs.tsx`,
  dentro del bloque `hasFullAccess`.
- Punto de extensión: la función `connect()` concentra la lógica simulada; ahí se
  reemplazaría por el escaneo/emparejamiento real cuando se defina el hardware.
