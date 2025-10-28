# 📖 Guía de Uso Detallada - Buscador Taller Mecánico

## 1️⃣ Primeros pasos

### Requisitos
- Un navegador web (Chrome, Firefox, Edge, Safari)
- Tu archivo Excel con datos de clientes o reparaciones
- 5 minutos de tu tiempo

### Descarga
1. Descarga el archivo `buscador_simple.html`
2. Guárdalo en una carpeta de tu computadora
3. Haz doble clic para abrir en tu navegador

---

## 2️⃣ Preparar tus datos en Excel

### Paso 1: Estructura correcta

Tu archivo Excel debe tener esta estructura:

**Fila 1 (Encabezados):**
```
DNI | Nombre | Apellido | Patente | Modelo Auto | Correo Electrónico | Teléfono
```

**Filas siguientes (Datos):**
```
12345678 | Juan | Pérez | ABC123 | Toyota Corolla | juan@email.com | 3764123456
87654321 | María | González | XYZ789 | Ford Fiesta | maria@email.com | 3764987654
```

### Paso 2: Guardar como CSV

#### En Windows (Excel):
1. Abre tu archivo: `1353.xlsx`
2. Ve a **Archivo** → **Guardar como**
3. En "Tipo de archivo", selecciona: **CSV (separado por comas) (*.csv)**
4. Haz clic en **Herramientas** → **Opciones de guardado**
5. Marca: ✓ **UTF-8 con marca de orden de bytes**
6. Haz clic en **Guardar**

#### En Mac (Excel):
1. **Archivo** → **Guardar como**
2. Formato: **CSV (separado por comas)**
3. Encoding: Asegúrate que dice **UTF-8**
4. **Guardar**

#### En Google Sheets (recomendado para evitar problemas):
1. Abre tu hoja en Google Sheets
2. **Archivo** → **Descargar** → **CSV**
3. Se descargará automáticamente en UTF-8

---

## 3️⃣ Cargar tus datos

### Opción A: Cargar archivo CSV (Recomendado)

1. Abre `buscador_simple.html` en tu navegador
2. Verás una pantalla con dos pestañas: **Cargar Archivo** y **Pegar Datos**
3. Asegúrate que estés en la pestaña **Cargar Archivo**
4. Haz clic en **"Seleccionar archivo"** o arrastra tu CSV sobre la zona gris
5. Selecciona tu archivo CSV
6. ¡Verás un mensaje verde diciendo que se cargaron los datos!

### Opción B: Copiar y Pegar (Más rápido)

Si quieres evitar guardar el CSV, puedes pegar directamente:

1. Abre tu Excel
2. Selecciona todos los datos: **Ctrl+A** (Windows) o **Cmd+A** (Mac)
3. Copia: **Ctrl+C** (Windows) o **Cmd+C** (Mac)
4. Abre `buscador_simple.html`
5. Haz clic en la pestaña **Pegar Datos**
6. Haz clic en el cuadro de texto grande
7. Pega: **Ctrl+V** (Windows) o **Cmd+V** (Mac)
8. Haz clic en **✓ Cargar datos**
9. ¡Listo!

---

## 4️⃣ Buscar datos

### Búsqueda básica

1. Después de cargar los datos, verás:
   - Un **ComboBox** (dropdown) con los nombres de las columnas
   - Un **cuadro de texto** para escribir lo que buscas
   - Botones **Buscar** y **Limpiar**

2. **Selecciona un campo** en el ComboBox
   - Ejemplo: "Patente"

3. **Escribe lo que buscas** en el cuadro de texto
   - Ejemplo: "ABC123"

4. **Presiona "Buscar"** o simplemente **Enter**

5. ¡Verás los resultados en la tabla!

### Ejemplos de búsqueda

| Campo | Buscar por | Resultado |
|-------|-----------|-----------|
| DNI | 12345678 | Muestra todos los registros con ese DNI |
| Patente | ABC | Muestra todos los autos que comienzan con "ABC" |
| Nombre | Juan | Muestra a Juan García, Juan López, etc. |
| Modelo Auto | Toyota | Muestra todos los Toyota (Corolla, Hilux, etc.) |
| Correo Electrónico | gmail | Muestra todos los correos de Gmail |

### Búsqueda parcial

**Importante:** La búsqueda es **flexible y parcial**:
- Si buscas "García", encuentra "García", "garcía", "GARCÍA"
- Si buscas "ABC", encuentra "ABC123", "ABCXYZ", "ABC-123"
- Si buscas "eléctr", encuentra "Correo Electrónico"

---

## 5️⃣ Funciones principales

### Botón Buscar 🔍
- Filtra los datos según el criterio que ingresaste
- Muestra solo los registros que coinciden
- Puedes presionar **Enter** como atajo

### Botón Limpiar ✕
- Borra lo que escribiste
- Limpia los resultados
- Te deja listo para buscar de nuevo

### Estadísticas
En la pantalla verás:
- **Total registros**: Cuántos datos cargaste
- **Resultados encontrados**: Cuántos coincidieron con tu búsqueda

### Tabla de resultados
Muestra todos los registros encontrados con todas sus columnas

---

## 🎯 Casos de uso prácticos

### Caso 1: Buscar un cliente por DNI
1. ComboBox: Selecciona "DNI"
2. Cuadro: Escribe "12345678"
3. Buscar
4. ¡Ves todos los datos del cliente!

### Caso 2: Ver todos los autos de una marca
1. ComboBox: Selecciona "Modelo Auto"
2. Cuadro: Escribe "Toyota"
3. Buscar
4. ¡Ves todos los Toyota!

### Caso 3: Encontrar un vehículo por patente
1. ComboBox: Selecciona "Patente"
2. Cuadro: Escribe "ABC123"
3. Buscar
4. ¡Listo!

### Caso 4: Ver clientes de una ciudad
1. ComboBox: Selecciona "Ciudad" (si la tienes en tu Excel)
2. Cuadro: Escribe "Misiones" o "Garuhapé"
3. Buscar
4. ¡Ves a todos los clientes de esa zona!

---

## ⚠️ Solución de problemas

### Problema 1: "No carga mi archivo CSV"
**Causas posibles:**
- El archivo no es CSV, es XLSX
- La primera línea del CSV no tiene encabezados

**Solución:**
- Convierte a CSV: Archivo → Guardar como → CSV
- Asegúrate que la primera fila tiene nombres de columnas

### Problema 2: "Las tildes se ven como ¿ o ?"
Ejemplo: "Correo Electr?nico" en lugar de "Electrónico"

**Causas posibles:**
- Guardaste el CSV sin UTF-8
- Usaste Excel en lugar de Google Sheets

**Solución:**
1. Abre tu Excel
2. **Archivo → Guardar como → CSV**
3. Haz clic en **Herramientas → Opciones de guardado**
4. Marca: **UTF-8 con marca de orden de bytes**
5. Guarda
6. Intenta de nuevo

### Problema 3: "No me muestra todos mis datos"
**Solución:**
- Asegúrate que tu Excel no tiene filas vacías en el medio
- Borra las filas vacías
- Guarda como CSV
- Intenta cargar de nuevo

### Problema 4: "El navegador no abre el HTML"
**Solución:**
1. Haz clic derecho en `buscador_simple.html`
2. "Abrir con" → Chrome/Firefox/Edge
3. O arrastra el archivo directamente al navegador

### Problema 5: "Cargo los datos pero no me aparecen los filtros"
**Solución:**
- Asegúrate que tu CSV tiene datos después de la primera fila
- El archivo está vacío o solo tiene encabezados

---

## 💡 Consejos y trucos

### ✨ Truco 1: Búsqueda rápida
Usa palabras clave en lugar de escribir el dato completo:
- En lugar de "Toyota Corolla", busca "Toyota" o "Corolla"
- En lugar de "juan.perez@gmail.com", busca "juan" o "gmail"

### ✨ Truco 2: Búsqueda sin distinción de mayúsculas
Puedes escribir en minúsculas y encontrará mayúsculas:
- Busca: "abc123" → Encuentra: "ABC123"
- Busca: "juan" → Encuentra: "JUAN", "Juan", "juan"

### ✨ Truco 3: Actualizar datos
Para actualizar tus datos sin recargar la página:
1. Haz clic en "Cargar Archivo" de nuevo
2. Selecciona el nuevo archivo
3. Automáticamente recarga todo

### ✨ Truco 4: Copiar resultados
Puedes seleccionar la tabla con Ctrl+A y copiar a Excel

### ✨ Truco 5: Busca siempre lo que recuerdas
Si no recuerdas el DNI completo pero recuerdas parte de él:
- DNI: 12345678 → Busca "3456"
- Patente: ABC123 → Busca "BC1"

---

## 📱 Uso en celular

El buscador funciona perfectamente en celular:
1. Abre el archivo HTML en tu celular
2. Todo se adapta automáticamente
3. Los botones se hacen más grandes
4. Es totalmente táctil

---

## ✅ Checklist de uso

Antes de usar:
- ☑️ Tengo un navegador actualizado
- ☑️ Mi archivo Excel está en la carpeta de descargas
- ☑️ Guardé el archivo como CSV
- ☑️ El CSV tiene la primera fila con encabezados
- ☑️ El CSV está en UTF-8

Para buscar:
- ☑️ Abrí el HTML en el navegador
- ☑️ Cargué el archivo CSV
- ☑️ Seleccioné un campo en el ComboBox
- ☑️ Escribí algo para buscar
- ☑️ Presioné "Buscar" o Enter

---

## 🚀 Siguientes pasos

¿Quieres mejorar el buscador? Puedes:
1. Agregar más columnas a tu Excel
2. Actualizar regularmente los datos
3. Compartir el HTML con tu equipo (todos pueden usarlo)
4. Hacer una copia de seguridad de tu CSV

---

**¿Necesitas ayuda?** Revisa esta guía nuevamente o consulta la sección "Solución de problemas"

Última actualización: Octubre 2025
