// ============================================
// INTEGRACIÓN CON GOOGLE DRIVE
// ============================================

let tokenClient;
let accessToken = null;
let gapiInited = false;
let gisInited = false;

// Inicializar Google API cuando la página carga
function initializeGoogleDrive() {
    if (typeof GOOGLE_CLIENT_ID === 'undefined' || GOOGLE_CLIENT_ID === 'TU_CLIENT_ID_AQUI') {
        console.warn('Google Drive no configurado. Edita google-drive-config.js con tu Client ID');
        return;
    }

    gapi.load('client', initializeGapiClient);
    initTokenClient();
}

// Inicializar GAPI Client
async function initializeGapiClient() {
    try {
        await gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        console.log('✓ Google API Client inicializado');
    } catch (error) {
        console.error('Error inicializando GAPI:', error);
    }
}

// Inicializar Token Client (OAuth 2.0)
function initTokenClient() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_SCOPES,
            callback: (response) => {
                if (response.error !== undefined) {
                    mostrarError('Error de autenticación: ' + response.error);
                    return;
                }
                accessToken = response.access_token;
                gisInited = true;
                console.log('✓ Token de acceso obtenido');
            },
        });
    } catch (error) {
        console.error('Error inicializando token client:', error);
    }
}

// Función principal: Guardar certificado en Drive
async function guardarEnDrive() {
    const btnGuardar = document.getElementById('btnGuardarDrive');

    // Validar que la configuración esté completa
    if (typeof GOOGLE_CLIENT_ID === 'undefined' || GOOGLE_CLIENT_ID === 'TU_CLIENT_ID_AQUI') {
        mostrarError('⚠️ Configura primero el Client ID de Google en google-drive-config.js');
        return;
    }

    // Deshabilitar botón mientras procesa
    btnGuardar.disabled = true;
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '⏳ Procesando...';

    try {
        // Si no hay token, solicitar autorización
        if (!accessToken) {
            mostrarInfo('🔐 Solicitando autorización de Google Drive...');

            // Solicitar token
            await new Promise((resolve, reject) => {
                tokenClient.callback = (response) => {
                    if (response.error !== undefined) {
                        reject(new Error(response.error));
                        return;
                    }
                    accessToken = response.access_token;
                    resolve();
                };

                tokenClient.requestAccessToken({ prompt: 'consent' });
            });

            mostrarExito('✓ Autorización concedida');
        }

        // Generar PDF del certificado
        mostrarInfo('📄 Generando PDF del certificado...');
        const pdfBlob = await generarPDFCertificado();

        // Subir a Google Drive
        mostrarInfo('☁️ Subiendo a Google Drive...');
        const fileId = await subirADrive(pdfBlob);

        // Mostrar éxito con link
        const driveLink = `https://drive.google.com/file/d/${fileId}/view`;
        mostrarExito(`✓ Certificado guardado! <a href="${driveLink}" target="_blank" style="color: white; text-decoration: underline;">Ver en Drive</a>`);

    } catch (error) {
        console.error('Error guardando en Drive:', error);
        mostrarError('❌ Error: ' + error.message);
    } finally {
        // Rehabilitar botón
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

// Generar PDF del certificado usando html2canvas + jsPDF
async function generarPDFCertificado() {
    const certificado = document.querySelector('.certificate-print');

    if (!certificado) {
        throw new Error('No se encontró el certificado');
    }

    // Capturar el certificado como imagen
    const canvas = await html2canvas(certificado, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    });

    // Convertir canvas a imagen
    const imgData = canvas.toDataURL('image/png');

    // Crear PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const imgWidth = 210; // A4 width en mm
    const pageHeight = 297; // A4 height en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Convertir PDF a Blob
    return pdf.output('blob');
}

// Subir archivo a Google Drive
async function subirADrive(blob) {
    // Obtener datos del certificado para el nombre del archivo
    const nombreCliente = document.getElementById('nombreCliente').value || 'Cliente';
    const patenteVehiculo = document.getElementById('patenteVehiculo').value || 'SinPatente';
    const fecha = new Date().toISOString().split('T')[0];

    const nombreLimpio = nombreCliente.replace(/\s+/g, '_');
    const fileName = `Certificado_${patenteVehiculo}_${nombreLimpio}_${fecha}.pdf`;

    // Metadata del archivo
    const metadata = {
        name: fileName,
        mimeType: 'application/pdf'
    };

    // Crear form data para multipart upload
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    // Subir archivo
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        },
        body: form
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || 'Error subiendo archivo');
    }

    const result = await response.json();
    return result.id;
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGoogleDrive);
} else {
    initializeGoogleDrive();
}
