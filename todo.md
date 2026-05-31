# Sistema de Notas de Entrega - TODO

## Base de Datos
- [x] Crear tabla de productos (barcode, nombre, descripción, precio, unidad, tieneSerial)
- [x] Crear tabla de notas de entrega (número secuencial, fecha, cliente, subtotal, iva, total)
- [x] Crear tabla de líneas de nota (notaId, productoId, cantidad, precioUnitario, subtotal)
- [x] Crear tabla de seriales (líneaId, serial)
- [x] Crear tabla de configuración empresarial (RIF, dirección, teléfono, email, website)
- [x] Ejecutar migraciones SQL

## Backend (tRPC)
- [x] Procedimiento: crear/listar/actualizar/eliminar productos
- [x] Procedimiento: crear nueva nota de entrega
- [x] Procedimiento: obtener nota por ID
- [x] Procedimiento: listar todas las notas (con búsqueda)
- [x] Procedimiento: agregar línea a nota
- [x] Procedimiento: agregar/eliminar seriales a línea
- [x] Procedimiento: calcular totales automáticamente
- [x] Procedimiento: obtener/actualizar configuración empresarial
- [x] Procedimiento: buscar productos por barcode o nombre

## Frontend - Dashboard
- [x] Crear página principal (dashboard) con resumen de notas recientes
- [x] Botón para crear nueva nota
- [x] Mostrar últimas 5 notas emitidas

## Frontend - Crear Nota
- [x] Formulario con datos del cliente (nombre, RIF, dirección, teléfono, contacto)
- [x] Búsqueda de productos por barcode/nombre con autocomplete
- [x] Agregar productos a la nota (tabla de líneas)
- [x] Gestión de seriales por línea (inline)
- [x] Cálculos automáticos (subtotal línea, subtotal nota, IVA 16%, total neto)
- [x] Botones para guardar, imprimir, exportar PDF

## Frontend - Búsqueda de Productos
- [x] Input de búsqueda compatible con scanner de código de barras
- [x] Autocomplete con resultados por barcode y nombre
- [x] Mostrar precio y descripción en resultados

## Frontend - Gestión de Seriales
- [x] Inline form para agregar seriales a una línea
- [x] Permitir múltiples seriales por línea
- [x] Validar que solo aparezca si el producto tiene serial
- [x] Mostrar lista de seriales agregados

## Frontend - Vista de Impresión/PDF
- [x] Encabezado con datos de la empresa (RIF, dirección, teléfono, email, website)
- [x] Número y fecha de la nota
- [x] Datos del cliente (nombre, RIF, dirección, teléfono, contacto)
- [x] Tabla de productos con: código, descripción, cantidad, precio unitario, subtotal
- [x] Mostrar seriales debajo de cada línea
- [x] Bloque de totales (subtotal, IVA, total neto)
- [x] Área de firmas (Entregado por / Recibido conforme)
- [x] Botón de imprimir
- [x] Botón de descargar PDF

## Frontend - Lista de Notas
- [x] Tabla con todas las notas emitidas
- [x] Columnas: número, fecha, cliente, total
- [x] Búsqueda por número, cliente o fecha
- [x] Acciones: ver detalle, reimprimir, descargar PDF
- [x] Paginación

## Frontend - Configuración Empresarial
- [x] Panel de configuración con campos: RIF, dirección, teléfono(s), email, website
- [x] Guardar cambios
- [x] Mostrar valores actuales

## Frontend - Gestión de Productos
- [x] Tabla de productos con opciones de editar/eliminar
- [x] Formulario para agregar nuevo producto
- [x] Importar productos desde Excel (96 productos cargados exitosamente)

## Diseño y Estilos
- [x] Definir paleta de colores elegante y profesional
- [x] Tipografía refinada
- [x] Espaciado consistente
- [x] Componentes UI pulidos con shadcn/ui
- [x] Responsive design (mobile, tablet, desktop)
- [x] Animaciones suaves y micro-interacciones

## Pruebas
- [x] Tests unitarios para cálculos (subtotal, IVA, total)
- [x] Tests para búsqueda de productos
- [x] Tests para gestión de seriales
- [x] Tests para procedimientos tRPC

## Optimizaciones
- [x] Performance de búsqueda de productos
- [x] Caché de configuración empresarial
- [x] Optimización de queries de base de datos
- [x] Lazy loading de notas

## Entrega
- [x] Checkpoint final
- [x] Documentación de uso (GUIA_DE_USO.md)
- [x] Validación de todas las características


## CAMBIOS FINALES IMPLEMENTADOS (v2)
- [x] Campo applyIVA agregado a la base de datos
- [x] Checkbox para aplicar/no aplicar IVA en el formulario de creación
- [x] Número de nota editable manualmente (no auto-generado)
- [x] Vista de impresión actualizada para mostrar IVA solo si está habilitado
- [x] Todos los tests pasando (17 tests unitarios)


## CAMBIOS FINALES IMPLEMENTADOS (v3 - Clientes y Edición)
- [x] Tabla de clientes agregada a la base de datos
- [x] Procedimientos tRPC para CRUD de clientes
- [x] Búsqueda de clientes con autocomplete en formulario de nota
- [x] Botón de editar nota (preparado para implementación futura)
- [x] Botón de eliminar nota con confirmación
- [x] Procedimiento de eliminación de notas con cascada de líneas y seriales
- [x] Todos los tests pasando (17 tests unitarios)
