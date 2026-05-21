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

    const btnRecargar = document.getElementById('admin-recargar');
    if (btnRecargar) {
        btnRecargar.addEventListener('click', cargarMatriculasAdmin);
    }

    const filtroEstado = document.getElementById('admin-estado');
    if (filtroEstado) {
        filtroEstado.addEventListener('change', cargarMatriculasAdmin);
    }

    const body = document.getElementById('admin-body');
    if (body) {
        body.addEventListener('click', async (event) => {
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
    }

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
});

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
