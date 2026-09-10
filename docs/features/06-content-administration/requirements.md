# Feature 06 — Administración de contenido (menú y huerta)

**Etapa 1 · Extensión del Momento 4 — Gestión de contenido por admin**

## Contexto

En la Feature 04 el contenido del menú y la huerta es **estático** (un artefacto
tipado en la app). El negocio necesita que un **administrador autorizado** pueda
**crear, editar y eliminar** ese contenido **desde la app**, sin depender de un
nuevo despliegue, y que el cambio lo vean **todos los comensales**.

Para que un cambio del admin sea visible para todos, el contenido deja de vivir en
un archivo del cliente y pasa a la **base de datos**, servido por el backend. La
autorización se hace por **rol admin** (correos en `ADMIN_EMAILS`), reutilizando la
infraestructura existente (`resolveRole`, `JwtAuthGuard`, chequeo de rol en el
controlador, igual que el código de entrada).

## User story

> **Como** administrador autorizado de Claro de Luna,
> **quiero** crear, editar y eliminar los platos del menú y las secciones de la
> huerta desde la app, incluyendo sus imágenes,
> **para** mantener el contenido actualizado sin depender del equipo técnico ni de
> un nuevo despliegue.

## Actores

- **Administrador**: usuario cuyo email está en `ADMIN_EMAILS` (rol `admin`).
- **Comensal**: consume el contenido en modo lectura.
- **Sistema**: API (contenido + almacenamiento de imágenes) + app móvil.

## Alcance

- Gestionable por admin: **Menú** (secciones + platos), **Huerta** (secciones) y
  **Guía** (preguntas y respuestas del chatbot).
- La Guía sigue **sin IA**: las respuestas son predefinidas (texto fijo); lo que el
  admin gestiona es el listado de pares pregunta/respuesta.

## Requerimientos funcionales

- **RF-06.1** — El API expone lectura pública (autenticada) del menú y la huerta.
- **RF-06.2** — El API expone **crear / editar / eliminar** menú y huerta, **solo
  para rol `admin`**; cualquier otro rol recibe `403`.
- **RF-06.3** — El admin puede **subir una imagen** para un plato o sección; el API
  la almacena y devuelve su URL, que queda persistida con el contenido.
- **RF-06.4** — La app muestra **pantallas de administración** (crear/editar/borrar)
  **visibles solo si el usuario es admin**, con el mismo criterio de gating ya usado
  para el código de entrada.
- **RF-06.5** — Las pantallas de lectura (Menú, Huerta) obtienen el contenido del
  **API** (ya no del archivo estático).
- **RF-06.6** — Al eliminar una sección de menú se eliminan sus platos asociados.

## Requerimientos no funcionales

- **RNF-06.1** — Textos de cara al cliente en **español**; código y contratos en inglés.
- **RNF-06.2** — Autorización de escritura **siempre** en el backend (nunca confiar
  solo en ocultar la UI). El cliente oculta la UI admin; el API la hace cumplir.
- **RNF-06.3** — El almacenamiento de imágenes se hace **detrás de una interfaz
  (`StorageService`)**. La implementación de esta fase es **disco local** (apta para
  desarrollo/MVP). **Advertencia**: en hosting free (Render/Fly) el disco es
  **efímero** y las imágenes se pierden al reiniciar; **antes de producción** se debe
  cambiar la implementación a un proveedor durable (Cloudinary/S3) — es un cambio de
  un solo archivo por diseño.
- **RNF-06.4** — Validación de imágenes: tipo (jpg/png/webp) y tamaño máximo.
- **RNF-06.5** — Compatibilidad iOS y Android (selector de imagen del dispositivo).

## Criterios de aceptación (Gherkin)

```gherkin
Escenario: Validar que un admin crea un plato con imagen
  Given un administrador autenticado (email en ADMIN_EMAILS)
  When crea un plato con nombre, descripción e imagen
  Then el plato queda guardado y visible en la sección Menú para todos los comensales

Escenario: Validar que un no-admin no puede modificar contenido
  Given un comensal (rol guest) autenticado
  When intenta crear, editar o eliminar contenido
  Then el API responde 403 y la app no muestra las opciones de administración

Escenario: Validar edición y eliminación
  Given un administrador con contenido existente
  When edita un plato y luego elimina otro
  Then los cambios se reflejan para todos los comensales en la siguiente carga

Escenario: Validar eliminación en cascada de una sección de menú
  Given una sección de menú con platos
  When el administrador elimina la sección
  Then se eliminan también los platos de esa sección
```

## Fuera de alcance (este feature)

- Respuestas con IA en la Guía (sigue con respuestas predefinidas; su versión con IA es visión futura).
- Almacenamiento durable en la nube (queda como cambio previo a producción, RNF-06.3).
- Roles de edición intermedios (p. ej. `qa` editando contenido): solo `admin` escribe.
- Historial/versionado de contenido, borradores o publicación programada.

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| Persistencia | Contenido en **Postgres** (menú y huerta) vía Prisma |
| Autorización | Solo rol **`admin`** (reutiliza `ADMIN_EMAILS` + guard existente) |
| Alcance | **Menú + Huerta + Guía** gestionables por admin |
| Imágenes | **Subida de archivo real** detrás de `StorageService`; impl. actual **disco local** (MVP) |
| UI admin | **Pantallas dentro de la app**, visibles solo para `admin` |
| Precios | El menú **no** muestra precios (heredado de F04) |

## Preguntas abiertas

- Proveedor durable de imágenes para producción (Cloudinary / S3): a decidir antes
  del deploy (RNF-06.3, T5.2).
- ¿Límite de tamaño/dimensiones exacto para las imágenes subidas? (RNF-06.4).

## Estado de implementación

**Backend (apps/api/src/content/)** — COMPLETO, validado (tsc exit 0):
- Modelos Prisma `MenuSection`, `MenuItem` (cascade delete), `GardenSection`
  (migración `20260910035613_add_content_models`) y `GuideQuestion`
  (migración `add_guide_questions`).
- `ContentService`: lectura (menú/huerta/guía) + CRUD de secciones, items y preguntas.
- `ContentController` (`/api/v1/content/...`): `GET menu|garden|guide` (cualquier rol
  autenticado); `POST/PATCH/DELETE` de secciones/items/preguntas admin-gated (403 si no admin);
  `POST images` con `FileInterceptor`, valida MIME (jpg/png/webp) y tamaño (5 MB),
  devuelve URL absoluta.
- `StorageService` (interfaz) + `LocalDiskStorageService` (disco local, RNF-06.3);
  imágenes servidas en `/uploads` vía `useStaticAssets` en `main.ts`.
- `apps/api/uploads/` ignorado en `.gitignore`.
- Contenido de ejemplo **seedeado** en la base local (2 secciones de menú, 2 platos,
  3 secciones de huerta, 10 preguntas de guía).

**Mobile (apps/mobile/src/)** — COMPLETO, validado (tsc exit 0):
- `features/content/api.ts`: lectura, CRUD (menú/huerta/guía) y `uploadImage` (multipart).
- `MenuScreen` y `HuertaScreen`: leen del API (TanStack Query); ya **no** usan
  archivos estáticos (`content/menu.ts` y `content/garden.ts` eliminados).
- `StaffScreen` (Guía): lee las preguntas del API. El comensal toca una pregunta y
  desaparece de las sugerencias (una sola vez). Admin: sección **Administrar preguntas**
  con "+ Nueva pregunta" y "Editar / Eliminar" por pregunta (`FormModal`). El texto de
  intro del chat sigue estático (`content/guide.ts`).
- **UI de administración inline** (RF-06.4): visible solo si `role === 'admin'`.
  Botones "+ Nueva sección / + Agregar plato" y "Editar / Eliminar" por elemento;
  formularios en `FormModal` con `ImagePickerField` (expo-image-picker) para subir
  imagen real. El comensal ve todo en modo lectura.
- Nota de diseño: la administración quedó **inline en las mismas pantallas** (editar
  "desde el artefacto") en lugar de pantallas separadas — cumple RF-06.4 y encaja con
  el pedido de gestionar el contenido en su propio lugar.

**Pendiente**: verificación en dispositivo; proveedor durable de imágenes para prod.
