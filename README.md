# 🔧 Buscador Taller Mecánico - Sistema Completo de Gestión

Sistema completo y profesional de gestión para talleres mecánicos. Permite cargar una base de datos en Excel/CSV, buscar clientes y vehículos, gestionar fotos, llevar historial de reparaciones y realizar búsquedas avanzadas con múltiples filtros.

## ✨ Características Principales

### 🔍 **Búsqueda y Filtrado**
- ✅ **Búsqueda simple** - Un combobox para elegir campo y un cuadro de texto para buscar
- ✅ **Búsqueda avanzada** - Múltiples filtros simultáneos con operadores AND/OR
- ✅ **7 operadores de búsqueda**:
  - Contiene
  - Es igual a
  - Comienza con
  - Termina con
  - Mayor que
  - Menor que
  - No contiene
- ✅ **Filtros dinámicos** - Agrega o elimina filtros según necesites
- ✅ **Búsqueda flexible** - Filtra por cualquier columna

### 📸 **Gestión de Fotos**
- ✅ **Subir fotos desde archivo** - Soporta múltiples archivos
- ✅ **Capturar con cámara** - Toma fotos directamente desde móviles
- ✅ **Galería de fotos** - Visualización en grid responsive
- ✅ **Visor de pantalla completa** - Con navegación entre imágenes
- ✅ **Compresión automática** - Optimiza el espacio de almacenamiento
- ✅ **Eliminar fotos** - Con confirmación de seguridad
- ✅ **Contador de fotos** - Badge visual en cada registro

### 🔧 **Historial de Reparaciones**
- ✅ **Registro completo** - Fecha, costo, descripción, mecánico, estado
- ✅ **Timeline visual** - Historial ordenado cronológicamente
- ✅ **Estados de reparación**:
  - ✅ Completada (verde)
  - ⏳ En Proceso (amarillo)
  - ⏰ Pendiente (rojo)
- ✅ **Estadísticas automáticas**:
  - 💰 Total gastado
  - 🔢 Número de reparaciones
  - 📅 Última visita
- ✅ **CRUD completo** - Crear, leer, actualizar y eliminar reparaciones
- ✅ **Edición inline** - Modifica reparaciones directamente
- ✅ **Contador de reparaciones** - Badge visual en cada registro

### 💾 **Almacenamiento y Datos**
- ✅ **IndexedDB** - Persistencia local de fotos y reparaciones
- ✅ **Sin instalación** - Solo necesitas abrir el archivo HTML en tu navegador
- ✅ **Funciona offline** - No requiere internet ni servidores
- ✅ **Manejo de tildes** - Soporta correctamente caracteres acentuados (á, é, í, ó, ú, ñ)
- ✅ **Dos formas de cargar datos**:
  - Cargar archivo CSV
  - Copiar y pegar directamente desde Excel

### 🎨 **Interfaz y UX**
- ✅ **Resultados en tabla** - Muestra todos los registros que coinciden
- ✅ **Interfaz responsive** - Funciona en computadora, tablet y celular
- ✅ **Animaciones suaves** - Mejora la experiencia de usuario
- ✅ **Navegación por teclado** - ESC para cerrar, flechas para navegar imágenes
- ✅ **Gratuito y sin dependencias** - No requiere librerías externas

## 🚀 Cómo usar

### Opción 1: Cargar archivo CSV

1. Abre tu archivo Excel (1353.xlsx)
2. Haz clic en **Archivo → Guardar como**
3. Selecciona formato **CSV (separado por comas)**
4. Abre `buscador_simple.html` en tu navegador
5. Haz clic en **Cargar Archivo** y selecciona tu CSV
6. ¡Listo! Ahora puedes buscar

### Opción 2: Copiar y Pegar (más rápido)

1. Abre tu Excel
2. Selecciona todos los datos (Ctrl+A)
3. Copia (Ctrl+C)
4. Abre `buscador_simple.html` en tu navegador
5. Ve a la pestaña **Pegar Datos**
6. Pega los datos (Ctrl+V)
7. Haz clic en **Cargar datos**
8. ¡Busca al instante!

### Buscar datos (Búsqueda Simple)

1. Selecciona un campo en el **ComboBox** (DNI, Patente, Nombre, etc.)
2. Escribe lo que buscas en el **cuadro de texto**
3. Presiona **Buscar** o simplemente **Enter**
4. ¡Verás los resultados en la tabla!

### Búsqueda Avanzada (Múltiples Filtros)

1. Haz clic en el botón **🔬 Búsqueda Avanzada**
2. Se abrirá un panel con filtros
3. Para cada filtro:
   - Selecciona el **campo** a buscar
   - Elige el **operador** (contiene, igual a, mayor que, etc.)
   - Escribe el **valor** a buscar
4. Agrega más filtros con el botón **➕ Agregar Filtro**
5. Elige cómo combinar los filtros:
   - **Y (AND)** - El registro debe cumplir TODOS los filtros
   - **O (OR)** - El registro debe cumplir AL MENOS UN filtro
6. Presiona **🔍 Buscar con Filtros**
7. ¡Verás los resultados filtrados!

### Gestionar Fotos del Vehículo

1. Busca un vehículo en la tabla
2. Haz clic en el botón **📸 Ver** en la columna Fotos
3. Se abrirá el modal de fotos
4. Para subir fotos:
   - Haz clic en **📁 Subir desde archivo** (puedes seleccionar múltiples)
   - O haz clic en **📷 Tomar foto** (activa la cámara en móviles)
5. Las fotos aparecerán en una galería
6. Haz clic en cualquier foto para verla en pantalla completa
7. Para eliminar una foto, pasa el mouse sobre ella y haz clic en el botón **×**

### Gestionar Historial de Reparaciones

1. Busca un vehículo en la tabla
2. Haz clic en el botón **🔧 Historial** en la columna Historial
3. Se abrirá el modal con el historial completo
4. Verás las estadísticas del vehículo:
   - Total gastado en reparaciones
   - Número de reparaciones realizadas
   - Fecha de la última visita
5. Para agregar una nueva reparación:
   - Completa el formulario (fecha, costo, descripción, mecánico, estado)
   - Haz clic en **✓ Guardar Reparación**
6. Para editar una reparación:
   - Haz clic en **✏️ Editar** en la reparación deseada
   - Modifica los campos
   - Haz clic en **Actualizar Reparación**
7. Para eliminar una reparación:
   - Haz clic en **🗑️ Eliminar**
   - Confirma la eliminación

## 📋 Estructura del proyecto

```
buscador-taller-mecanico/
├── buscador_simple.html       # Archivo principal (único)
├── README.md                  # Este archivo
├── .gitignore                # Archivos a ignorar en git
└── docs/
    └── guia-uso.md           # Guía detallada de uso
```

## 🛠️ Requisitos

- **Navegador moderno** (Chrome, Firefox, Edge, Safari)
- **Archivo Excel o CSV** con tus datos
- **Nada más** - Sin instalaciones, sin dependencias

## 💻 Navegadores soportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+
- ✅ Opera 76+

## 🎯 Casos de uso

**Perfecto para:**
- 🔧 **Talleres mecánicos pequeños y medianos** - Gestión completa de clientes y vehículos
- 🔍 **Búsqueda rápida** - Por DNI, patente, nombre o cualquier campo
- 📋 **Historial completo** - Registro detallado de todas las reparaciones
- 💰 **Control de gastos** - Seguimiento del gasto total por vehículo
- 📸 **Documentación visual** - Fotos del antes y después de reparaciones
- 🚗 **Localizar vehículos** - Por modelo, año, color, etc.
- 📊 **Búsquedas complejas** - Combina múltiples criterios (ej: Toyota del 2020 con más de $5000 en reparaciones)
- 💼 **Cualquier negocio** - Que maneje base de datos simple con necesidad de fotos y seguimiento

## 📝 Ejemplo de datos

Tu archivo Excel debe tener esta estructura:

| DNI | Nombre | Apellido | Patente | Modelo Auto | Correo Electrónico | Teléfono |
|-----|--------|----------|---------|-------------|-------------------|----------|
| 12345678 | Juan | Pérez | ABC123 | Toyota Corolla | juan@email.com | 3764123456 |
| 87654321 | María | González | XYZ789 | Ford Fiesta | maria@email.com | 3764987654 |

## 🔬 Ejemplos de Búsqueda Avanzada

### Ejemplo 1: Buscar todos los Toyota del 2020 o posterior
**Filtros:**
1. Campo: "Modelo Auto" | Operador: "Contiene" | Valor: "Toyota"
2. Campo: "Año" | Operador: "Mayor que" | Valor: "2019"

**Lógica:** Y (AND)

### Ejemplo 2: Buscar clientes llamados Juan O María
**Filtros:**
1. Campo: "Nombre" | Operador: "Es igual a" | Valor: "Juan"
2. Campo: "Nombre" | Operador: "Es igual a" | Valor: "María"

**Lógica:** O (OR)

### Ejemplo 3: Buscar patentes que comienzan con "AB"
**Filtros:**
1. Campo: "Patente" | Operador: "Comienza con" | Valor: "AB"

**Lógica:** Y (AND)

### Ejemplo 4: Buscar vehículos que NO sean Ford
**Filtros:**
1. Campo: "Modelo Auto" | Operador: "No contiene" | Valor: "Ford"

**Lógica:** Y (AND)

### Ejemplo 5: Búsqueda compleja - Toyota o Ford del 2018 en adelante
**Filtros:**
1. Campo: "Modelo Auto" | Operador: "Contiene" | Valor: "Toyota"
2. Campo: "Modelo Auto" | Operador: "Contiene" | Valor: "Ford"
3. Campo: "Año" | Operador: "Mayor que" | Valor: "2017"

**Lógica:** O (OR) para Toyota/Ford, luego combina con Y (AND) para el año

> **Tip:** Puedes agregar hasta 10+ filtros simultáneos para búsquedas muy específicas!

## 🔧 Configuración de Excel para exportar correctamente

### Windows (Excel):
1. Abre tu archivo Excel
2. **Archivo → Guardar como**
3. Tipo de archivo: **CSV (separado por comas) (*.csv)**
4. Antes de guardar, ve a **Herramientas → Opciones de guardado**
5. Marca: **UTF-8 con marca de orden de bytes**
6. Guarda el archivo

### Mac (Excel):
1. **Archivo → Guardar como**
2. Formato: **CSV (separado por comas) (.csv)**
3. Asegúrate que esté en **UTF-8**
4. Guardar

### Google Sheets:
1. **Archivo → Descargar → CSV**
2. Se descargará automáticamente con la codificación correcta

## ❓ Solución de problemas

### Problema: "Las tildes se muestran como ¿ o ?"

**Solución:**
1. Abre tu Excel
2. Asegúrate de guardar como **CSV con UTF-8**
3. Si es Excel en Windows, usa la opción de "Guardar como" → CSV → Opciones → UTF-8
4. Intenta cargar de nuevo

### Problema: "Los datos no se ven bien en la tabla"

**Solución:**
- Asegúrate que tu archivo tiene encabezados en la primera fila
- Usa "Copiar y Pegar" en lugar de cargar archivo

### Problema: "El navegador dice que no puede abrir el archivo"

**Solución:**
1. Haz clic derecho en `buscador_simple.html`
2. Selecciona "Abrir con" → Chrome/Firefox/Edge
3. O arrastra el archivo al navegador

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso libre.

## 👨‍💻 Autor

Desarrollado como solución práctica para talleres mecánicos en Argentina.

## 🤝 Contribuciones

Si tienes sugerencias o mejoras, ¡puedes hacer un fork y enviar un pull request!

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la sección "Solución de problemas" arriba
2. Verifica que tu archivo CSV está correctamente formateado
3. Asegúrate que usas UTF-8 para la codificación

---

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura y semántica
- **CSS3** - Diseño responsive con flexbox y grid
- **JavaScript ES6+** - Lógica de aplicación
- **IndexedDB** - Base de datos local del navegador para fotos y reparaciones
- **FileReader API** - Lectura de archivos CSV y fotos
- **Canvas API** - Compresión de imágenes
- **Media Capture API** - Acceso a cámara en dispositivos móviles

## 📊 Capacidades Técnicas

- ✅ Almacenamiento ilimitado de fotos y reparaciones (según espacio del navegador)
- ✅ Compresión automática de imágenes (máximo 1200px, calidad 80%)
- ✅ Soporte para archivos CSV grandes (miles de registros)
- ✅ Búsqueda y filtrado en tiempo real
- ✅ Sin límite de filtros en búsqueda avanzada
- ✅ Persistencia de datos entre sesiones
- ✅ Compatible con Excel, Google Sheets, LibreOffice

## 📈 Historial de Versiones

### Versión 2.0.0 (Enero 2025) - **ACTUAL**
- ✨ **NUEVO:** Sistema completo de búsqueda avanzada con múltiples filtros
- ✨ **NUEVO:** 7 operadores de búsqueda (contiene, igual, mayor, menor, etc.)
- ✨ **NUEVO:** Lógica AND/OR para combinar filtros
- ✨ **NUEVO:** Filtros dinámicos (agregar/eliminar ilimitados)
- 🔧 Mejoras en el README con ejemplos detallados

### Versión 1.5.0 (Diciembre 2024)
- ✨ **NUEVO:** Sistema completo de historial de reparaciones
- ✨ **NUEVO:** Timeline visual con estados (completada, en proceso, pendiente)
- ✨ **NUEVO:** Estadísticas automáticas (total gastado, última visita)
- ✨ **NUEVO:** CRUD completo para reparaciones (crear, editar, eliminar)
- ✨ **NUEVO:** IndexedDB v2 con almacenamiento de reparaciones

### Versión 1.2.0 (Noviembre 2024)
- ✨ **NUEVO:** Sistema completo de gestión de fotos
- ✨ **NUEVO:** Subir fotos desde archivo o cámara
- ✨ **NUEVO:** Galería de fotos con visor de pantalla completa
- ✨ **NUEVO:** Compresión automática de imágenes
- ✨ **NUEVO:** Navegación con teclado (ESC, flechas)
- ✨ **NUEVO:** IndexedDB para almacenamiento local

### Versión 1.0.0 (Octubre 2024)
- 🎉 Lanzamiento inicial
- ✅ Búsqueda simple por cualquier campo
- ✅ Carga de CSV o copiar/pegar desde Excel
- ✅ Interfaz responsive
- ✅ Soporte para tildes y caracteres especiales

---

**Última actualización:** Enero 2025
**Versión:** 2.0.0
**Licencia:** MIT - Uso libre y gratuito
