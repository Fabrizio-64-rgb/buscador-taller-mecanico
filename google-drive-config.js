// ============================================
// CONFIGURACIÓN DE GOOGLE DRIVE API
// ============================================

// 🔑 IMPORTANTE: Reemplaza 'TU_CLIENT_ID_AQUI' con tu Client ID de Google Cloud Console
// Ejemplo: '123456789-abcdefg.apps.googleusercontent.com'
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI';

// Scope necesario para subir archivos a Drive
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Configuración de la API
const GOOGLE_API_KEY = ''; // Opcional, solo si necesitas API Key adicional
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
