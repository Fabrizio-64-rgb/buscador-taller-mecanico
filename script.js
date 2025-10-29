let datosOriginal = [];
let columnas = [];
let codificacionActual = 'UTF-8';
let searchTimeout = null;
let clienteSeleccionado = null;
let filaSeleccionadaIndex = null;

// Función para normalizar texto (quitar acentos y caracteres especiales)
function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// TAB: Cambiar entre pestañas
function cambiarTab(event, tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    event.target.classList.add('active');
}

// Manejo de carga de archivo CSV
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
let archivoActual = null;

// Drag and drop
uploadSection.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadSection.style.background = '#f0f2ff';
    uploadSection.style.borderColor = '#764ba2';
});

uploadSection.addEventListener('dragleave', () => {
    uploadSection.style.background = '#f8f9fa';
    uploadSection.style.borderColor = '#667eea';
});

uploadSection.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadSection.style.background = '#f8f9fa';
    uploadSection.style.borderColor = '#667eea';
    fileInput.files = e.dataTransfer.files;
    cargarArchivo();
});

fileInput.addEventListener('change', cargarArchivo);

function cargarArchivo() {
    const file = fileInput.files[0];
    if (!file) return;

    archivoActual = file;
    // Intentar primero con Windows-1252 (común en Excel español)
    leerArchivoConCodificacion('Windows-1252');
}

function leerArchivoConCodificacion(codificacion) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let csv = e.target.result;

            // Limpiar BOM si existe (problema común con archivos Excel)
            if (csv.charCodeAt(0) === 0xFEFF) {
                csv = csv.slice(1);
            }

            codificacionActual = codificacion;
            procesarCSV(csv);
        } catch (error) {
            mostrarError('Error al cargar el archivo: ' + error.message);
        }
    };

    reader.readAsText(archivoActual, codificacion);
}

function cargarDatos() {
    const texto = document.getElementById('pasteArea').value;
    if (!texto.trim()) {
        mostrarError('Por favor pega datos primero');
        return;
    }
    procesarCSV(texto);
}

// Función para detectar problemas de codificación
function tieneProblemasDecodificacion(texto) {
    // Buscar caracteres de reemplazo comunes en problemas de codificación
    return texto.includes('�') ||
           texto.includes('Ã') ||
           /[\x80-\xFF]{2,}/.test(texto);
}

function procesarCSV(csv) {
    try {
        const lineas = csv.trim().split('\n');
        if (lineas.length < 1) {
            mostrarError('El archivo está vacío');
            return;
        }

        // Detectar delimitador
        const primeraLinea = lineas[0];
        let delimitador = ',';
        if (primeraLinea.includes('\t')) delimitador = '\t';
        else if (primeraLinea.includes(';')) delimitador = ';';

        // Procesar encabezados
        columnas = primeraLinea.split(delimitador).map(h => h.trim().replace(/"/g, ''));

        // Detectar problemas de codificación
        const textoCompleto = columnas.join(' ');
        if (tieneProblemasDecodificacion(textoCompleto) && archivoActual) {
            mostrarAdvertencia('Detectado problema de codificación. Intentando con UTF-8...');
            // Reintentar con UTF-8
            if (codificacionActual !== 'UTF-8') {
                leerArchivoConCodificacion('UTF-8');
                return;
            }
        }

        // Procesar datos
        datosOriginal = [];
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;

            const valores = linea.split(delimitador).map(v => v.trim().replace(/"/g, ''));
            const fila = {};

            columnas.forEach((col, idx) => {
                fila[col] = valores[idx] || '';
            });

            datosOriginal.push(fila);
        }

        if (datosOriginal.length === 0) {
            mostrarError('No se encontraron datos en el archivo');
            return;
        }

        inicializarBusqueda();
        mostrarExito(`Se cargaron ${datosOriginal.length} registros correctamente (${codificacionActual})`);
        limpiarError();
    } catch (error) {
        mostrarError('Error al procesar datos: ' + error.message);
    }
}

function inicializarBusqueda() {
    // Mostrar sección de búsqueda
    document.getElementById('searchSection').classList.add('active');
    document.getElementById('stats').style.display = 'grid';
    document.getElementById('totalRecords').textContent = datosOriginal.length;

    // Llenar el combobox con las columnas
    const columnSelect = document.getElementById('columnSelect');
    columnSelect.innerHTML = '<option value="">-- Selecciona campo --</option>';

    columnas.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        columnSelect.appendChild(option);
    });

    // Seleccionar primer columna por defecto
    if (columnas.length > 0) {
        columnSelect.value = columnas[0];
        actualizarPlaceholder();
        // Mostrar todos los datos al cargar
        mostrarResultados(datosOriginal);
    }

    // Crear formularios dinámicos para gestión de clientes
    crearFormulariosGestion();
}

// Crear formularios dinámicos
function crearFormulariosGestion() {
    const editForm = document.getElementById('editClienteForm');
    const addForm = document.getElementById('addClienteForm');

    if (!editForm || !addForm) return;

    // Limpiar formularios existentes
    editForm.innerHTML = '';
    addForm.innerHTML = '';

    // Crear campos de edición
    columnas.forEach(col => {
        const editGroup = document.createElement('div');
        editGroup.className = 'form-group';
        editGroup.innerHTML = `
            <label for="edit_${col}">${col}:</label>
            <input type="text" id="edit_${col}" placeholder="${col}">
        `;
        editForm.appendChild(editGroup);
    });

    // Crear campos para agregar nuevo
    columnas.forEach(col => {
        const addGroup = document.createElement('div');
        addGroup.className = 'form-group';
        addGroup.innerHTML = `
            <label for="new_${col}">${col}:</label>
            <input type="text" id="new_${col}" placeholder="${col}">
        `;
        addForm.appendChild(addGroup);
    });
}

function actualizarPlaceholder() {
    const columnSelect = document.getElementById('columnSelect');
    const searchInput = document.getElementById('searchInput');
    const columnaSeleccionada = columnSelect.value;

    if (columnaSeleccionada) {
        searchInput.placeholder = `Buscar por ${columnaSeleccionada}...`;
        searchInput.focus();
    }
}

function buscar() {
    const columnaSeleccionada = document.getElementById('columnSelect').value;
    const textoBusqueda = document.getElementById('searchInput').value.trim();

    if (!columnaSeleccionada) {
        mostrarError('Por favor selecciona un campo para buscar');
        return;
    }

    // Si no hay texto de búsqueda, mostrar todos los resultados
    if (!textoBusqueda) {
        mostrarResultados(datosOriginal);
        return;
    }

    // Normalizar texto de búsqueda
    const textoBusquedaNormalizado = normalizarTexto(textoBusqueda);

    let resultados = datosOriginal.filter(row => {
        const valorCelda = String(row[columnaSeleccionada] || '');
        const valorCeldaNormalizado = normalizarTexto(valorCelda);
        return valorCeldaNormalizado.includes(textoBusquedaNormalizado);
    });

    mostrarResultados(resultados);
}

// Búsqueda en tiempo real con debounce
function buscarEnTiempoReal() {
    // Cancelar búsqueda anterior si existe
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Esperar 300ms después de que el usuario deje de escribir
    searchTimeout = setTimeout(() => {
        buscar();
    }, 300);
}

function mostrarResultados(resultados) {
    const resultsSection = document.getElementById('resultsSection');
    const tableHead = document.getElementById('tableHead');
    const tableBody = document.getElementById('tableBody');
    const noResults = document.getElementById('noResults');

    resultsSection.classList.add('active');
    document.getElementById('resultCount').textContent = resultados.length;

    // Limitar a 100 filas para mejor rendimiento
    const resultadosLimitados = resultados.slice(0, 100);
    const mostrandoCantidad = resultadosLimitados.length;

    document.getElementById('showingCount').textContent = mostrandoCantidad;
    document.getElementById('totalCount').textContent = datosOriginal.length;

    if (resultados.length === 0) {
        noResults.style.display = 'block';
        tableBody.innerHTML = '';
        return;
    }

    noResults.style.display = 'none';

    // Crear encabezados con columna de acciones
    if (tableHead.innerHTML === '') {
        tableHead.innerHTML = '<th>Acciones</th>' + columnas.map(col => `<th>${col}</th>`).join('');
    }

    // Crear filas con evento click y botones de acción
    tableBody.innerHTML = resultadosLimitados.map((row, index) => `
        <tr data-index="${index}" class="row-clickable">
            <td class="actions-cell">
                <button class="btn-action btn-select" onclick="seleccionarCliente(${index})" title="Seleccionar para certificado">
                    ✓
                </button>
                <button class="btn-action btn-edit" onclick="editarCliente(${index})" title="Editar">
                    ✏️
                </button>
                <button class="btn-action btn-delete" onclick="eliminarCliente(${index})" title="Eliminar">
                    🗑️
                </button>
            </td>
            ${columnas.map(col => `<td>${row[col] || '-'}</td>`).join('')}
        </tr>
    `).join('');

    // Mostrar advertencia si hay más de 100 resultados
    if (resultados.length > 100) {
        mostrarAdvertencia(`Mostrando 100 de ${resultados.length} resultados. Refina tu búsqueda para ver más.`);
    }
}

function limpiar() {
    document.getElementById('searchInput').value = '';
    document.getElementById('resultsSection').classList.remove('active');
    document.getElementById('searchInput').focus();
}

function mostrarError(mensaje) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = '⚠️ ' + mensaje;
    errorDiv.classList.add('active');
    setTimeout(() => errorDiv.classList.remove('active'), 5000);
}

function mostrarExito(mensaje) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = '✓ ' + mensaje;
    successDiv.classList.add('active');
    setTimeout(() => successDiv.classList.remove('active'), 5000);
}

function mostrarAdvertencia(mensaje) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = '⚡ ' + mensaje;
    successDiv.classList.add('active');
    setTimeout(() => successDiv.classList.remove('active'), 3000);
}

function limpiarError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('active');
}

// Función para recargar con diferente codificación
function cambiarCodificacion() {
    if (!archivoActual) {
        mostrarError('No hay archivo cargado');
        return;
    }

    const nuevaCodificacion = codificacionActual === 'UTF-8' ? 'Windows-1252' : 'UTF-8';
    mostrarAdvertencia(`Cambiando a codificación ${nuevaCodificacion}...`);
    leerArchivoConCodificacion(nuevaCodificacion);
}

// Búsqueda en tiempo real mientras escribe
document.getElementById('searchInput')?.addEventListener('input', buscarEnTiempoReal);

// También permitir búsqueda inmediata con Enter
document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        buscar();
    }
});

// Búsqueda en tiempo real al cambiar de columna
document.getElementById('columnSelect')?.addEventListener('change', () => {
    actualizarPlaceholder();
    const textoBusqueda = document.getElementById('searchInput').value.trim();
    if (textoBusqueda) {
        buscar();
    }
});

// Funcionalidad de tema oscuro/claro
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');
    const currentTheme = html.getAttribute('data-theme');

    if (currentTheme === 'dark') {
        html.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// Cargar tema guardado al iniciar
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    const themeIcon = document.getElementById('themeIcon');

    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    } else {
        html.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌙';
    }
}

// Cargar tema al iniciar la página
loadTheme();

// ============================================
// FUNCIONES PARA CONFIGURACIÓN DEL TALLER
// ============================================

// Guardar configuración del taller
document.getElementById('configForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const config = {
        nombreTaller: document.getElementById('nombreTaller').value,
        direccionTaller: document.getElementById('direccionTaller').value,
        telefonoTaller: document.getElementById('telefonoTaller').value,
        emailTaller: document.getElementById('emailTaller').value,
        ciudadTaller: document.getElementById('ciudadTaller').value
    };

    localStorage.setItem('tallerConfig', JSON.stringify(config));
    mostrarExito('Configuración guardada correctamente');
});

// Cargar configuración del taller
function cargarConfiguracion() {
    const configGuardada = localStorage.getItem('tallerConfig');

    if (configGuardada) {
        const config = JSON.parse(configGuardada);

        document.getElementById('nombreTaller').value = config.nombreTaller || '';
        document.getElementById('direccionTaller').value = config.direccionTaller || '';
        document.getElementById('telefonoTaller').value = config.telefonoTaller || '';
        document.getElementById('emailTaller').value = config.emailTaller || '';
        document.getElementById('ciudadTaller').value = config.ciudadTaller || '';

        mostrarExito('Configuración cargada');
    } else {
        mostrarAdvertencia('No hay configuración guardada');
    }
}

// Cargar configuración al iniciar
window.addEventListener('DOMContentLoaded', cargarConfiguracion);

// ============================================
// FUNCIONES PARA GENERAR CERTIFICADO
// ============================================

function generarCertificado() {
    // Obtener configuración del taller
    const configGuardada = localStorage.getItem('tallerConfig');

    if (!configGuardada) {
        mostrarError('Por favor configura primero los datos del taller en la pestaña "Configuración"');
        return;
    }

    const config = JSON.parse(configGuardada);

    // Obtener datos del formulario de certificado
    const nombreCliente = document.getElementById('nombreCliente').value;
    const patenteVehiculo = document.getElementById('patenteVehiculo').value;
    const marcaVehiculo = document.getElementById('marcaVehiculo').value;
    const modeloVehiculo = document.getElementById('modeloVehiculo').value;
    const tipoTecnico = document.getElementById('tipoTecnico').value;
    const kilometrajeActual = document.getElementById('kilometrajeActual').value;
    const proximoServicioKm = document.getElementById('proximoServicioKm').value;
    const fechaProximoServicio = document.getElementById('fechaProximoServicio').value;
    const puntosRevision = document.getElementById('puntosRevision').value;

    // Validar campos requeridos
    if (!nombreCliente || !patenteVehiculo || !marcaVehiculo || !modeloVehiculo || !kilometrajeActual) {
        mostrarError('Por favor completa todos los campos requeridos');
        return;
    }

    // Obtener fecha y hora actual
    const ahora = new Date();
    const fechaHora = ahora.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Formatear fecha próximo servicio
    const fechaProximoFormat = fechaProximoServicio ?
        new Date(fechaProximoServicio + 'T00:00:00').toLocaleDateString('es-AR') :
        'No especificada';

    // Procesar puntos de revisión
    const puntosArray = puntosRevision.split('\n').filter(p => p.trim());

    // Crear HTML del certificado
    const certificadoHTML = `
        <div class="certificate-print" id="certificadoPrint">
            <div class="cert-header">
                <div class="cert-title">CERTIFICADO DE SERVICIO - SERVICIO COMPLETO</div>
                <div class="cert-subtitle">${config.nombreTaller}</div>
                <div>Teléfono: ${config.telefonoTaller}</div>
                ${config.emailTaller ? `<div>Email: ${config.emailTaller}</div>` : ''}
            </div>

            <div class="cert-info-grid">
                <div class="cert-info-item">
                    <div class="cert-info-label">Nombre:</div>
                    <div>${nombreCliente}</div>
                </div>
                <div class="cert-info-item">
                    <div class="cert-info-label">Patente:</div>
                    <div>${patenteVehiculo}</div>
                </div>
                <div class="cert-info-item">
                    <div class="cert-info-label">Marca:</div>
                    <div>${marcaVehiculo}</div>
                </div>
                <div class="cert-info-item">
                    <div class="cert-info-label">Modelo:</div>
                    <div>${modeloVehiculo}</div>
                </div>
                ${tipoTecnico ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Tipo Técnico:</div>
                    <div>${tipoTecnico}</div>
                </div>` : ''}
                <div class="cert-info-item">
                    <div class="cert-info-label">Fecha-Hora:</div>
                    <div>${fechaHora}</div>
                </div>
                ${config.direccionTaller ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Dirección:</div>
                    <div>${config.direccionTaller}</div>
                </div>` : ''}
                ${config.ciudadTaller ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Ciudad:</div>
                    <div>${config.ciudadTaller}</div>
                </div>` : ''}
                <div class="cert-info-item">
                    <div class="cert-info-label">Kilometraje actual:</div>
                    <div>${parseInt(kilometrajeActual).toLocaleString()} km</div>
                </div>
                ${proximoServicioKm ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Próximo servicio (Km):</div>
                    <div>${parseInt(proximoServicioKm).toLocaleString()} km</div>
                </div>` : ''}
                <div class="cert-info-item">
                    <div class="cert-info-label">Fecha próximo servicio:</div>
                    <div>${fechaProximoFormat}</div>
                </div>
            </div>

            <div class="cert-section-title">Puntos de Revisión</div>
            ${puntosArray.map(punto => {
                const partes = punto.split('-');
                const descripcion = partes[0].trim();
                const estado = partes.length > 1 ? partes[1].trim() : '';
                return `<div class="cert-revision-item">
                    <span>${descripcion}</span>
                    <strong>${estado}</strong>
                </div>`;
            }).join('')}
        </div>
    `;

    // Eliminar certificado anterior si existe
    const certificadoAnterior = document.getElementById('certificadoPrint');
    if (certificadoAnterior) {
        certificadoAnterior.remove();
    }

    // Agregar el certificado al body
    document.body.insertAdjacentHTML('beforeend', certificadoHTML);

    // Mostrar mensaje de éxito
    mostrarExito('Certificado generado. Abriendo vista de impresión...');

    // Esperar un momento y abrir diálogo de impresión
    setTimeout(() => {
        window.print();
    }, 500);
}

function limpiarFormularioCertificado() {
    document.getElementById('certificadoForm').reset();
    clienteSeleccionado = null;
    mostrarAdvertencia('Formulario limpiado');
}

// ============================================
// FUNCIONES PARA GESTIÓN DE CLIENTES
// ============================================

// Seleccionar cliente y cargar datos en certificado
function seleccionarCliente(index) {
    if (index < 0 || index >= datosOriginal.length) {
        mostrarError('Cliente no encontrado');
        return;
    }

    clienteSeleccionado = datosOriginal[index];
    filaSeleccionadaIndex = index;

    // Buscar campos comunes para autocompletar
    const mapearCampo = (posiblesNombres) => {
        for (let nombre of posiblesNombres) {
            const col = columnas.find(c => normalizarTexto(c).includes(normalizarTexto(nombre)));
            if (col && clienteSeleccionado[col]) {
                return clienteSeleccionado[col];
            }
        }
        return '';
    };

    // Autocompletar formulario de certificado
    const nombreCliente = mapearCampo(['nombre', 'cliente', 'titular', 'propietario']);
    const patenteVehiculo = mapearCampo(['patente', 'dominio', 'placa']);
    const marcaVehiculo = mapearCampo(['marca']);
    const modeloVehiculo = mapearCampo(['modelo']);
    const tipoTecnico = mapearCampo(['tipo', 'tipo tecnico', 'tipo_tecnico']);
    const kilometraje = mapearCampo(['kilometraje', 'km', 'kilometros']);

    // Llenar formulario
    if (nombreCliente) document.getElementById('nombreCliente').value = nombreCliente;
    if (patenteVehiculo) document.getElementById('patenteVehiculo').value = patenteVehiculo;
    if (marcaVehiculo) document.getElementById('marcaVehiculo').value = marcaVehiculo;
    if (modeloVehiculo) document.getElementById('modeloVehiculo').value = modeloVehiculo;
    if (tipoTecnico) document.getElementById('tipoTecnico').value = tipoTecnico;
    if (kilometraje) document.getElementById('kilometrajeActual').value = kilometraje;

    // Cambiar a la pestaña de certificado
    const certificadoTab = Array.from(document.querySelectorAll('.tab-btn')).find(btn =>
        btn.textContent.includes('Certificado')
    );
    if (certificadoTab) {
        certificadoTab.click();
    }

    mostrarExito('Cliente seleccionado. Completa los datos faltantes y genera el certificado.');
}

// Editar cliente
function editarCliente(index) {
    if (index < 0 || index >= datosOriginal.length) {
        mostrarError('Cliente no encontrado');
        return;
    }

    const cliente = datosOriginal[index];
    filaSeleccionadaIndex = index;

    // Cambiar a pestaña de gestión
    const gestionTab = Array.from(document.querySelectorAll('.tab-btn')).find(btn =>
        btn.textContent.includes('Gestión')
    );
    if (gestionTab) {
        gestionTab.click();
    }

    // Llenar formulario de edición con los datos del cliente
    columnas.forEach(col => {
        const input = document.getElementById(`edit_${col}`);
        if (input) {
            input.value = cliente[col] || '';
        }
    });

    document.getElementById('editClienteSection').style.display = 'block';
    document.getElementById('addClienteSection').style.display = 'none';

    mostrarAdvertencia('Editando cliente. Modifica los campos y guarda los cambios.');
}

// Eliminar cliente
function eliminarCliente(index) {
    if (index < 0 || index >= datosOriginal.length) {
        mostrarError('Cliente no encontrado');
        return;
    }

    const cliente = datosOriginal[index];
    const nombre = cliente[columnas[0]] || 'este cliente';

    if (!confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
        return;
    }

    // Eliminar del array
    datosOriginal.splice(index, 1);

    // Actualizar la búsqueda para refrescar la tabla
    buscar();

    mostrarExito('Cliente eliminado correctamente');
}

// Guardar edición de cliente
function guardarEdicionCliente() {
    if (filaSeleccionadaIndex === null || filaSeleccionadaIndex < 0) {
        mostrarError('No hay cliente seleccionado para editar');
        return;
    }

    // Actualizar datos del cliente
    columnas.forEach(col => {
        const input = document.getElementById(`edit_${col}`);
        if (input) {
            datosOriginal[filaSeleccionadaIndex][col] = input.value;
        }
    });

    filaSeleccionadaIndex = null;
    document.getElementById('editClienteSection').style.display = 'none';

    // Actualizar tabla
    buscar();

    mostrarExito('Cliente actualizado correctamente');
}

// Cancelar edición
function cancelarEdicion() {
    filaSeleccionadaIndex = null;
    document.getElementById('editClienteSection').style.display = 'none';
    mostrarAdvertencia('Edición cancelada');
}

// Agregar nuevo cliente
function agregarNuevoCliente() {
    const nuevoCliente = {};
    let camposCompletos = true;

    columnas.forEach(col => {
        const input = document.getElementById(`new_${col}`);
        if (input) {
            nuevoCliente[col] = input.value || '';
            if (input.required && !input.value) {
                camposCompletos = false;
            }
        }
    });

    if (!camposCompletos) {
        mostrarError('Por favor completa todos los campos requeridos');
        return;
    }

    // Agregar al array
    datosOriginal.push(nuevoCliente);

    // Limpiar formulario
    columnas.forEach(col => {
        const input = document.getElementById(`new_${col}`);
        if (input) input.value = '';
    });

    // Actualizar tabla
    buscar();

    mostrarExito('Cliente agregado correctamente');
}

// Mostrar formulario para agregar cliente
function mostrarAgregarCliente() {
    document.getElementById('addClienteSection').style.display = 'block';
    document.getElementById('editClienteSection').style.display = 'none';
}

// Cancelar agregar cliente
function cancelarAgregar() {
    document.getElementById('addClienteSection').style.display = 'none';
    // Limpiar formulario
    columnas.forEach(col => {
        const input = document.getElementById(`new_${col}`);
        if (input) input.value = '';
    });
}

// Exportar datos a CSV
function exportarCSV() {
    if (datosOriginal.length === 0) {
        mostrarError('No hay datos para exportar');
        return;
    }

    // Crear contenido CSV
    const encabezados = columnas.join(',');
    const filas = datosOriginal.map(row =>
        columnas.map(col => {
            const valor = row[col] || '';
            // Escapar valores que contengan comas o comillas
            if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
                return `"${valor.replace(/"/g, '""')}"`;
            }
            return valor;
        }).join(',')
    );

    const csvContent = [encabezados, ...filas].join('\n');

    // Crear Blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarExito('Archivo CSV exportado correctamente');
}
