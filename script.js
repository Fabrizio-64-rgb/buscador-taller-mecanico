let datosOriginal = [];
let columnas = [];
let codificacionActual = 'UTF-8';
let searchTimeout = null;
let clienteSeleccionado = null;
let filaSeleccionadaIndex = null;

// ============================================
// ESTRUCTURA DE DATOS PARA CERTIFICADO
// ============================================

const ESTADOS_INSPECCION = {
    BIEN: { label: 'BIEN', descripcion: 'No Requiere Atención Inmediata', color: '#27ae60' },
    REGULAR: { label: 'REGULAR', descripcion: 'Podría Requerir Atención Futura', color: '#f39c12' },
    MAL: { label: 'MAL', descripcion: 'Requiere Atención Inmediata', color: '#e74c3c' },
    NA: { label: 'N/A', descripcion: 'No accesible, se recomienda revisar con su mecánico', color: '#95a5a6' },
    PERSONALIZADO: { label: 'PERSONALIZADO', descripcion: 'Permite el ingreso manual de estado', color: '#3498db' }
};

const CATEGORIAS_INSPECCION = [
    {
        nombre: 'ELEMENTOS DE SEGURIDAD',
        items: [
            'REVISIÓN Y REPOSICIÓN LUCES EXTERIORES Y BAÚL',
            'REVISIÓN TUERCA NEUMÁTICOS',
            'REVISAR / REEMPLAZAR ESCOBILLAS LIMPIAPARABRISAS',
            'PROFUNDIDAD DIBUJO NEUMÁTICO-TI (MML)',
            'PROFUNDIDAD DIBUJO NEUMÁTICO-TD (MML)',
            'PROFUNDIDAD DIBUJO NEUMÁTICO-DI (MML)',
            'PROFUNDIDAD DIBUJO NEUMÁTICO-DD (MML)',
            'PASTILLAS DE FRENO',
            'FLEXIBLES DE FRENOS',
            'DISCOS DE FRENOS',
            'AMORTIGUADORES',
            'AJUSTE PRESIÓN NEUMÁTICO (T = TRASEROS)-PSI',
            'AJUSTE PRESIÓN NEUMÁTICO (D = DELANTEROS)-PSI'
        ]
    },
    {
        nombre: 'FLUIDOS DEL VEHICULO',
        items: [
            'BATERIA',
            'LÍQUIDO DIRECCIÓN HIDRAULICA',
            'LÍQUIDO LIMPIAPARABRISAS',
            'PUNTO DE CONGELAMIENTO',
            'REVISIÓN LÍQ. REFRIGERANTE/ANTICONGELANTE',
            'REVISIÓN LÍQUIDO DE FRENOS'
        ]
    },
    {
        nombre: 'LUBRICANTES Y FILTROS',
        items: [
            'REVISIÓN FILTRO DE COMBUSTIBLE',
            'REVISIÓN ACEITE DIFERENCIAL',
            'REVISIÓN ACEITE CAJA DE TRANSFERENCIA',
            'REVISIÓN ACEITE CAJA DE CAMBIOS',
            'REEMPLAZO DE FILTRO DE AIRE',
            'CAMBIO DE ACEITE Y FILTRO'
        ]
    },
    {
        nombre: 'PARTES MECANICAS',
        items: [
            'ARANDELA TAPÓN DE CARTER',
            'BISAGRAS DE PUERTAS Y ENGRASE RETENEDOR DE PUERTAS',
            'CAÑO DE ESCAPE',
            'CORREA ALTERNADOR',
            'CORREA AIRE ACONDICIONADO',
            'CORREA DIRECCIÓN ASISTIDA',
            'GUARDAPOLVOS Y HOLGURAS DE TRANSMISIÓN',
            'REVISIÓN DE MANGUERAS'
        ]
    },
    {
        nombre: 'PRUEBA DINAMICA',
        items: [
            'CINTURONES DE SEGURIDAD (COMPROBAR FUNCIONAMIENTO INERCIAL)'
        ]
    },
    {
        nombre: 'SERVICIO DE ESCANEO',
        items: [
            'ABS',
            'AIRBAG',
            'CLIMATIZACIÓN',
            'HISTORIAL DE FALLAS',
            'INSTRUMENTAL',
            'INYECCIÓN',
            'RESETEO SERVICE',
            'SENSORES Y ACTUADORES',
            'SONDA LAMBDA'
        ]
    }
];

// Objeto para almacenar el estado de cada item (inicializado vacío)
let datosInspeccion = {};

// Array para almacenar productos consumidos
let productosConsumidos = [];

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
    // Ocultar la sección de carga automáticamente
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Crear un tab temporal para búsqueda si no existe
    // Como no hay tab específico de búsqueda, mantenemos visible el tab actual
    // pero ocultamos el contenido de carga
    const cargarTab = document.getElementById('cargar');
    if (cargarTab) {
        cargarTab.style.display = 'none';
    }

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

    // Dar foco al campo de búsqueda
    setTimeout(() => {
        document.getElementById('searchInput')?.focus();
    }, 100);
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

    // Reordenar columnas según prioridad
    const columnasOrdenadas = ordenarColumnas(columnas);

    // Crear encabezados con columna de acciones A LA DERECHA
    // Agregar data-title para tooltip en hover
    if (tableHead.innerHTML === '') {
        tableHead.innerHTML = columnasOrdenadas.map(col => `<th data-title="${col}">${col}</th>`).join('') + '<th class="actions-header" data-title="Acciones sobre el cliente">Acciones</th>';
    }

    // Crear filas con evento click y botones de acción A LA DERECHA
    tableBody.innerHTML = resultadosLimitados.map((row, index) => `
        <tr data-index="${index}" class="row-clickable">
            ${columnasOrdenadas.map(col => `<td>${row[col] || '-'}</td>`).join('')}
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
        </tr>
    `).join('');

    // Mostrar advertencia si hay más de 100 resultados
    if (resultados.length > 100) {
        mostrarAdvertencia(`Mostrando 100 de ${resultados.length} resultados. Refina tu búsqueda para ver más.`);
    }

    // Sincronizar scroll horizontal superior con inferior
    sincronizarScrolls();
}

// Función para sincronizar los scrolls horizontal superior e inferior
function sincronizarScrolls() {
    const tableResponsive = document.getElementById('tableResponsive');
    const tableScrollTop = document.getElementById('tableScrollTop');
    const tableScrollTopInner = document.getElementById('tableScrollTopInner');
    const table = document.getElementById('resultsTable');

    if (!tableResponsive || !tableScrollTop || !tableScrollTopInner || !table) return;

    // Ajustar el ancho del scroll superior para que coincida con el ancho de la tabla
    const tableWidth = table.scrollWidth;
    tableScrollTopInner.style.width = tableWidth + 'px';

    // Mostrar el scroll superior solo si hay scroll horizontal
    if (tableWidth > tableResponsive.clientWidth) {
        tableScrollTop.style.display = 'block';
    } else {
        tableScrollTop.style.display = 'none';
        return;
    }

    // Remover event listeners previos para evitar duplicados
    const newTableResponsive = tableResponsive.cloneNode(false);
    const newTableScrollTop = tableScrollTop.cloneNode(false);

    // Mantener el contenido
    while (tableResponsive.firstChild) {
        newTableResponsive.appendChild(tableResponsive.firstChild);
    }
    while (tableScrollTop.firstChild) {
        newTableScrollTop.appendChild(tableScrollTop.firstChild);
    }

    tableResponsive.parentNode.replaceChild(newTableResponsive, tableResponsive);
    tableScrollTop.parentNode.replaceChild(newTableScrollTop, tableScrollTop);

    // Obtener referencias actualizadas
    const tableResponsiveUpdated = document.getElementById('tableResponsive');
    const tableScrollTopUpdated = document.getElementById('tableScrollTop');

    // Sincronizar scroll superior -> inferior
    tableScrollTopUpdated.addEventListener('scroll', () => {
        tableResponsiveUpdated.scrollLeft = tableScrollTopUpdated.scrollLeft;
    });

    // Sincronizar scroll inferior -> superior
    tableResponsiveUpdated.addEventListener('scroll', () => {
        tableScrollTopUpdated.scrollLeft = tableResponsiveUpdated.scrollLeft;
    });
}

// Función para ordenar columnas según prioridad
function ordenarColumnas(cols) {
    // Orden prioritario de columnas
    const ordenPrioridad = [
        'nombre', 'apellido', 'nro. de documento', 'documento', 'nro documento',
        'correo electrónico', 'correo electronico', 'email', 'mail',
        'celular', 'telefono', 'teléfono', 'cel',
        'patente', 'dominio', 'placa',
        'marca',
        'modelo'
    ];

    const columnasPrioritarias = [];
    const columnasRestantes = [];

    // Separar columnas prioritarias de las restantes
    cols.forEach(col => {
        const colNormalizada = normalizarTexto(col);
        let encontrada = false;

        for (let prioridad of ordenPrioridad) {
            if (colNormalizada.includes(prioridad) || prioridad.includes(colNormalizada)) {
                columnasPrioritarias.push({ original: col, prioridad: ordenPrioridad.indexOf(prioridad) });
                encontrada = true;
                break;
            }
        }

        if (!encontrada) {
            columnasRestantes.push(col);
        }
    });

    // Ordenar columnas prioritarias según su índice de prioridad
    columnasPrioritarias.sort((a, b) => a.prioridad - b.prioridad);

    // Devolver columnas prioritarias primero, luego las restantes
    return [...columnasPrioritarias.map(c => c.original), ...columnasRestantes];
}

function limpiar() {
    document.getElementById('searchInput').value = '';
    document.getElementById('resultsSection').classList.remove('active');
    document.getElementById('searchInput').focus();
}

// ============================================
// SISTEMA DE NOTIFICACIONES TOAST
// ============================================

function mostrarToast(mensaje, tipo = 'info', duracion = 5000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;

    // Iconos según tipo
    const iconos = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const icono = iconos[tipo] || 'ℹ';

    toast.innerHTML = `
        <div class="toast-icon">${icono}</div>
        <div class="toast-message">${mensaje}</div>
        <button class="toast-close" onclick="cerrarToast(this)">×</button>
    `;

    container.appendChild(toast);

    // Auto-remover después de la duración
    setTimeout(() => {
        cerrarToast(toast.querySelector('.toast-close'));
    }, duracion);
}

function cerrarToast(btn) {
    const toast = btn.closest ? btn.closest('.toast') : btn;
    if (!toast) return;

    toast.classList.add('removing');
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

function mostrarError(mensaje) {
    mostrarToast(mensaje, 'error', 5000);
}

function mostrarExito(mensaje) {
    mostrarToast(mensaje, 'success', 4000);
}

function mostrarAdvertencia(mensaje) {
    mostrarToast(mensaje, 'warning', 4000);
}

function mostrarInfo(mensaje) {
    mostrarToast(mensaje, 'info', 4000);
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
window.addEventListener('DOMContentLoaded', () => {
    cargarConfiguracion();
    inicializarInspeccion();
    inicializarFechaServicio();
    renderizarBorradores();
});

// Inicializar fecha del servicio con la fecha actual
function inicializarFechaServicio() {
    const fechaServicioInput = document.getElementById('fechaServicio');
    if (fechaServicioInput) {
        const hoy = new Date();
        const fechaStr = hoy.toISOString().split('T')[0];
        fechaServicioInput.value = fechaStr;
    }
}

// ============================================
// FUNCIONES PARA BORRADORES
// ============================================

function guardarBorrador() {
    // Capturar todos los datos del formulario
    const borrador = {
        id: Date.now(),
        fecha: new Date().toLocaleString('es-AR'),
        datos: {
            nombreCliente: document.getElementById('nombreCliente').value,
            patenteVehiculo: document.getElementById('patenteVehiculo').value,
            marcaVehiculo: document.getElementById('marcaVehiculo').value,
            modeloVehiculo: document.getElementById('modeloVehiculo').value,
            tipoTecnico: document.getElementById('tipoTecnico').value,
            kilometrajeActual: document.getElementById('kilometrajeActual').value,
            proximoServicioKm: document.getElementById('proximoServicioKm').value,
            fechaProximoServicio: document.getElementById('fechaProximoServicio').value,
            lubriexperto: document.getElementById('lubriexperto').value,
            numeroOrden: document.getElementById('numeroOrden').value,
            fechaServicio: document.getElementById('fechaServicio').value,
            garantiaServicio: document.getElementById('garantiaServicio').value,
            mecanicoAsignado: document.getElementById('mecanicoAsignado').value,
            metodoPago: document.getElementById('metodoPago').value,
            observaciones: document.getElementById('observaciones').value
        },
        productos: [...productosConsumidos],
        inspeccion: {...datosInspeccion}
    };

    // Obtener borradores existentes
    const borradoresGuardados = JSON.parse(localStorage.getItem('borradores') || '[]');

    // Agregar nuevo borrador
    borradoresGuardados.push(borrador);

    // Guardar en localStorage
    localStorage.setItem('borradores', JSON.stringify(borradoresGuardados));

    // Actualizar lista
    renderizarBorradores();

    mostrarExito(`✓ Borrador guardado (${borrador.fecha})`);
}

function renderizarBorradores() {
    const lista = document.getElementById('listaBorradores');
    if (!lista) return;

    const borradores = JSON.parse(localStorage.getItem('borradores') || '[]');

    if (borradores.length === 0) {
        lista.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px; font-style: italic;">No hay borradores guardados</div>';
        return;
    }

    // Ordenar por fecha (más reciente primero)
    borradores.sort((a, b) => b.id - a.id);

    lista.innerHTML = borradores.map(borrador => {
        const nombre = borrador.datos.nombreCliente || 'Sin nombre';
        const patente = borrador.datos.patenteVehiculo || 'Sin patente';

        return `
            <div class="borrador-item">
                <div class="borrador-info">
                    <div class="borrador-titulo">${nombre} - ${patente}</div>
                    <div class="borrador-fecha">${borrador.fecha}</div>
                </div>
                <div class="borrador-acciones">
                    <button type="button" class="btn-action btn-select" onclick="cargarBorrador(${borrador.id})" title="Cargar borrador">
                        📂 Cargar
                    </button>
                    <button type="button" class="btn-action btn-delete" onclick="eliminarBorrador(${borrador.id})" title="Eliminar borrador">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function cargarBorrador(id) {
    const borradores = JSON.parse(localStorage.getItem('borradores') || '[]');
    const borrador = borradores.find(b => b.id === id);

    if (!borrador) {
        mostrarError('Borrador no encontrado');
        return;
    }

    const confirmado = await mostrarConfirmacion(
        '¿Cargar este borrador? Los datos actuales del formulario se perderán si no los has guardado.',
        'Confirmar carga de borrador',
        'warning',
        '📂'
    );

    if (!confirmado) {
        return;
    }

    // Cargar datos del formulario
    const datos = borrador.datos;
    document.getElementById('nombreCliente').value = datos.nombreCliente || '';
    document.getElementById('patenteVehiculo').value = datos.patenteVehiculo || '';
    document.getElementById('marcaVehiculo').value = datos.marcaVehiculo || '';
    document.getElementById('modeloVehiculo').value = datos.modeloVehiculo || '';
    document.getElementById('tipoTecnico').value = datos.tipoTecnico || '';
    document.getElementById('kilometrajeActual').value = datos.kilometrajeActual || '';
    document.getElementById('proximoServicioKm').value = datos.proximoServicioKm || '';
    document.getElementById('fechaProximoServicio').value = datos.fechaProximoServicio || '';
    document.getElementById('lubriexperto').value = datos.lubriexperto || '';
    document.getElementById('numeroOrden').value = datos.numeroOrden || '';
    document.getElementById('fechaServicio').value = datos.fechaServicio || '';
    document.getElementById('garantiaServicio').value = datos.garantiaServicio || '';
    document.getElementById('mecanicoAsignado').value = datos.mecanicoAsignado || '';
    document.getElementById('metodoPago').value = datos.metodoPago || '';
    document.getElementById('observaciones').value = datos.observaciones || '';

    // Cargar productos
    productosConsumidos = borrador.productos || [];
    renderizarProductos();

    // Cargar inspección
    datosInspeccion = borrador.inspeccion || {};
    restaurarEstadosInspeccion();

    mostrarExito('✓ Borrador cargado correctamente');
}

function restaurarEstadosInspeccion() {
    // Limpiar todos los estados primero
    document.querySelectorAll('.btn-estado').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.input-personalizado').forEach(input => {
        input.style.display = 'none';
        input.value = '';
    });

    // Restaurar estados guardados
    Object.keys(datosInspeccion).forEach(itemId => {
        const dato = datosInspeccion[itemId];

        if (dato.estado === 'PERSONALIZADO') {
            const customInput = document.getElementById(`${itemId}_custom`);
            if (customInput) {
                customInput.style.display = 'block';
                customInput.value = dato.valor;
            }
        }

        // Marcar botón correspondiente
        const container = document.getElementById(`${itemId}_container`);
        if (container) {
            const btnSelector = {
                'BIEN': '.btn-bien',
                'REGULAR': '.btn-regular',
                'MAL': '.btn-mal',
                'NA': '.btn-na',
                'PERSONALIZADO': '.btn-personalizado'
            };

            const btn = container.querySelector(btnSelector[dato.estado]);
            if (btn) {
                btn.classList.add('selected');
            }
        }
    });
}

async function eliminarBorrador(id) {
    const confirmado = await mostrarConfirmacion(
        '¿Eliminar este borrador de forma permanente?',
        'Confirmar eliminación',
        'danger',
        '🗑️'
    );

    if (!confirmado) {
        return;
    }

    let borradores = JSON.parse(localStorage.getItem('borradores') || '[]');
    borradores = borradores.filter(b => b.id !== id);
    localStorage.setItem('borradores', JSON.stringify(borradores));

    renderizarBorradores();
    mostrarExito('✓ Borrador eliminado');
}

// ============================================
// FUNCIONES PARA INSPECCIÓN DE CERTIFICADO
// ============================================

// Inicializar la interfaz de inspección
function inicializarInspeccion() {
    const container = document.getElementById('inspeccionContainer');
    if (!container) return;

    container.innerHTML = '';

    CATEGORIAS_INSPECCION.forEach((categoria, catIndex) => {
        // Crear sección de categoría
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'categoria-inspeccion';
        categoriaDiv.innerHTML = `
            <div class="categoria-header" onclick="toggleCategoria(${catIndex})">
                <h4>${categoria.nombre}</h4>
                <span class="toggle-icon">▼</span>
            </div>
            <div class="categoria-items" id="categoria_${catIndex}">
                ${categoria.items.map((item, itemIndex) => crearItemHTML(item, catIndex, itemIndex)).join('')}
            </div>
        `;
        container.appendChild(categoriaDiv);
    });
}

// Crear HTML para un item de inspección
function crearItemHTML(item, catIndex, itemIndex) {
    const itemId = `item_${catIndex}_${itemIndex}`;

    return `
        <div class="item-inspeccion" id="${itemId}_container">
            <div class="item-nombre">${item}</div>
            <div class="item-controles">
                <div class="estado-buttons">
                    <button type="button" class="btn-estado btn-bien"
                            onclick="seleccionarEstado('${itemId}', 'BIEN')"
                            title="${ESTADOS_INSPECCION.BIEN.descripcion}">
                        ✓ BIEN
                    </button>
                    <button type="button" class="btn-estado btn-regular"
                            onclick="seleccionarEstado('${itemId}', 'REGULAR')"
                            title="${ESTADOS_INSPECCION.REGULAR.descripcion}">
                        ⚠ REGULAR
                    </button>
                    <button type="button" class="btn-estado btn-mal"
                            onclick="seleccionarEstado('${itemId}', 'MAL')"
                            title="${ESTADOS_INSPECCION.MAL.descripcion}">
                        ✕ MAL
                    </button>
                    <button type="button" class="btn-estado btn-na"
                            onclick="seleccionarEstado('${itemId}', 'NA')"
                            title="${ESTADOS_INSPECCION.NA.descripcion}">
                        ⊗ N/A
                    </button>
                    <button type="button" class="btn-estado btn-personalizado"
                            onclick="seleccionarEstado('${itemId}', 'PERSONALIZADO')"
                            title="${ESTADOS_INSPECCION.PERSONALIZADO.descripcion}">
                        ✏️ PERSONALIZADO
                    </button>
                </div>
                <input type="text"
                       class="input-personalizado"
                       id="${itemId}_custom"
                       placeholder="Ingresa estado personalizado..."
                       style="display: none;"
                       onblur="guardarEstadoPersonalizado('${itemId}')">
            </div>
        </div>
    `;
}

// Seleccionar estado para un item
function seleccionarEstado(itemId, estado) {
    const container = document.getElementById(`${itemId}_container`);
    const customInput = document.getElementById(`${itemId}_custom`);
    const buttons = container.querySelectorAll('.btn-estado');

    // Remover selección previa
    buttons.forEach(btn => btn.classList.remove('selected'));

    // Marcar botón seleccionado
    const btnSelector = {
        'BIEN': '.btn-bien',
        'REGULAR': '.btn-regular',
        'MAL': '.btn-mal',
        'NA': '.btn-na',
        'PERSONALIZADO': '.btn-personalizado'
    };

    const btnSeleccionado = container.querySelector(btnSelector[estado]);
    if (btnSeleccionado) {
        btnSeleccionado.classList.add('selected');
    }

    // Mostrar/ocultar input personalizado
    if (estado === 'PERSONALIZADO') {
        customInput.style.display = 'block';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
        customInput.value = '';

        // Guardar estado
        datosInspeccion[itemId] = {
            estado: estado,
            valor: ESTADOS_INSPECCION[estado].label
        };
    }
}

// Guardar estado personalizado
function guardarEstadoPersonalizado(itemId) {
    const customInput = document.getElementById(`${itemId}_custom`);
    const valor = customInput.value.trim();

    if (valor) {
        datosInspeccion[itemId] = {
            estado: 'PERSONALIZADO',
            valor: valor
        };
    } else {
        // Si está vacío, remover la selección
        delete datosInspeccion[itemId];
        const container = document.getElementById(`${itemId}_container`);
        const buttons = container.querySelectorAll('.btn-estado');
        buttons.forEach(btn => btn.classList.remove('selected'));
        customInput.style.display = 'none';
    }
}

// Toggle de categoría (expandir/colapsar)
function toggleCategoria(catIndex) {
    const categoriaItems = document.getElementById(`categoria_${catIndex}`);
    const header = categoriaItems.previousElementSibling;
    const icon = header.querySelector('.toggle-icon');

    if (categoriaItems.style.display === 'none') {
        categoriaItems.style.display = 'block';
        icon.textContent = '▼';
    } else {
        categoriaItems.style.display = 'none';
        icon.textContent = '▶';
    }
}

// Completar todos con un estado específico
function completarTodosEstado(estado) {
    if (!confirm(`¿Marcar todos los items como "${estado}"?`)) {
        return;
    }

    CATEGORIAS_INSPECCION.forEach((categoria, catIndex) => {
        categoria.items.forEach((item, itemIndex) => {
            const itemId = `item_${catIndex}_${itemIndex}`;
            seleccionarEstado(itemId, estado);
        });
    });

    mostrarExito(`Todos los items marcados como ${estado}`);
}

// Limpiar todos los estados
function limpiarTodosEstados() {
    if (!confirm('¿Limpiar todos los estados seleccionados?')) {
        return;
    }

    datosInspeccion = {};

    // Limpiar visualmente
    document.querySelectorAll('.btn-estado').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.input-personalizado').forEach(input => {
        input.style.display = 'none';
        input.value = '';
    });

    mostrarAdvertencia('Estados limpiados');
}

// ============================================
// FUNCIONES PARA PRODUCTOS CONSUMIDOS
// ============================================

function agregarProducto() {
    const producto = {
        id: Date.now(),
        nombre: '',
        partida: '',
        cantidad: ''
    };

    productosConsumidos.push(producto);
    renderizarProductos();
}

function eliminarProducto(id) {
    productosConsumidos = productosConsumidos.filter(p => p.id !== id);
    renderizarProductos();
}

function actualizarProducto(id, campo, valor) {
    const producto = productosConsumidos.find(p => p.id === id);
    if (producto) {
        producto[campo] = valor;
    }
}

function renderizarProductos() {
    const lista = document.getElementById('productosLista');
    if (!lista) return;

    if (productosConsumidos.length === 0) {
        lista.innerHTML = '<div class="productos-vacio">No hay productos agregados</div>';
        return;
    }

    lista.innerHTML = productosConsumidos.map(producto => `
        <div class="producto-item">
            <input type="text"
                   class="producto-input"
                   placeholder="Nombre del producto"
                   value="${producto.nombre}"
                   onchange="actualizarProducto(${producto.id}, 'nombre', this.value)">
            <input type="text"
                   class="producto-input"
                   placeholder="Nro. partida"
                   value="${producto.partida}"
                   onchange="actualizarProducto(${producto.id}, 'partida', this.value)">
            <input type="text"
                   class="producto-input"
                   placeholder="Cantidad"
                   value="${producto.cantidad}"
                   onchange="actualizarProducto(${producto.id}, 'cantidad', this.value)">
            <button type="button"
                    class="btn-eliminar-producto"
                    onclick="eliminarProducto(${producto.id})"
                    title="Eliminar producto">
                🗑️
            </button>
        </div>
    `).join('');
}

// ============================================
// FUNCIONES PARA GENERAR CERTIFICADO
// ============================================

function generarCertificado() {
    // Obtener configuración del taller
    const configGuardada = localStorage.getItem('tallerConfig');

    if (!configGuardada) {
        mostrarError('⚙️ Por favor configura primero los datos del taller en la pestaña "Configuración"');
        // Cambiar a pestaña de configuración
        const configTab = Array.from(document.querySelectorAll('.tab-btn')).find(btn =>
            btn.textContent.includes('Configuración')
        );
        if (configTab) {
            setTimeout(() => configTab.click(), 1000);
        }
        return;
    }

    const config = JSON.parse(configGuardada);

    // Validar que la configuración tenga datos requeridos
    if (!config.nombreTaller || !config.telefonoTaller) {
        mostrarError('⚠️ Faltan datos del taller (nombre y teléfono son requeridos). Completa la configuración.');
        return;
    }

    // Obtener datos del formulario de certificado
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const patenteVehiculo = document.getElementById('patenteVehiculo').value.trim();
    const marcaVehiculo = document.getElementById('marcaVehiculo').value.trim();
    const modeloVehiculo = document.getElementById('modeloVehiculo').value.trim();
    const tipoTecnico = document.getElementById('tipoTecnico').value.trim();
    const kilometrajeActual = document.getElementById('kilometrajeActual').value.trim();
    const proximoServicioKm = document.getElementById('proximoServicioKm').value.trim();
    const fechaProximoServicio = document.getElementById('fechaProximoServicio').value;
    const lubriexperto = document.getElementById('lubriexperto').value.trim();

    // Nuevos campos de información del servicio
    const numeroOrden = document.getElementById('numeroOrden').value.trim();
    const fechaServicio = document.getElementById('fechaServicio').value;
    const garantiaServicio = document.getElementById('garantiaServicio').value.trim();
    const mecanicoAsignado = document.getElementById('mecanicoAsignado').value.trim();
    const metodoPago = document.getElementById('metodoPago').value;
    const observaciones = document.getElementById('observaciones').value.trim();

    // Validar campos requeridos con mensajes específicos
    const camposFaltantes = [];
    if (!nombreCliente) camposFaltantes.push('Nombre del cliente');
    if (!patenteVehiculo) camposFaltantes.push('Patente del vehículo');
    if (!marcaVehiculo) camposFaltantes.push('Marca del vehículo');
    if (!modeloVehiculo) camposFaltantes.push('Modelo del vehículo');
    if (!kilometrajeActual) camposFaltantes.push('Kilometraje actual');
    if (!lubriexperto) camposFaltantes.push('Nombre del Lubriexperto');

    if (camposFaltantes.length > 0) {
        mostrarError(`⚠️ Faltan datos requeridos:<br>• ${camposFaltantes.join('<br>• ')}`);
        return;
    }

    // Validar que el kilometraje sea un número válido
    if (isNaN(parseInt(kilometrajeActual))) {
        mostrarError('⚠️ El kilometraje actual debe ser un número válido');
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

    // Formatear fecha del servicio
    const fechaServicioFormat = fechaServicio ?
        new Date(fechaServicio + 'T00:00:00').toLocaleDateString('es-AR') :
        null;

    // Generar HTML de las categorías de inspección
    let categoriasHTML = '';

    CATEGORIAS_INSPECCION.forEach((categoria, catIndex) => {
        // Recopilar items de esta categoría que tengan estado
        const itemsConEstado = [];

        categoria.items.forEach((item, itemIndex) => {
            const itemId = `item_${catIndex}_${itemIndex}`;
            if (datosInspeccion[itemId]) {
                itemsConEstado.push({
                    nombre: item,
                    estado: datosInspeccion[itemId].valor
                });
            }
        });

        // Solo mostrar categoría si tiene items con estado
        if (itemsConEstado.length > 0) {
            categoriasHTML += `
                <div class="cert-categoria">
                    <div class="cert-categoria-titulo">★ ${categoria.nombre}</div>
                    <table class="cert-tabla">
                        <thead>
                            <tr class="cert-tabla-header">
                                <th class="cert-tabla-col-item">Puntos de Revisión</th>
                                <th class="cert-tabla-col-estado">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsConEstado.map(item => `
                                <tr class="cert-tabla-row">
                                    <td class="cert-tabla-col-item">${item.nombre}</td>
                                    <td class="cert-tabla-col-estado">${item.estado}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    });

    // Si no hay datos de inspección, mostrar advertencia
    if (!categoriasHTML) {
        mostrarAdvertencia('⚠️ No has seleccionado ningún punto de inspección. El certificado no tendrá información de revisión.');
        categoriasHTML = '<div class="cert-warning">⚠️ Sin puntos de inspección configurados</div>';
    }

    // Generar sección de referencias
    const referenciasHTML = `
        <div class="cert-referencias">
            <h3 class="cert-referencias-titulo">REFERENCIAS</h3>
            <div class="cert-referencias-grid">
                <div class="cert-referencia-item">
                    <span class="cert-referencia-icono bien">✓</span>
                    <strong>BIEN:</strong> No Requiere Atención Inmediata
                </div>
                <div class="cert-referencia-item">
                    <span class="cert-referencia-icono regular">⚠</span>
                    <strong>REGULAR:</strong> Podría Requerir Atención Futura
                </div>
                <div class="cert-referencia-item">
                    <span class="cert-referencia-icono mal">✕</span>
                    <strong>MAL:</strong> Requiere Atención Inmediata
                </div>
                <div class="cert-referencia-item">
                    <span class="cert-referencia-icono na">⊗</span>
                    <strong>N/A:</strong> No accesible, se recomienda revisar con su mecánico
                </div>
            </div>
        </div>
    `;

    // Generar tabla de productos consumidos
    let productosHTML = '';
    if (productosConsumidos.length > 0) {
        const productosConDatos = productosConsumidos.filter(p => p.nombre || p.partida || p.cantidad);
        if (productosConDatos.length > 0) {
            productosHTML = `
                <table class="cert-tabla-productos">
                    <thead>
                        <tr>
                            <th>Nombre de Producto</th>
                            <th>Nro. de Partida</th>
                            <th>Cantidad Consumida</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosConDatos.map(p => `
                            <tr>
                                <td>${p.nombre || '-'}</td>
                                <td>${p.partida || '-'}</td>
                                <td>${p.cantidad || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    if (!productosHTML) {
        productosHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">No se registraron productos consumidos</p>';
    }

    // Generar sección de certificado de producto
    const certificadoProductoHTML = `
        <div class="cert-producto">
            <h2 class="cert-producto-titulo">CERTIFICADO DE PRODUCTO</h2>
            <p class="cert-producto-texto">
                Se certifica que el servicio en el vehículo patente: <strong>${patenteVehiculo}</strong>,
                Lubriexperto: <strong>${lubriexperto}</strong> ha sido realizado con los insumos:
            </p>
            <h4 style="margin: 20px 0 10px 0; color: #2c3e50;">Producto consumido</h4>
            ${productosHTML}
        </div>
    `;

    // Disclaimer legal
    const disclaimerHTML = `
        <div class="cert-disclaimer">
            <h4>Disclaimer</h4>
            <p>
                El Servicio de LUBRICACION + DIAGNOSTICO comprende únicamente los puntos enumerados arriba.
                El DIAGNOSTICO se limita a una inspección meramente externa de los puntos de control enumerados,
                y refleja el estado de los mismos exclusivamente al momento de la inspección, sin que implique
                garantía explícita o implícita alguna respecto de dicho estado una vez finalizado el DIAGNOSTICO.
                La empresa no se responsabiliza por deficiencias o defectos detectados o detectables con posterioridad
                al DIAGNOSTICO, y excluye expresamente cualquier responsabilidad que pudiera derivarse de deficiencias
                y/o defectos en los puntos de control que no fueran detectables a simple vista al momento del DIAGNOSTICO.
            </p>
        </div>
    `;

    // Generar sección de observaciones
    let observacionesHTML = '';
    if (observaciones) {
        observacionesHTML = `
            <div class="cert-observaciones">
                <h3 class="cert-observaciones-titulo">OBSERVACIONES Y RECOMENDACIONES</h3>
                <div class="cert-observaciones-contenido">
                    ${observaciones.split('\n').filter(l => l.trim()).map(linea =>
                        `<div class="cert-observacion-item">${linea}</div>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    // Pie de página (vacío por solicitud del usuario)
    const footerHTML = '';

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
                ${numeroOrden ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Nro. Orden/Factura:</div>
                    <div>${numeroOrden}</div>
                </div>` : ''}
                ${fechaServicioFormat ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Fecha Servicio:</div>
                    <div>${fechaServicioFormat}</div>
                </div>` : ''}
                ${garantiaServicio ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Garantía:</div>
                    <div>${garantiaServicio}</div>
                </div>` : ''}
                ${mecanicoAsignado ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Mecánico:</div>
                    <div>${mecanicoAsignado}</div>
                </div>` : ''}
                ${lubriexperto ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Lubriexperto:</div>
                    <div>${lubriexperto}</div>
                </div>` : ''}
                ${metodoPago ? `
                <div class="cert-info-item">
                    <div class="cert-info-label">Método Pago:</div>
                    <div>${metodoPago}</div>
                </div>` : ''}
            </div>

            ${categoriasHTML}

            ${referenciasHTML}

            ${certificadoProductoHTML}

            ${observacionesHTML}

            ${disclaimerHTML}

            ${footerHTML}
        </div>
    `;

    // Mostrar certificado en el modal
    const modalBody = document.getElementById('certificateModalBody');
    if (modalBody) {
        modalBody.innerHTML = certificadoHTML;
        document.getElementById('certificateModal').classList.add('active');
        mostrarExito('✓ Certificado generado correctamente. Revisa y luego imprime.');
    } else {
        mostrarError('Error al mostrar el certificado');
    }
}

function cerrarModalCertificado() {
    const modal = document.getElementById('certificateModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function imprimirCertificado() {
    window.print();
}

function limpiarFormularioCertificado() {
    document.getElementById('certificadoForm').reset();
    clienteSeleccionado = null;
    limpiarTodosEstados();
    productosConsumidos = [];
    renderizarProductos();
    inicializarFechaServicio(); // Reinicializar con fecha actual
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

    const mensaje = `¿Estás seguro de eliminar a ${nombre}?\n\n⚠️ ATENCIÓN: Esta acción modificará los datos en memoria.\nDebes exportar el CSV para guardar los cambios permanentemente.`;

    if (!confirm(mensaje)) {
        mostrarAdvertencia('Eliminación cancelada');
        return;
    }

    // Eliminar del array
    datosOriginal.splice(index, 1);

    // Actualizar la búsqueda para refrescar la tabla
    buscar();

    mostrarExito('✓ Cliente eliminado. Recuerda exportar el CSV para guardar los cambios.');
}

// Guardar edición de cliente
function guardarEdicionCliente() {
    if (filaSeleccionadaIndex === null || filaSeleccionadaIndex < 0) {
        mostrarError('No hay cliente seleccionado para editar');
        return;
    }

    const mensaje = '¿Guardar los cambios realizados?\n\n⚠️ ATENCIÓN: Los cambios se aplicarán en memoria.\nDebes exportar el CSV para guardar permanentemente.';

    if (!confirm(mensaje)) {
        mostrarAdvertencia('Edición cancelada');
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

    mostrarExito('✓ Cliente actualizado. Recuerda exportar el CSV para guardar los cambios.');
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

    // Pedir confirmación
    const mensaje = '¿Confirmar agregar este nuevo cliente?\n\n⚠️ ATENCIÓN: El cliente se agregará en memoria.\nDebes exportar el CSV para guardar los cambios permanentemente.';

    if (!confirm(mensaje)) {
        mostrarAdvertencia('Operación cancelada');
        return;
    }

    // Agregar al array
    datosOriginal.push(nuevoCliente);

    // Limpiar formulario
    columnas.forEach(col => {
        const input = document.getElementById(`new_${col}`);
        if (input) input.value = '';
    });

    // Ocultar formulario
    document.getElementById('addClienteSection').style.display = 'none';

    // Actualizar tabla
    buscar();

    mostrarExito('✓ Cliente agregado. Recuerda exportar el CSV para guardar los cambios.');
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

// ============================================
// MODAL DE CONFIRMACIÓN ESTILIZADO
// ============================================

let confirmModalCallback = null;

/**
 * Muestra el modal de confirmación estilizado
 * @param {string} message - Mensaje a mostrar
 * @param {string} title - Título del modal (opcional)
 * @param {string} type - Tipo: 'default', 'warning', 'danger', 'success' (opcional)
 * @param {string} icon - Icono emoji a mostrar (opcional)
 * @returns {Promise<boolean>} - Promesa que resuelve true si confirma, false si cancela
 */
function mostrarConfirmacion(message, title = 'Confirmar acción', type = 'default', icon = '❓') {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const modalContent = modal.querySelector('.confirm-modal-content');
        const titleElement = document.getElementById('confirmModalTitle');
        const messageElement = document.getElementById('confirmModalMessage');
        const iconElement = document.getElementById('confirmModalIconSpan');

        // Configurar contenido
        titleElement.textContent = title;
        messageElement.textContent = message;
        iconElement.textContent = icon;

        // Remover clases de tipo previas
        modalContent.classList.remove('warning', 'danger', 'success');

        // Agregar clase de tipo si no es default
        if (type !== 'default') {
            modalContent.classList.add(type);
        }

        // Configurar callback
        confirmModalCallback = (confirmed) => {
            cerrarModalConfirm();
            resolve(confirmed);
        };

        // Mostrar modal
        modal.classList.add('active');

        // Cerrar con ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                cerrarModalConfirm();
                resolve(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Cerrar al hacer clic fuera del modal
        modal.onclick = (e) => {
            if (e.target === modal) {
                cerrarModalConfirm();
                resolve(false);
            }
        };
    });
}

function cerrarModalConfirm() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
    confirmModalCallback = null;
    modal.onclick = null;
}

function confirmarAccionModal() {
    if (confirmModalCallback) {
        confirmModalCallback(true);
    }
}

// Actualizar funciones existentes para usar el modal estilizado
async function completarTodosEstado(estado) {
    const iconos = {
        'BIEN': '✅',
        'REGULAR': '⚠️',
        'MAL': '❌',
        'NA': '➖'
    };

    const tipos = {
        'BIEN': 'success',
        'REGULAR': 'warning',
        'MAL': 'danger',
        'NA': 'default'
    };

    const confirmado = await mostrarConfirmacion(
        `¿Marcar todos los items de inspección como "${estado}"?`,
        'Confirmar actualización masiva',
        tipos[estado] || 'default',
        iconos[estado] || '❓'
    );

    if (!confirmado) return;

    CATEGORIAS_INSPECCION.forEach((categoria, catIndex) => {
        categoria.items.forEach((item, itemIndex) => {
            const itemId = `item_${catIndex}_${itemIndex}`;
            seleccionarEstado(itemId, estado);
        });
    });

    mostrarExito(`Todos los items marcados como ${estado}`);
}

// Actualizar función limpiarTodosEstados
async function limpiarTodosEstados() {
    const confirmado = await mostrarConfirmacion(
        '¿Limpiar todos los estados seleccionados en la inspección?',
        'Confirmar limpieza',
        'warning',
        '🧹'
    );

    if (!confirmado) return;

    datosInspeccion = {};

    document.querySelectorAll('.btn-estado').forEach(btn => {
        btn.classList.remove('selected');
    });

    document.querySelectorAll('.input-personalizado').forEach(input => {
        input.style.display = 'none';
        input.value = '';
    });

    mostrarExito('Todos los estados han sido limpiados');
}
