# Nota Entrega App

Aplicación web para crear, consultar e imprimir notas de entrega con productos, clientes, seriales y cálculo de totales con IVA.

## Funcionalidades

- Crear notas de entrega con datos de cliente.
- Escanear o buscar productos por código de barras o nombre.
- Manejar productos con seriales obligatorios.
- Validar seriales duplicados y cantidades incorrectas.
- Calcular subtotal, IVA y total.
- Consultar historial de notas.
- Buscar notas por número o cliente desde el backend.
- Imprimir la nota o guardarla como PDF desde el diálogo del navegador.
- Gestionar productos y clientes.
- Configurar datos de la empresa.

## Tecnologías

- React 19
- Vite
- TypeScript
- Express
- tRPC
- Drizzle ORM
- MySQL / TiDB
- Tailwind CSS
- shadcn/ui

## Instalación

```bash
pnpm install
```

## Variables de entorno

Crea un archivo `.env` con la conexión a la base de datos:

```env
DATABASE_URL="mysql://usuario:password@host:puerto/base_de_datos"
```

## Base de datos

Para generar y aplicar migraciones:

```bash
pnpm db:push
```

## Ejecutar en desarrollo

```bash
pnpm dev
```

## Scripts útiles

```bash
pnpm check      # Validación TypeScript
pnpm test       # Pruebas
pnpm build      # Compilación de producción
pnpm format     # Formatear código
```

## Flujo recomendado

1. Cargar productos.
2. Configurar datos de empresa.
3. Crear clientes.
4. Crear una nueva nota de entrega.
5. Escanear productos con pistola de código de barras.
6. Agregar seriales cuando el producto lo requiera.
7. Guardar la nota.
8. Imprimir o guardar como PDF.

## Cambios de robustez incluidos

- Guardado completo de nota, líneas y seriales en una sola operación backend: `notes.createComplete`.
- Validaciones de seriales en frontend y backend.
- Eliminación del fallback peligroso `insertId || 1`.
- Corrección del hook de eliminación de nota en `NoteDetail.tsx`.
- Búsqueda de notas en backend.
- Número de nota editable.
- Mejor comportamiento para pistola de código de barras con tecla Enter.
- Índices de base de datos para líneas y seriales.

## Seguridad

Antes de publicar el repositorio, no subas:

- `.env`
- claves API
- tokens
- contraseñas
- bases de datos locales
- datos reales de clientes

