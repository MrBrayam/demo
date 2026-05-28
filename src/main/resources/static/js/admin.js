let credencialesAdmin = null;

const adminState = {
    matriculas: [],
    reporte: null
};

const PAGE_SIZE = 6;
const adminPagination = {
    matriculas: 1,
    alumnos: 1,
    categorias: 1,
    usuarios: 1
};

const adminSearch = {
    matriculas: '',
    alumnos: '',
    categorias: '',
    usuarios: ''
};

// ----------------------------------------------------
// Client-side validation helpers
// ----------------------------------------------------
function showError(elId, message) {
    const el = document.getElementById(elId);
    if (el) {
        el.textContent = message;
        if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        console.error('Error element not found:', elId, message);
    }
}

function clearError(elId) {
    const el = document.getElementById(elId);
    if (el) el.textContent = '';
}

function isValidEmail(email) {
    if (!email) return false;
    // simple email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-admin-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault();
            await manejarLoginAdmin();
        });
    }

    // Navegacion Admin
    initAdminNavigation();

    // Matriculas
    document.getElementById('admin-recargar')?.addEventListener('click', cargarMatriculasAdmin);
    document.getElementById('admin-estado')?.addEventListener('change', cargarMatriculasAdmin);

    document.getElementById('btn-nueva-matricula')?.addEventListener('click', async () => {
        document.getElementById('form-matricula').reset();

        const select = document.getElementById('matricula-categoria');
        if (select) {
            select.innerHTML = '<option value="">Cargando...</option>';
            try {
                const cats = await obtenerCategoriasAdmin(credencialesAdmin);
                const activas = cats.filter(c => c.activo);
                if (activas.length === 0) {
                    select.innerHTML = '<option value="">No hay categorías activas</option>';
                } else {
                    select.innerHTML = '<option value="">Seleccione...</option>' +
                        activas.map(c => `<option value="${c.id}">${c.nombre} (S/ ${c.montoMatricula ? c.montoMatricula.toFixed(2) : '0.00'})</option>`).join('');
                }
            } catch (error) {
                select.innerHTML = '<option value="">Error al cargar</option>';
            }
        }

        document.getElementById('form-matricula-card').classList.remove('oculto');
    });
    document.getElementById('btn-cancelar-matricula')?.addEventListener('click', () => {
        document.getElementById('form-matricula-card').classList.add('oculto');
    });
    document.getElementById('form-matricula')?.addEventListener('submit', guardarMatriculaAdmin);

    // Enforce numeric-only and max length for DNI inputs
    document.getElementById('matricula-dni')?.addEventListener('input', (e) => {
        e.target.value = (e.target.value || '').replace(/\D/g, '').slice(0, 8);
    });
    document.getElementById('alumno-dni')?.addEventListener('input', (e) => {
        e.target.value = (e.target.value || '').replace(/\D/g, '').slice(0, 8);
    });

    document.getElementById('admin-body')?.addEventListener('click', async (event) => {
        const btnAnular = event.target.closest('.btn-anular');
        if (btnAnular) {
            await manejarAnular(btnAnular);
            return;
        }

        const btnCambiar = event.target.closest('.btn-cambiar');
        if (btnCambiar) {
            await manejarCambiar(btnCambiar);
            return;
        }

        const btnEliminar = event.target.closest('.btn-eliminar');
        if (btnEliminar) {
            await manejarEliminar(btnEliminar);
        }
    });

    // Reportes
    const formReporte = document.getElementById('form-admin-reporte');
    if (formReporte) {
        const hoy = new Date();
        const inputAnio = document.getElementById('admin-reporte-anio');
        const inputMes = document.getElementById('admin-reporte-mes');
        if (inputAnio && !inputAnio.value) inputAnio.value = String(hoy.getFullYear());
        if (inputMes && !inputMes.value) inputMes.value = String(hoy.getMonth() + 1);

        formReporte.addEventListener('submit', async (event) => {
            event.preventDefault();
            await cargarReporteAdmin();
        });
    }

    document.getElementById('btn-exportar-reporte')?.addEventListener('click', exportarReportePdf);

    // CRUD Event Listeners
    initCrudListeners();

    // Search inputs
    document.getElementById('search-matriculas')?.addEventListener('input', () => {
        adminPagination.matriculas = 1;
        renderMatriculasTabla();
    });
    document.getElementById('search-alumnos')?.addEventListener('input', () => {
        adminPagination.alumnos = 1;
        renderAlumnosTabla();
    });
    document.getElementById('search-categorias')?.addEventListener('input', () => {
        adminPagination.categorias = 1;
        renderCategoriasTabla();
    });
    document.getElementById('search-usuarios')?.addEventListener('input', () => {
        adminPagination.usuarios = 1;
        renderUsuariosTabla();
    });
});

function initAdminNavigation() {
    const navs = document.querySelectorAll('.admin-nav[data-view]');
    const views = document.querySelectorAll('.admin-view');
    navs.forEach(nav => {
        nav.addEventListener('click', () => {
            navs.forEach(n => n.classList.remove('activo'));
            views.forEach(v => v.classList.add('oculto'));

            nav.classList.add('activo');
            const viewId = `view-${nav.dataset.view}`;
            const viewEl = document.getElementById(viewId);
            if (viewEl) viewEl.classList.remove('oculto');

            if (nav.dataset.view === 'matriculas') cargarMatriculasAdmin();
            if (nav.dataset.view === 'alumnos') cargarAlumnosAdmin();
            if (nav.dataset.view === 'categorias') cargarCategoriasAdmin();
            if (nav.dataset.view === 'usuarios') cargarUsuariosAdmin();
        });
    });
}

async function manejarLoginAdmin() {
    const username = document.getElementById('admin-user').value.trim();
    const password = document.getElementById('admin-pass').value;
    const errorEl = document.getElementById('admin-error');
    const btnLogin = document.getElementById('btn-admin-login');

    if (errorEl) errorEl.textContent = '';
    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.textContent = 'Ingresando...';
    }

    try {
        const respuesta = await loginUsuario({ username, password });
        if (respuesta && respuesta.success) {
            credencialesAdmin = { username, password, nombre: respuesta.nombre };
            mostrarAdmin();
            await cargarMatriculasAdmin();
            return;
        }

        if (errorEl) {
            errorEl.textContent = respuesta?.mensaje || 'Credenciales invalidas';
        }
    } catch (error) {
        if (errorEl) {
            errorEl.textContent = 'Error de conexion con el servidor';
        }
    } finally {
        if (btnLogin) {
            btnLogin.disabled = false;
            btnLogin.textContent = 'Ingresar';
        }
    }
}

function mostrarAdmin() {
    const login = document.getElementById('admin-login');
    const content = document.getElementById('admin-content');
    if (login) login.classList.add('oculto');
    if (content) content.classList.remove('oculto');
    const userDisplay = document.getElementById('admin-user-display');
    if (userDisplay && credencialesAdmin) {
        userDisplay.textContent = credencialesAdmin.nombre || credencialesAdmin.username || 'Administrador';
    }
}

async function cargarMatriculasAdmin() {
    const tbody = document.getElementById('admin-body');
    if (!tbody) return;

    if (!credencialesAdmin) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Inicia sesion para ver las matriculas.</td></tr>';
        return;
    }

    const estado = document.getElementById('admin-estado')?.value || '';

    tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Cargando...</td></tr>';

    try {
        adminState.matriculas = await obtenerMatriculasAdmin(credencialesAdmin, estado);
        if (!adminState.matriculas.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">No hay matriculas.</td></tr>';
            renderPagination('pagination-matriculas', 1, 1, () => { });
            return;
        }
        adminPagination.matriculas = 1;
        renderMatriculasTabla();
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Error al cargar matriculas.</td></tr>';
        renderPagination('pagination-matriculas', 1, 1, () => { });
    }
}

function renderMatriculasTabla() {
    const tbody = document.getElementById('admin-body');
    if (!tbody) return;

    let items = [...adminState.matriculas].sort((a, b) => {
        const aTime = new Date(a.fechaRegistro).getTime();
        const bTime = new Date(b.fechaRegistro).getTime();
        if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) {
            return bTime - aTime;
        }
        return (b.id || 0) - (a.id || 0);
    });

    // Apply search filter
    const qMat = document.getElementById('search-matriculas')?.value.trim().toLowerCase() || '';
    if (qMat) {
        items = items.filter(item => {
            const alumno = (item.alumno || '').toString().toLowerCase();
            const categoria = (item.categoria || '').toString().toLowerCase();
            const referencia = (item.referenciaPago || '').toString().toLowerCase();
            const estado = (item.estado || '').toString().toLowerCase();
            return alumno.includes(qMat) || categoria.includes(qMat) || referencia.includes(qMat) || estado.includes(qMat);
        });
    }

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const currentPage = Math.min(adminPagination.matriculas, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = pageItems.map(item => {
        const fecha = formatearFecha(item.fechaRegistro);
        const estadoClase = obtenerClaseEstado(item.estado);
        const referencia = item.referenciaPago || 'N/A';

        return `
            <tr>
                <td>${fecha}</td>
                <td>${item.alumno || 'N/A'}</td>
                <td>${item.categoria || 'N/A'}</td>
                <td><span class="estado-badge ${estadoClase}">${item.estado || 'N/A'}</span></td>
                <td>${referencia}</td>
                <td>
                    <button class="btn-accion btn-anular" data-id="${item.id}">Anular</button>
                    <button class="btn-accion btn-cambiar" data-id="${item.id}">Cambiar categoria</button>
                    <button class="btn-accion btn-eliminar" data-id="${item.id}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');

    renderPagination('pagination-matriculas', currentPage, totalPages, (page) => {
        adminPagination.matriculas = page;
        renderMatriculasTabla();
    });
}

async function guardarMatriculaAdmin(e) {
    e.preventDefault();
    if (!credencialesAdmin) return;
    clearError('matricula-error');

    const alumnoDni = (document.getElementById('matricula-dni').value || '').trim();
    const categoriaVal = document.getElementById('matricula-categoria').value;
    const categoriaId = Number(categoriaVal);

    if (!alumnoDni) {
        showError('matricula-error', 'El DNI del alumno es obligatorio.');
        return;
    }
    if (!/^[0-9]{8}$/.test(alumnoDni)) {
        showError('matricula-error', 'El DNI debe contener 8 dígitos numéricos.');
        return;
    }

    if (!categoriaVal || Number.isNaN(categoriaId) || categoriaId <= 0) {
        showError('matricula-error', 'Selecciona una categoría válida.');
        return;
    }

    const datos = { alumnoDni, categoriaId };

    try {
        await crearMatriculaAdmin(credencialesAdmin, datos);
        document.getElementById('form-matricula-card').classList.add('oculto');
        await cargarMatriculasAdmin();
    } catch (err) {
        showError('matricula-error', err.message || 'Error al crear la matrícula.');
    }
}

async function manejarAnular(button) {
    if (!credencialesAdmin) return;
    const id = Number(button.getAttribute('data-id'));
    if (!id) return;
    if (!confirm('Deseas anular esta matricula?')) return;

    try {
        await actualizarEstadoAdmin(credencialesAdmin, id, 'ANULADA');
        await cargarMatriculasAdmin();
    } catch (error) {
        alert(error.message);
    }
}

async function manejarCambiar(button) {
    if (!credencialesAdmin) return;
    const id = Number(button.getAttribute('data-id'));
    if (!id) return;
    const categoriaId = prompt('ID de nueva categoria:');
    if (!categoriaId) return;

    try {
        await actualizarCategoriaAdmin(credencialesAdmin, id, Number(categoriaId));
        await cargarMatriculasAdmin();
    } catch (error) {
        alert(error.message);
    }
}

async function manejarEliminar(button) {
    if (!credencialesAdmin) return;
    const id = Number(button.getAttribute('data-id'));
    if (!id) return;
    if (!confirm('Deseas eliminar esta matricula?')) return;

    try {
        await eliminarMatriculaAdmin(credencialesAdmin, id);
        await cargarMatriculasAdmin();
    } catch (error) {
        alert(error.message);
    }
}

async function cargarReporteAdmin() {
    if (!credencialesAdmin) return;
    const anio = Number(document.getElementById('admin-reporte-anio').value);
    const mes = Number(document.getElementById('admin-reporte-mes').value);
    const resultado = document.getElementById('admin-reporte-resultado');
    const btnExportar = document.getElementById('btn-exportar-reporte');
    if (!resultado) return;

    resultado.textContent = 'Generando reporte...';
    if (btnExportar) btnExportar.disabled = true;

    try {
        const data = await obtenerReporteMensualAdmin(credencialesAdmin, anio, mes);
        adminState.reporte = {
            ...data,
            anio,
            mes
        };
        resultado.innerHTML = renderReporteMensual(data);
        renderReporteBarras(data);
        if (btnExportar) btnExportar.disabled = false;
    } catch (error) {
        resultado.textContent = 'Error al generar el reporte.';
        renderReporteBarras(null);
        if (btnExportar) btnExportar.disabled = true;
    }
}

function renderReporteMensual(data) {
    const monto = data.montoConfirmado != null
        ? `S/ ${Number(data.montoConfirmado).toFixed(2)}`
        : 'S/ 0.00';

    return `
        <div class="reporte-grid">
            <div class="reporte-item">
                <span>Total</span>
                <strong>${data.totalMatriculas}</strong>
            </div>
            <div class="reporte-item">
                <span>Confirmadas</span>
                <strong>${data.confirmadas}</strong>
            </div>
            <div class="reporte-item">
                <span>Pendientes</span>
                <strong>${data.pendientes}</strong>
            </div>
            <div class="reporte-item">
                <span>Rechazadas</span>
                <strong>${data.rechazadas}</strong>
            </div>
            <div class="reporte-item">
                <span>Anuladas</span>
                <strong>${data.anuladas}</strong>
            </div>
            <div class="reporte-item">
                <span>Monto confirmado</span>
                <strong>${monto}</strong>
            </div>
        </div>
    `;
}

function renderReporteBarras(data) {
    const contenedor = document.getElementById('admin-reporte-chart');
    if (!contenedor) return;

    if (!data) {
        contenedor.innerHTML = '<p class="tabla-cargando">Sin datos para el grafico.</p>';
        return;
    }

    const valores = [
        { label: 'Total', value: data.totalMatriculas || 0 },
        { label: 'Confirmadas', value: data.confirmadas || 0 },
        { label: 'Pendientes', value: data.pendientes || 0 },
        { label: 'Rechazadas', value: data.rechazadas || 0 },
        { label: 'Anuladas', value: data.anuladas || 0 }
    ];

    const max = Math.max(...valores.map(item => item.value), 1);
    contenedor.innerHTML = valores.map(item => {
        const porcentaje = Math.round((item.value / max) * 100);
        return `
            <div class="reporte-bar">
                <span class="reporte-bar-label">${item.label}</span>
                <div class="reporte-bar-track">
                    <div class="reporte-bar-fill" style="width: ${porcentaje}%;"></div>
                </div>
                <span class="reporte-bar-value">${item.value}</span>
            </div>
        `;
    }).join('');
}

function exportarReportePdf() {
    if (!adminState.reporte) {
        alert('Genera un reporte antes de exportar.');
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('No se pudo cargar jsPDF. Verifica la conexion.');
        return;
    }

    const data = adminState.reporte;
    const monto = data.montoConfirmado != null
        ? `S/ ${Number(data.montoConfirmado).toFixed(2)}`
        : 'S/ 0.00';
    const periodo = `${String(data.mes).padStart(2, '0')}/${data.anio}`;

    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    const title = 'REPORTE MENSUAL - ACADEMIA DE FUTBOL';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Periodo: ${periodo}`, 40, 62);

    const body = [
        ['Total matriculas', String(data.totalMatriculas ?? 0)],
        ['Confirmadas', String(data.confirmadas ?? 0)],
        ['Pendientes', String(data.pendientes ?? 0)],
        ['Rechazadas', String(data.rechazadas ?? 0)],
        ['Anuladas', String(data.anuladas ?? 0)],
        ['Monto confirmado', monto]
    ];

    doc.autoTable({
        startY: 80,
        head: [['Indicador', 'Valor']],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [11, 61, 145] },
        styles: { fontSize: 10, cellPadding: 6 }
    });

    // Set PDF properties to give the new browser tab a meaningful title
    doc.setProperties({
        title: `Reporte_${periodo.replace('/', '-')}`
    });

    const pdfBlob = doc.output('blob');
    const blobURL = URL.createObjectURL(pdfBlob);
    window.open(blobURL, '_blank');
}

// ----------------------------------------------------
// CRUD ALUMNOS
// ----------------------------------------------------
function initCrudListeners() {
    // Alumnos
    document.getElementById('btn-recargar-alumnos')?.addEventListener('click', cargarAlumnosAdmin);
    document.getElementById('btn-nuevo-alumno')?.addEventListener('click', () => {
        document.getElementById('form-alumno').reset();
        document.getElementById('alumno-id').value = '';
        document.getElementById('form-alumno-title').textContent = 'Nuevo Alumno';
        document.getElementById('form-alumno-card').classList.remove('oculto');
    });
    document.getElementById('btn-cancelar-alumno')?.addEventListener('click', () => {
        document.getElementById('form-alumno-card').classList.add('oculto');
    });
    document.getElementById('form-alumno')?.addEventListener('submit', guardarAlumno);
    document.getElementById('alumnos-body')?.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar-alumno');
        if (btnEditar) editarAlumno(btnEditar.dataset.id);
        const btnEliminar = e.target.closest('.btn-eliminar-alumno');
        if (btnEliminar) eliminarAlumno(btnEliminar.dataset.id);
    });

    // Categorias
    document.getElementById('btn-recargar-categorias')?.addEventListener('click', cargarCategoriasAdmin);
    document.getElementById('btn-nueva-categoria')?.addEventListener('click', () => {
        document.getElementById('form-categoria').reset();
        document.getElementById('categoria-id').value = '';
        document.getElementById('form-categoria-title').textContent = 'Nueva Categoría';
        document.getElementById('form-categoria-card').classList.remove('oculto');
    });
    document.getElementById('btn-cancelar-categoria')?.addEventListener('click', () => {
        document.getElementById('form-categoria-card').classList.add('oculto');
    });
    document.getElementById('form-categoria')?.addEventListener('submit', guardarCategoria);
    document.getElementById('categorias-body')?.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar-categoria');
        if (btnEditar) editarCategoria(btnEditar.dataset.id);
        const btnEliminar = e.target.closest('.btn-eliminar-categoria');
        if (btnEliminar) eliminarCategoria(btnEliminar.dataset.id);
    });

    // Usuarios
    document.getElementById('btn-recargar-usuarios')?.addEventListener('click', cargarUsuariosAdmin);
    document.getElementById('btn-nuevo-usuario')?.addEventListener('click', () => {
        document.getElementById('form-usuario').reset();
        document.getElementById('usuario-id').value = '';
        document.getElementById('form-usuario-title').textContent = 'Nuevo Administrador';
        document.getElementById('form-usuario-card').classList.remove('oculto');
    });
    document.getElementById('btn-cancelar-usuario')?.addEventListener('click', () => {
        document.getElementById('form-usuario-card').classList.add('oculto');
    });
    document.getElementById('form-usuario')?.addEventListener('submit', guardarUsuario);
    document.getElementById('usuarios-body')?.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar-usuario');
        if (btnEditar) editarUsuario(btnEditar.dataset.id);
        const btnEliminar = e.target.closest('.btn-eliminar-usuario');
        if (btnEliminar) eliminarUsuario(btnEliminar.dataset.id);
    });
}

let alumnosList = [];
let categoriasList = [];
let usuariosList = [];

// -- ALUMNOS
async function cargarAlumnosAdmin() {
    if (!credencialesAdmin) return;
    const tbody = document.getElementById('alumnos-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Cargando...</td></tr>';
    try {
        alumnosList = await obtenerAlumnosAdmin(credencialesAdmin);
        if (!alumnosList.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">No hay alumnos registrados.</td></tr>';
            renderPagination('pagination-alumnos', 1, 1, () => { });
            return;
        }
        adminPagination.alumnos = 1;
        renderAlumnosTabla();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="tabla-cargando">Error: ${e.message}</td></tr>`;
        renderPagination('pagination-alumnos', 1, 1, () => { });
    }
}

function renderAlumnosTabla() {
    const tbody = document.getElementById('alumnos-body');
    if (!tbody) return;

    let items = [...alumnosList].sort((a, b) => (b.id || 0) - (a.id || 0));
    const qAl = document.getElementById('search-alumnos')?.value.trim().toLowerCase() || '';
    if (qAl) {
        items = items.filter(a => {
            const nombre = (a.nombreCompleto || '').toString().toLowerCase();
            const dni = (a.dni || '').toString().toLowerCase();
            const correo = (a.correoTutor || '').toString().toLowerCase();
            return nombre.includes(qAl) || dni.includes(qAl) || correo.includes(qAl);
        });
    }
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const currentPage = Math.min(adminPagination.alumnos, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = pageItems.map(a => `
        <tr>
            <td>${a.nombreCompleto}</td>
            <td>${a.dni}</td>
            <td>${a.fechaNacimiento}</td>
            <td>${a.correoTutor}</td>
            <td>${a.activo ? '<span style="color:green;font-weight:bold;">Activo</span>' : '<span style="color:red;">Inactivo</span>'}</td>
            <td>
                <button class="btn-accion btn-editar-alumno" data-id="${a.id}">Editar</button>
                <button class="btn-accion btn-eliminar-alumno" data-id="${a.id}">Eliminar</button>
            </td>
        </tr>
    `).join('');

    renderPagination('pagination-alumnos', currentPage, totalPages, (page) => {
        adminPagination.alumnos = page;
        renderAlumnosTabla();
    });
}

async function guardarAlumno(e) {
    e.preventDefault();
    clearError('alumno-error');
    const id = document.getElementById('alumno-id').value;
    const nombre = (document.getElementById('alumno-nombre').value || '').trim();
    const dni = (document.getElementById('alumno-dni').value || '').trim();
    const fechaNacimiento = (document.getElementById('alumno-fecha').value || '').trim();
    const correo = (document.getElementById('alumno-correo').value || '').trim();
    const contrasena = document.getElementById('alumno-contrasena').value || null;
    const activo = document.getElementById('alumno-activo').value === 'true';

    if (!nombre) {
        showError('alumno-error', 'El nombre del alumno es obligatorio.');
        return;
    }
    if (!dni) {
        showError('alumno-error', 'El DNI es obligatorio.');
        return;
    }
    if (!/^[0-9]{8}$/.test(dni)) {
        showError('alumno-error', 'El DNI debe contener 8 dígitos numéricos.');
        return;
    }
    if (!fechaNacimiento) {
        showError('alumno-error', 'La fecha de nacimiento es obligatoria.');
        return;
    }
    if (!correo || !isValidEmail(correo)) {
        showError('alumno-error', 'Ingrese un correo de tutor válido.');
        return;
    }

    const datos = {
        nombreCompleto: nombre,
        dni: dni,
        fechaNacimiento: fechaNacimiento,
        correoTutor: correo,
        contrasena: contrasena,
        activo: activo
    };

    try {
        await guardarAlumnoAdmin(credencialesAdmin, datos, id);
        document.getElementById('form-alumno-card').classList.add('oculto');
        await cargarAlumnosAdmin();
    } catch (err) {
        showError('alumno-error', err.message || 'Error al guardar alumno.');
    }
}

function editarAlumno(idStr) {
    const id = Number(idStr);
    const alumno = alumnosList.find(a => a.id === id);
    if (!alumno) return;
    document.getElementById('alumno-id').value = alumno.id;
    document.getElementById('alumno-nombre').value = alumno.nombreCompleto;
    document.getElementById('alumno-dni').value = alumno.dni;
    document.getElementById('alumno-fecha').value = alumno.fechaNacimiento;
    document.getElementById('alumno-correo').value = alumno.correoTutor;
    document.getElementById('alumno-contrasena').value = '';
    document.getElementById('alumno-activo').value = alumno.activo ? 'true' : 'false';
    document.getElementById('form-alumno-title').textContent = 'Editar Alumno';
    document.getElementById('form-alumno-card').classList.remove('oculto');
}

async function eliminarAlumno(idStr) {
    if (!confirm('¿Deseas eliminar este alumno? (Verificará restricciones)')) return;
    try {
        await eliminarAlumnoAdmin(credencialesAdmin, Number(idStr));
        await cargarAlumnosAdmin();
    } catch (err) {
        alert(err.message);
    }
}

// -- CATEGORIAS
async function cargarCategoriasAdmin() {
    if (!credencialesAdmin) return;
    const tbody = document.getElementById('categorias-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Cargando...</td></tr>';
    try {
        categoriasList = await obtenerCategoriasAdmin(credencialesAdmin);
        if (!categoriasList.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">No hay categorías.</td></tr>';
            renderPagination('pagination-categorias', 1, 1, () => { });
            return;
        }
        adminPagination.categorias = 1;
        renderCategoriasTabla();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="tabla-cargando">Error: ${e.message}</td></tr>`;
        renderPagination('pagination-categorias', 1, 1, () => { });
    }
}

function renderCategoriasTabla() {
    const tbody = document.getElementById('categorias-body');
    if (!tbody) return;

    let items = [...categoriasList].sort((a, b) => (b.id || 0) - (a.id || 0));
    const qCat = document.getElementById('search-categorias')?.value.trim().toLowerCase() || '';
    if (qCat) {
        items = items.filter(c => (c.nombre || '').toString().toLowerCase().includes(qCat));
    }
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const currentPage = Math.min(adminPagination.categorias, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = pageItems.map(c => `
        <tr>
            <td>${c.nombre}</td>
            <td>${c.edadMinima} - ${c.edadMaxima} años</td>
            <td>${c.cuposDisponibles}</td>
            <td>S/ ${c.montoMatricula ? c.montoMatricula.toFixed(2) : '0.00'}</td>
            <td>${c.activo ? '<span style="color:green;font-weight:bold;">Activa</span>' : '<span style="color:red;">Inactiva</span>'}</td>
            <td>
                <button class="btn-accion btn-editar-categoria" data-id="${c.id}">Editar</button>
                <button class="btn-accion btn-eliminar-categoria" data-id="${c.id}">Eliminar</button>
            </td>
        </tr>
    `).join('');

    renderPagination('pagination-categorias', currentPage, totalPages, (page) => {
        adminPagination.categorias = page;
        renderCategoriasTabla();
    });
}

async function guardarCategoria(e) {
    e.preventDefault();
    clearError('categoria-error');
    const id = document.getElementById('categoria-id').value;
    const nombre = (document.getElementById('categoria-nombre').value || '').trim();
    const montoVal = document.getElementById('categoria-monto').value;
    const edadMin = parseInt(document.getElementById('categoria-edadmin').value);
    const edadMax = parseInt(document.getElementById('categoria-edadmax').value);
    const cupos = parseInt(document.getElementById('categoria-cupos').value);
    const activo = document.getElementById('categoria-activo').value === 'true';

    if (!nombre) {
        showError('categoria-error', 'El nombre de la categoría es obligatorio.');
        return;
    }
    const monto = parseFloat(montoVal);
    if (Number.isNaN(monto) || monto < 0) {
        showError('categoria-error', 'Ingrese un monto válido (≥ 0).');
        return;
    }
    if (Number.isNaN(edadMin) || Number.isNaN(edadMax) || edadMin < 0 || edadMax < 0) {
        showError('categoria-error', 'Ingrese edades válidas.');
        return;
    }
    if (edadMin > edadMax) {
        showError('categoria-error', 'La edad mínima no puede ser mayor a la máxima.');
        return;
    }
    if (Number.isNaN(cupos) || cupos < 0) {
        showError('categoria-error', 'Ingrese un número de cupos válido (>=0).');
        return;
    }

    const datos = {
        nombre,
        montoMatricula: monto,
        edadMinima: edadMin,
        edadMaxima: edadMax,
        cuposDisponibles: cupos,
        activo
    };

    try {
        await guardarCategoriaAdmin(credencialesAdmin, datos, id);
        document.getElementById('form-categoria-card').classList.add('oculto');
        await cargarCategoriasAdmin();
    } catch (err) {
        showError('categoria-error', err.message || 'Error al guardar categoría.');
    }
}

function editarCategoria(idStr) {
    const id = Number(idStr);
    const cat = categoriasList.find(c => c.id === id);
    if (!cat) return;
    document.getElementById('categoria-id').value = cat.id;
    document.getElementById('categoria-nombre').value = cat.nombre;
    document.getElementById('categoria-monto').value = cat.montoMatricula;
    document.getElementById('categoria-edadmin').value = cat.edadMinima;
    document.getElementById('categoria-edadmax').value = cat.edadMaxima;
    document.getElementById('categoria-cupos').value = cat.cuposDisponibles;
    document.getElementById('categoria-activo').value = cat.activo ? 'true' : 'false';
    document.getElementById('form-categoria-title').textContent = 'Editar Categoría';
    document.getElementById('form-categoria-card').classList.remove('oculto');
}

async function eliminarCategoria(idStr) {
    if (!confirm('¿Deseas eliminar esta categoría?')) return;
    try {
        await eliminarCategoriaAdmin(credencialesAdmin, Number(idStr));
        await cargarCategoriasAdmin();
    } catch (err) {
        alert(err.message);
    }
}

// -- USUARIOS
async function cargarUsuariosAdmin() {
    if (!credencialesAdmin) return;
    const tbody = document.getElementById('usuarios-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" class="tabla-cargando">Cargando...</td></tr>';
    try {
        usuariosList = await obtenerUsuariosAdmin(credencialesAdmin);
        if (!usuariosList.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="tabla-cargando">No hay administradores.</td></tr>';
            renderPagination('pagination-usuarios', 1, 1, () => { });
            return;
        }
        adminPagination.usuarios = 1;
        renderUsuariosTabla();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="tabla-cargando">Error: ${e.message}</td></tr>`;
        renderPagination('pagination-usuarios', 1, 1, () => { });
    }
}

function renderUsuariosTabla() {
    const tbody = document.getElementById('usuarios-body');
    if (!tbody) return;

    let items = [...usuariosList].sort((a, b) => (b.id || 0) - (a.id || 0));
    const qUsr = document.getElementById('search-usuarios')?.value.trim().toLowerCase() || '';
    if (qUsr) {
        items = items.filter(u => {
            const nombre = (u.nombre || '').toString().toLowerCase();
            const username = (u.username || '').toString().toLowerCase();
            return nombre.includes(qUsr) || username.includes(qUsr);
        });
    }
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const currentPage = Math.min(adminPagination.usuarios, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    tbody.innerHTML = pageItems.map(u => `
        <tr>
            <td>${u.nombre}</td>
            <td>${u.username}</td>
            <td>${u.activo ? '<span style="color:green;font-weight:bold;">Activo</span>' : '<span style="color:red;">Inactivo</span>'}</td>
            <td>
                <button class="btn-accion btn-editar-usuario" data-id="${u.id}">Editar</button>
                <button class="btn-accion btn-eliminar-usuario" data-id="${u.id}">Eliminar</button>
            </td>
        </tr>
    `).join('');

    renderPagination('pagination-usuarios', currentPage, totalPages, (page) => {
        adminPagination.usuarios = page;
        renderUsuariosTabla();
    });
}

function renderPagination(containerId, currentPage, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const buttons = [];
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    buttons.push(`<button class="page-btn" ${prevDisabled} data-page="${currentPage - 1}">Anterior</button>`);

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        buttons.push(`<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`);
    }

    buttons.push(`<button class="page-btn" ${nextDisabled} data-page="${currentPage + 1}">Siguiente</button>`);
    container.innerHTML = buttons.join('');

    container.querySelectorAll('button[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = Number(btn.getAttribute('data-page'));
            if (!Number.isFinite(page) || page < 1 || page > totalPages) return;
            onPageChange(page);
        });
    });
}

async function guardarUsuario(e) {
    e.preventDefault();
    clearError('usuario-error');
    const id = document.getElementById('usuario-id').value;
    const nombre = (document.getElementById('usuario-nombre').value || '').trim();
    const username = (document.getElementById('usuario-username').value || '').trim();
    const pwd = document.getElementById('usuario-password').value;
    const activo = document.getElementById('usuario-activo').value === 'true';

    if (!nombre) {
        showError('usuario-error', 'El nombre es obligatorio.');
        return;
    }
    if (!username) {
        showError('usuario-error', 'El nombre de usuario es obligatorio.');
        return;
    }
    if (!id && !pwd) {
        showError('usuario-error', 'La contraseña es obligatoria para nuevos usuarios.');
        return;
    }

    const datos = { nombre, username, password: pwd || null, activo };
    try {
        await guardarUsuarioAdmin(credencialesAdmin, datos, id);
        document.getElementById('form-usuario-card').classList.add('oculto');
        await cargarUsuariosAdmin();
    } catch (err) {
        showError('usuario-error', err.message || 'Error al guardar usuario.');
    }
}

function editarUsuario(idStr) {
    const id = Number(idStr);
    const u = usuariosList.find(x => x.id === id);
    if (!u) return;
    document.getElementById('usuario-id').value = u.id;
    document.getElementById('usuario-nombre').value = u.nombre;
    document.getElementById('usuario-username').value = u.username;
    document.getElementById('usuario-password').value = '';
    document.getElementById('usuario-activo').value = u.activo ? 'true' : 'false';
    document.getElementById('form-usuario-title').textContent = 'Editar Administrador';
    document.getElementById('form-usuario-card').classList.remove('oculto');
}

async function eliminarUsuario(idStr) {
    if (!confirm('¿Deseas eliminar este administrador?')) return;
    try {
        await eliminarUsuarioAdmin(credencialesAdmin, Number(idStr));
        await cargarUsuariosAdmin();
    } catch (err) {
        alert(err.message);
    }
}
