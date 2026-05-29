# Sistema de Notas de Entrega - Guía de Uso

## Introducción

El **Sistema de Notas de Entrega** es una aplicación web profesional diseñada para empresas que necesitan emitir notas de entrega de forma ágil, elegante y eficiente. La aplicación permite crear, gestionar, imprimir y exportar notas de entrega con soporte para múltiples seriales por producto.

---

## Características Principales

### 1. **Dashboard Principal**
- Acceso rápido a todas las funciones principales
- Resumen de las últimas notas emitidas
- Navegación intuitiva a través de tarjetas interactivas

### 2. **Crear Notas de Entrega**
- Formulario ágil y optimizado para entrada rápida de datos
- Búsqueda de productos por código de barras o nombre
- Autocomplete compatible con lectores de código de barras
- Gestión de múltiples líneas de productos
- Cálculos automáticos de subtotales, IVA y totales

### 3. **Gestión de Seriales**
- Soporte para productos con números de serie
- Agregar múltiples seriales por línea de producto
- Visualización clara de seriales en la nota impresa

### 4. **Impresión y PDF**
- Vista de impresión profesional con encabezado empresarial
- Tabla de productos con detalles completos
- Bloque de totales con IVA al 16%
- Área de firmas (Entregado por / Recibido conforme)
- Compatible con impresoras estándar
- Exportación a PDF

### 5. **Lista de Notas**
- Visualización de todas las notas emitidas
- Búsqueda por número de nota o cliente
- Paginación para fácil navegación
- Acciones rápidas: ver, imprimir, descargar PDF

### 6. **Configuración Empresarial**
- Panel para actualizar datos de la empresa
- Campos: RIF, nombre, dirección, teléfonos, email, website
- Tasa de IVA configurable

### 7. **Gestión de Productos**
- Tabla completa de productos
- Agregar, editar y eliminar productos
- Campos: código de barras, nombre, descripción, precio, unidad
- Marcador de productos con serial

---

## Flujo de Trabajo

### Paso 1: Configurar Datos Empresariales
1. Desde el dashboard, haz clic en **"Configuración"**
2. Completa los datos de tu empresa:
   - **RIF**: Número de identificación fiscal
   - **Nombre**: Nombre oficial de la empresa
   - **Dirección**: Domicilio completo
   - **Teléfono(s)**: Números de contacto
   - **Email**: Correo electrónico
   - **Website**: Sitio web (opcional)
   - **Tasa IVA**: Porcentaje de IVA (por defecto 16%)
3. Haz clic en **"Guardar Cambios"**

### Paso 2: Gestionar Productos
1. Desde el dashboard, haz clic en **"Gestión de Productos"** (accesible desde el menú)
2. Haz clic en **"Nuevo Producto"**
3. Completa los datos:
   - **Código de Barras**: Código único del producto
   - **Nombre**: Nombre del producto *
   - **Descripción**: Detalles adicionales
   - **Precio**: Precio unitario *
   - **Unidad**: Unidad de medida (Unidad, Caja, Paquete, Kg, Litro)
   - **Tiene Serial**: Marca si el producto tiene número de serie
4. Haz clic en **"Guardar"**

### Paso 3: Crear una Nota de Entrega
1. Desde el dashboard, haz clic en **"Nueva Nota"**
2. Completa los datos del cliente:
   - **Nombre/Razón Social**: Nombre del cliente *
   - **RIF**: Número de identificación (opcional)
   - **Dirección**: Domicilio del cliente (opcional)
   - **Teléfono**: Número de contacto (opcional)
   - **Contacto/Atención**: Persona de contacto (opcional)
3. **Agregar Productos**:
   - En el campo de búsqueda, escribe el nombre o código de barras del producto
   - Selecciona el producto de la lista
   - Ingresa la cantidad
   - El precio se carga automáticamente
   - El subtotal se calcula automáticamente
4. **Si el producto tiene serial**:
   - Haz clic en **"Agregar Serial"** en la fila del producto
   - Ingresa el número de serie
   - Puedes agregar múltiples seriales
5. **Revisar Totales**:
   - Subtotal: Suma de todos los productos
   - IVA (16%): Impuesto calculado automáticamente
   - Total Neto: Subtotal + IVA
6. Haz clic en **"Guardar Nota"** para crear la nota

### Paso 4: Imprimir o Descargar PDF
1. Desde la lista de notas, haz clic en el icono **"Ojo"** para ver la nota
2. O desde la nota recién creada, usa los botones:
   - **Imprimir**: Abre el diálogo de impresión del navegador
   - **PDF**: Descarga la nota como archivo PDF
3. La nota se imprime con:
   - Encabezado empresarial
   - Datos del cliente
   - Tabla de productos con seriales
   - Bloque de totales
   - Área de firmas

### Paso 5: Gestionar Notas Emitidas
1. Desde el dashboard, haz clic en **"Mis Notas"**
2. Busca notas por:
   - Número de nota
   - Nombre del cliente
3. Acciones disponibles:
   - **Ojo**: Ver detalle de la nota
   - **Impresora**: Imprimir la nota
   - **Descarga**: Descargar como PDF

---

## Consejos de Uso

### Búsqueda de Productos
- Compatible con lectores de código de barras: escanea directamente en el campo de búsqueda
- Busca por nombre o código de barras
- Los resultados aparecen mientras escribes

### Gestión de Seriales
- Usa seriales para productos con garantía o identificación única
- Puedes agregar múltiples seriales por línea
- Los seriales aparecen en la nota impresa

### Impresión
- Para mejor resultado, usa papel tamaño carta o A4
- Configura márgenes mínimos en tu impresora
- Prueba una impresión de prueba antes de imprimir en cantidad

### Datos del Cliente
- Completa al menos el nombre del cliente
- Los demás campos son opcionales pero recomendados
- Los datos se guardan en la nota para referencia futura

---

## Cálculos Automáticos

La aplicación calcula automáticamente:

1. **Subtotal por Línea**: Cantidad × Precio Unitario
2. **Subtotal de Nota**: Suma de todos los subtotales
3. **IVA**: Subtotal × 16% (configurable)
4. **Total Neto**: Subtotal + IVA

Todos los cálculos se realizan en tiempo real mientras completas la nota.

---

## Preguntas Frecuentes

**P: ¿Puedo editar una nota después de crearla?**
R: Actualmente, las notas son de solo lectura una vez guardadas. Para cambios, puedes crear una nueva nota.

**P: ¿Cuál es el límite de productos por nota?**
R: No hay límite. Puedes agregar tantos productos como necesites.

**P: ¿Puedo cambiar la tasa de IVA?**
R: Sí, en la sección de Configuración puedes ajustar la tasa de IVA.

**P: ¿Los datos se guardan automáticamente?**
R: Los datos se guardan cuando haces clic en "Guardar Nota". Asegúrate de hacer clic antes de cerrar.

**P: ¿Puedo acceder desde mi teléfono?**
R: Sí, la aplicación es responsive y funciona en dispositivos móviles.

---

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de soporte.

---

**Versión**: 1.0.0  
**Última actualización**: Mayo 2026
