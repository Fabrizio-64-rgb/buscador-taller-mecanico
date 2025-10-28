# 🔧 Buscador Taller Mecánico

Sistema simple y práctico de búsqueda y filtrado de datos para talleres mecánicos. Permite cargar una base de datos en Excel/CSV y buscar clientes, vehículos y reparaciones de forma rápida y fácil.

## ✨ Características

- ✅ **Interfaz simple** - Un combobox para elegir campo y un cuadro de texto para buscar
- ✅ **Sin instalación** - Solo necesitas abrir el archivo HTML en tu navegador
- ✅ **Funciona offline** - No requiere internet ni servidores
- ✅ **Manejo de tildes** - Soporta correctamente caracteres acentuados (á, é, í, ó, ú, ñ)
- ✅ **Dos formas de cargar datos**:
  - Cargar archivo CSV
  - Copiar y pegar directamente desde Excel
- ✅ **Búsqueda flexible** - Filtra por cualquier columna
- ✅ **Resultados en tabla** - Muestra todos los registros que coinciden
- ✅ **Interfaz responsive** - Funciona en computadora, tablet y celular
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

### Buscar datos

1. Selecciona un campo en el **ComboBox** (DNI, Patente, Nombre, etc.)
2. Escribe lo que buscas en el **cuadro de texto**
3. Presiona **Buscar** o simplemente **Enter**
4. ¡Verás los resultados en la tabla!

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

## 🎯 Caso de uso

**Perfecto para:**
- Talleres mecánicos pequeños y medianos
- Búsqueda rápida de clientes por DNI, patente o nombre
- Consultar historial de reparaciones
- Localizar vehículos por modelo
- Cualquier negocio que maneje base de datos simple

## 📝 Ejemplo de datos

Tu archivo Excel debe tener esta estructura:

| DNI | Nombre | Apellido | Patente | Modelo Auto | Correo Electrónico | Teléfono |
|-----|--------|----------|---------|-------------|-------------------|----------|
| 12345678 | Juan | Pérez | ABC123 | Toyota Corolla | juan@email.com | 3764123456 |
| 87654321 | María | González | XYZ789 | Ford Fiesta | maria@email.com | 3764987654 |

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

**Última actualización:** Octubre 2025
**Versión:** 1.0.0
