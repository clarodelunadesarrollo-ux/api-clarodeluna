# Reservas — Edición, eliminación y límite por usuario

## User Story

Como cliente de Claro de Luna, mientras mi reserva **no esté confirmada** quiero
poder **editarla o eliminarla**, y quiero que el sistema me permita tener como
máximo **2 reservas activas**, escondiendo el formulario de nueva reserva cuando
ya llegué a ese límite.

## Business Rules

- **Nuevo estado `pending`**: toda reserva nueva nace `pending` (no confirmada).
- **Confirmación automática al check-in**: cuando el invitado hace check-in al
  llegar, su reserva de ese día pasa de `pending` a `confirmed`.
- **Edición / eliminación**: permitidas **solo** cuando la reserva está `pending`.
  Una vez `confirmed` (o `completed` / `no_show`) queda bloqueada.
- **Eliminación = borrado real** del registro (libera cupo del límite).
- **Límite de 2 reservas activas** por usuario. "Activas" = `pending` + `confirmed`.
  Las `completed` / `no_show` no cuentan.
- **Formulario oculto** cuando el usuario tiene 2 reservas activas (salvo que esté
  editando una existente).
- **Auto-borrado de reservas vencidas**: las reservas de días anteriores que sigan
  `pending` o `confirmed` se eliminan solas (liberan cupo). Se purgan al consultar
  las reservas del usuario y antes de crear una nueva. "Hoy" se resuelve en la zona
  del restaurante (`America/Bogota`). El borrado cascadea `CheckIn` e itinerario.

## Acceptance Criteria

- [ ] Una reserva recién creada aparece como `Pendiente`.
- [ ] En una reserva `Pendiente` se ven acciones "Editar" y "Eliminar".
- [ ] Editar permite cambiar fecha, hora y cantidad de personas; guardar actualiza la reserva.
- [ ] Eliminar borra la reserva (con confirmación previa) y libera un cupo.
- [ ] Una reserva `Confirmada` NO muestra editar/eliminar.
- [ ] Al hacer check-in, la reserva del día pasa a `Confirmada`.
- [ ] Con 2 reservas activas, el formulario de nueva reserva no se muestra.
- [ ] El backend rechaza crear una 3ª reserva activa (400) y editar/eliminar una no `pending` (400).
- [ ] Una reserva `pending` o `confirmed` de un día anterior no aparece: se borra sola al consultar o al crear.
- [ ] Sin errores de TypeScript en shared, api y mobile.

## API Changes

- `PATCH /reservations/:id` — editar (solo dueño, solo `pending`).
- `DELETE /reservations/:id` — eliminar (solo dueño, solo `pending`).
- `POST /reservations` — ahora valida el límite de 2 activas y crea en `pending`.
- Check-in: acepta reservas `pending|confirmed` del día y confirma la reserva.

## Out of Scope

- Cancelar una reserva ya confirmada.
- Cambiar el límite (2) por configuración.
- Notificaciones de recordatorio para reservas `pending` (solo `confirmed`).
