const API_BASE = 'http://localhost:8080/api';

// ── Estado de sesión ──────────────────────────────────────────────────────────
let sesion = { username: '', password: '', nombre: '' };

// ── Utilidades DOM ────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // ---- Login ----
    $('form-login').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = $('btn-login');
        btn.disabled = true;
        btn.textContent = 'Ingresando...';
        $('login-error').textContent = '';

        const username = $('login-user').value.trim();
        const password = $('login-pass').value;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                sesion = { username, password, nombre: data.nombre };
                $('admin-nombre').textContent = data.nombre;
                $('pantalla-login').classList.add('oculto');
                $('pantalla-admin').classList.remove('oculto');
                cargarMatriculas();
            } else {
                $('login-error').textContent = data.mensaje;
            }
        } catch (err) {
            $('login-error').textContent = 'Error de conexión con el servidor.';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Iniciar sesión';
        }
    });

    // ---- Logout ----
    $('btn-logout').addEventListener('click', () => {
        sesion = { username: '', password: '', nombre: '' };
        $('pantalla-admin').classList.add('oculto');
        $('pantalla-login').classList.remove('oculto');
        $('login-user').value = '';
        $('login-pass').value = '';
    });

    // ---- Navegación sidebar ----
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('activo'));
            item.classList.add('activo');
            const seccion = item.dataset.seccion;
            document.querySelectorAll('.admin-seccion').forEach(s => s.classList.add('oculto'));
            $(`seccion-${seccion}`).classList.remove('oculto');
            if (seccion === 'categorias') cargarCategorias();
        });
    });

    // ---- Recargar matrículas ----
    $('btn-recargar').addEventListener('click', cargarMatriculas);

    // ---- Filtros en tiempo real ----
    $('filtro-buscar').addEventListener('input', filtrarTabla);
    $('filtro-estado').addEventListener('change', filtrarTabla);
});

// ── Matrículas ────────────────────────────────────────────────────────────────
let matriculasCache = [];

async function cargarMatriculas() {
    const tbody = $('cuerpo-tabla');
    tbody.innerHTML = '<tr><td colspan="7" class="tabla-cargando">Cargando...</td></tr>';

    try {
        const res = await fetch(`${API_BASE}/admin/matriculas`, {
            headers: {
                'X-Admin-User': sesion.username,
                'X-Admin-Pass': sesion.password
            }
        });

        if (res.status === 401) {
            tbody.innerHTML = '<tr><td colspan="7" class="tabla-cargando">Acceso denegado.</td></tr>';
            return;
        }

        matriculasCache = await res.json();
        actualizarStats(matriculasCache);
        renderTabla(matriculasCache);

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="tabla-cargando">Error: ${err.message}</td></tr>`;
    }
}

function renderTabla(lista) {
    const tbody = $('cuerpo-tabla');
    if (!lista.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="tabla-cargando">No hay matrículas.</td></tr>';
        return;
    }

    tbody.innerHTML = lista.map(m => `
        <tr>
            <td>${m.id}</td>
            <td>${m.alumno?.nombreCompleto ?? '—'}</td>
            <td>${m.alumno?.dni ?? '—'}</td>
            <td>${m.categoria?.nombre ?? '—'}</td>
            <td>${formatFecha(m.fechaRegistro)}</td>
            <td><span class="badge badge-${m.estado}">${m.estado}</span></td>
            <td>${m.referenciaPago ?? '<span style="color:#475569">—</span>'}</td>
        </tr>
    `).join('');
}

function filtrarTabla() {
    const texto  = $('filtro-buscar').value.toLowerCase();
    const estado = $('filtro-estado').value;

    const filtradas = matriculasCache.filter(m => {
        const nombre = (m.alumno?.nombreCompleto ?? '').toLowerCase();
        const dni    = (m.alumno?.dni ?? '').toLowerCase();
        const ref    = (m.referenciaPago ?? '').toLowerCase();
        const coincideTexto  = !texto  || nombre.includes(texto) || dni.includes(texto) || ref.includes(texto);
        const coincideEstado = !estado || m.estado === estado;
        return coincideTexto && coincideEstado;
    });

    renderTabla(filtradas);
}

function actualizarStats(lista) {
    $('stat-total').textContent       = lista.length;
    $('stat-confirmadas').textContent = lista.filter(m => m.estado === 'CONFIRMADA').length;
    $('stat-pendientes').textContent  = lista.filter(m => m.estado === 'PENDIENTE').length;
    $('stat-rechazadas').textContent  = lista.filter(m => m.estado === 'RECHAZADA').length;
    $('stat-espera').textContent      = lista.filter(m => m.estado === 'EN_ESPERA').length;
}

// ── Categorías ────────────────────────────────────────────────────────────────
async function cargarCategorias() {
    const grid = $('cat-grid');
    grid.innerHTML = '<p class="tabla-cargando">Cargando...</p>';

    try {
        const res = await fetch(`${API_BASE}/matriculas/categorias`);
        const cats = await res.json();

        grid.innerHTML = cats.map(c => {
            const totalEstimado = c.cuposDisponibles + (20 - c.cuposDisponibles);   // aprox
            const pct = Math.round((c.cuposDisponibles / 20) * 100);
            return `
            <div class="cat-card">
                <p class="cat-nombre">${c.nombre}</p>
                <div class="cat-info">
                    <p>Edad: <span>${c.edadMinima} – ${c.edadMaxima} años</span></p>
                    <p>Cupos disponibles: <span>${c.cuposDisponibles}</span></p>
                    <p>Monto: <span>S/ ${Number(c.montoMatricula).toFixed(2)}</span></p>
                </div>
                <div class="cupos-bar">
                    <div class="cupos-fill" style="width:${pct}%"></div>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        grid.innerHTML = `<p class="tabla-cargando">Error: ${err.message}</p>`;
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatFecha(fechaStr) {
    if (!fechaStr) return '—';
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}
