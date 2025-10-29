# 📝 Configuración de Google Drive - Guía Paso a Paso

## ⚡ Resumen Rápido

Para habilitar la función "Guardar en Drive", necesitas obtener un **Client ID** de Google Cloud Console y configurarlo en el archivo `google-drive-config.js`.

---

## 🚀 Paso 1: Crear Proyecto en Google Cloud Console

1. **Ve a:** https://console.cloud.google.com/
2. **Inicia sesión** con tu cuenta de Google
3. **Haz clic** en "Select a project" (arriba a la izquierda)
4. **Haz clic** en "NEW PROJECT"
5. **Nombre del proyecto:** `Buscador Taller Mecánico`
6. **Haz clic** en "CREATE"
7. **Espera** unos segundos hasta que se cree el proyecto

---

## 📚 Paso 2: Habilitar Google Drive API

1. En el menú lateral, ve a: **"APIs & Services" → "Library"**
2. Busca: **"Google Drive API"**
3. Haz clic en **"Google Drive API"**
4. Haz clic en **"ENABLE"**
5. Espera a que se habilite (aparecerá "API enabled")

---

## 🔐 Paso 3: Configurar Pantalla de Consentimiento

1. En el menú lateral, ve a: **"APIs & Services" → "OAuth consent screen"**
2. Selecciona: **"External"**
3. Haz clic en: **"CREATE"**
4. Completa el formulario:
   - **App name:** `Buscador Taller Mecánico`
   - **User support email:** (tu email de Google)
   - **Developer contact information:** (tu email de Google)
5. Haz clic en: **"SAVE AND CONTINUE"**
6. En "Scopes", haz clic en: **"SAVE AND CONTINUE"** (sin agregar nada)
7. En "Test users", haz clic en: **"+ ADD USERS"**
   - Agrega tu email de Google
   - Haz clic en: **"ADD"**
8. Haz clic en: **"SAVE AND CONTINUE"**
9. Revisa y haz clic en: **"BACK TO DASHBOARD"**

---

## 🎫 Paso 4: Crear OAuth Client ID

1. En el menú lateral, ve a: **"APIs & Services" → "Credentials"**
2. Haz clic en: **"+ CREATE CREDENTIALS"**
3. Selecciona: **"OAuth client ID"**
4. **Application type:** `Web application`
5. **Name:** `Buscador Taller Web Client`
6. En **"Authorized JavaScript origins"**, haz clic en "+ ADD URI" y agrega:
   ```
   http://localhost
   ```
7. Si vas a usar el puerto 5500 (Live Server), también agrega:
   ```
   http://127.0.0.1:5500
   ```
8. Si tienes un dominio, agrégalo también:
   ```
   https://tudominio.com
   ```
9. Haz clic en: **"CREATE"**

---

## 📋 Paso 5: Copiar Client ID

1. Aparecerá un popup con tu **Client ID**
2. Copia el Client ID (se ve algo así):
   ```
   123456789-abcdefghijklmnop.apps.googleusercontent.com
   ```
3. Si cerraste el popup, puedes verlo en la lista de "OAuth 2.0 Client IDs"

---

## ⚙️ Paso 6: Configurar en la Aplicación

1. Abre el archivo: `google-drive-config.js`
2. Reemplaza `'TU_CLIENT_ID_AQUI'` con tu Client ID real:

```javascript
// ANTES:
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI';

// DESPUÉS:
const GOOGLE_CLIENT_ID = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
```

3. Guarda el archivo

---

## ✅ Paso 7: Probar la Integración

1. Abre `index.html` en tu navegador
2. Carga un archivo CSV
3. Genera un certificado
4. Haz clic en **"💾 Guardar en Drive"**
5. **Primera vez:** Se abrirá un popup de Google pidiendo autorización
   - Selecciona tu cuenta de Google
   - Haz clic en "Advanced" si aparece advertencia
   - Haz clic en "Go to Buscador Taller Mecánico (unsafe)"
   - Haz clic en "Continue"
   - Acepta los permisos
6. El certificado se subirá automáticamente a tu Google Drive
7. Aparecerá una notificación con un link directo al archivo

---

## 🎯 ¿Dónde se guardan los certificados?

Los certificados se guardan en la **raíz de tu Google Drive** con el formato:

```
Certificado_PATENTE_NombreCliente_FECHA.pdf
```

Ejemplo:
```
Certificado_ABC123_Juan_Perez_2025-01-15.pdf
```

---

## 🔧 Solución de Problemas

### ❌ Error: "Configuranpm primero el Client ID"
- Verifica que hayas reemplazado `'TU_CLIENT_ID_AQUI'` en `google-drive-config.js`

### ❌ Error: "redirect_uri_mismatch"
- Agrega la URL exacta donde estás abriendo la app en "Authorized JavaScript origins"
- Ejemplo: si usas Live Server en puerto 5500, agrega `http://127.0.0.1:5500`

### ❌ Popup de autorización no aparece
- Verifica que no esté bloqueado por el navegador
- Revisa la consola del navegador (F12) para ver errores

### ❌ Error: "Access blocked: This app's request is invalid"
- Asegúrate de haber configurado la "OAuth consent screen"
- Verifica que tu email esté en la lista de "Test users"

---

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12 → Console)
2. Que todas las librerías se carguen correctamente
3. Que tu Client ID esté configurado correctamente

---

## 🎉 ¡Listo!

Ahora tu aplicación puede guardar certificados automáticamente en Google Drive.

**Características:**
- ✅ Autenticación automática (solo la primera vez)
- ✅ Genera PDF del certificado
- ✅ Nombre de archivo automático con patente y nombre
- ✅ Link directo al archivo en Drive
- ✅ Notificaciones en cada paso del proceso
