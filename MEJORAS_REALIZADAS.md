# Mejoras realizadas

## Backend

- Se agregó `createCompleteDeliveryNote` en `server/db.ts`.
- Se agregó `notes.createComplete` en `server/routers.ts`.
- La creación de notas ahora guarda cabecera, líneas y seriales en una transacción.
- Se calcula subtotal, IVA y total antes de guardar.
- Se valida que el número de nota no exista.
- Se valida existencia de productos.
- Se valida cantidad, precio y seriales.
- Se eliminó el riesgo de asociar registros al ID 1 por fallback incorrecto.

## Frontend

- `CreateNote.tsx` ahora usa `notes.createComplete`.
- El número de nota es editable.
- La búsqueda por pistola de código de barras agrega el producto al presionar Enter.
- Si se escanea un producto sin serial ya existente, incrementa cantidad.
- Los seriales se validan contra duplicados.
- No se permite guardar una nota si faltan seriales obligatorios.
- `NotesList.tsx` usa búsqueda backend cuando hay texto de búsqueda.
- El botón PDF abre impresión para guardar como PDF desde el navegador.
- `NoteDetail.tsx` ya no llama hooks dentro de eventos.

## Base de datos

- Se agregaron índices para `note_lines.noteId` y `note_lines.productId`.
- Se agregó índice para `serials.lineId`.
- Se agregó índice único `serials_line_serial_unique` para evitar seriales repetidos dentro de una misma línea.

## Pendiente recomendado

- Implementar generación PDF directa con `jspdf` y `html2canvas` si se quiere descarga automática sin diálogo de impresión.
- Agregar estado de nota: borrador, confirmada, anulada.
- Evitar eliminar productos usados en notas históricas.
- Agregar búsqueda por serial.
