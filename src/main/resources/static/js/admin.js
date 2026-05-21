let credencialesAdmin = null;

const adminState = {
    matriculas: []
};

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

    // CRUD Event Listeners
    initCrudListeners();
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
            if(viewEl) viewEl.classList.remove('oculto');
            
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
    if(userDisplay && credencialesAdmin) {
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
            return;
        }

        tbody.innerHTML = adminState.matriculas.map(item => {
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
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Error al cargar matriculas.</td></tr>';
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
    if (!resultado) return;

    resultado.textContent = 'Generando reporte...';

    try {
        const data = await obtenerReporteMensualAdmin(credencialesAdmin, anio, mes);
        resultado.innerHTML = renderReporteMensual(data);
    } catch (error) {
        resultado.textContent = 'Error al generar el reporte.';
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

function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    if (Number.isNaN(fecha.getTime())) return fechaStr;
    const fechaTexto = fecha.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const horaTexto = fecha.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    });
    return `${fechaTexto} ${horaTexto}`;
}

function obtenerClaseEstado(estado) {
    if (!estado) return 'estado-pendiente';
    return `estado-${estado.toLowerCase().replace(/_/g, '-')}`;
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
            return;
        }
        tbody.innerHTML = alumnosList.map(a => `
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
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="tabla-cargando">Error: ${e.message}</td></tr>`;
    }
}

async function guardarAlumno(e) {
    e.preventDefault();
    const errorEl = document.getElementById('alumno-error');
    errorEl.textContent = '';
    const id = document.getElementById('alumno-id').value;
    const datos = {
        nombreCompleto: document.getElementById('alumno-nombre').value,
        dni: document.getElementById('alumno-dni').value,
        fechaNacimiento: document.getElementById('alumno-fecha').value,
        correoTutor: document.getElementById('alumno-correo').value,
        contrasena: document.getElementById('alumno-contrasena').value || null,
        activo: document.getElementById('alumno-activo').value === 'true'
    };
    try {
        await guardarAlumnoAdmin(credencialesAdmin, datos, id);
        document.getElementById('form-alumno-card').classList.add('oculto');
        await cargarAlumnosAdmin();
    } catch (err) {
        errorEl.textContent = err.message;
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
            return;
        }
        tbody.innerHTML = categoriasList.map(c => `
            <tr>
                <td>${c.nombre}</td>
                <td>${c.edadMinima} - ${c.edadMaxima} años</td>
                <td>${c.cuposDisponibles}</td>
                <td>S/ ${c.monto.toFixed(2)}</td>
                <td>${c.activo ? '<span style="color:green;font-weight:bold;">Activa</span>' : '<span style="color:red;">Inactiva</span>'}</td>
                <td>
                    <button class="btn-accion btn-editar-categoria" data-id="${c.id}">Editar</button>
                    <button class="btn-accion btn-eliminar-categoria" data-id="${c.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="tabla-cargando">Error: ${e.message}</td></tr>`;
    }
}

async function guardarCategoria(e) {
    e.preventDefault();
    const errorEl = document.getElementById('categoria-error');
    errorEl.textContent = '';
    const id = document.getElementById('categoria-id').value;
    const datos = {
        nombre: document.getElementById('categoria-nombre').value,
        monto: parseFloat(document.getElementById('categoria-monto').value),
        edadMinima: parseInt(document.getElementById('categoria-edadmin').value),
        edadMaxima: parseInt(document.getElementById('categoria-edadmax').value),
        cuposDisponibles: parseInt(document.getElementById('categoria-cupos').value),
        activo: document.getElementById('categoria-activo').value === 'true'
    };
    try {
        await guardarCategoriaAdmin(credencialesAdmin, datos, id);
        document.getElementById('form-categoria-card').classList.add('oculto');
        await cargarCategoriasAdmin();
    } catch (err) {
        errorEl.textContent = err.message;
    }
}

function editarCategoria(idStr) {
    const id = Number(idStr);
    const cat = categoriasList.find(c => c.id === id);
    if (!cat) return;
    document.getElementById('categoria-id').value = cat.id;
    document.getElementById('categoria-nombre').value = cat.nombre;
    document.getElementById('categoria-monto').value = cat.monto;
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
            return;
        }
        tbody.innerHTML = usuariosList.map(u => `
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
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="tabla-cargando">Error: ${e.message}</td></tr>`;
    }
}

async function guardarUsuario(e) {
    e.preventDefault();
    const errorEl = document.getElementById('usuario-error');
    errorEl.textContent = '';
    const id = document.getElementById('usuario-id').value;
    const pwd = document.getElementById('usuario-password').value;
    
    if (!id && !pwd) {
        errorEl.textContent = 'La contraseña es obligatoria para nuevos usuarios.';
        return;
    }

    const datos = {
        nombre: document.getElementById('usuario-nombre').value,
        username: document.getElementById('usuario-username').value,
        password: pwd || null,
        activo: document.getElementById('usuario-activo').value === 'true'
    };
    try {
        await guardarUsuarioAdmin(credencialesAdmin, datos, id);
        document.getElementById('form-usuario-card').classList.add('oculto');
        await cargarUsuariosAdmin();
    } catch (err) {
        errorEl.textContent = err.message;
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
