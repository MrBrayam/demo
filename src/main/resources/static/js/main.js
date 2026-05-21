let categorias = [];
let matriculaIdConfirmada = null;
let usuarioActual = null;

document.addEventListener('DOMContentLoaded', async () => {

    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault();
            await manejarLogin();
        });
    } else {
        mostrarApp();
    }

    try {
        categorias = await obtenerCategorias();
        const select = document.getElementById('categoria');
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.nombre} / Edad ${cat.edadMinima}-${cat.edadMaxima}`;
            select.appendChild(option);
        });
    } catch (error) {
        alert('Error al cargar categorías: ' + error.message);
    }

    document.getElementById('categoria').addEventListener('change', actualizarMontoYBoton);

    document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const campoTarjeta = document.getElementById('campo-tarjeta');
            campoTarjeta.style.display = this.value === 'TARJETA' ? 'block' : 'none';
        });
    });

    document.getElementById('btn-siguiente-1').addEventListener('click', async () => {
        if (validarPaso1()) {
            const btnSiguiente = document.getElementById('btn-siguiente-1');
            const textoOriginal = btnSiguiente.textContent;
            btnSiguiente.textContent = 'Verificando...';
            btnSiguiente.disabled = true;

            const datosPaso1 = {
                nombreCompleto: document.getElementById('nombre').value.trim(),
                fechaNacimiento: document.getElementById('fechaNacimiento').value,
                dni: document.getElementById('dni').value.trim(),
                correoTutor: document.getElementById('correoTutor').value.trim(),
                categoriaId: parseInt(document.getElementById('categoria').value),
                metodoPago: "TARJETA" 
            };

            try {
                await verificarAlumno(datosPaso1);
                document.getElementById('paso-2').classList.remove('disabled-panel');
                document.getElementById('arrow-1').classList.add('active');
                document.getElementById('btn-pagar').disabled = false;
            } catch (error) {
                alert(error.message);
            } finally {
                btnSiguiente.textContent = textoOriginal;
                btnSiguiente.disabled = false;
            }
        }
    });

    document.getElementById('btn-pagar').addEventListener('click', async () => {
        if (!validarPaso2()) return;

        const boton = document.getElementById('btn-pagar');
        boton.disabled = true;
        document.getElementById('pagar-label').textContent = 'Procesando...';

        const datos = {
            nombreCompleto: document.getElementById('nombre').value.trim(),
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            dni: document.getElementById('dni').value.trim(),
            correoTutor: document.getElementById('correoTutor').value.trim(),
            categoriaId: parseInt(document.getElementById('categoria').value),
            metodoPago: document.querySelector('input[name="metodoPago"]:checked').value,
            tokenPago: 'tok_test_simulado'  
        };

        try {
            const respuesta = await registrarMatricula(datos);
            matriculaIdConfirmada = respuesta.matriculaId;
            document.getElementById('referenciaConfirmacion').textContent = 'Ref: ' + respuesta.referenciaPago;
            
            document.getElementById('paso-3').classList.remove('disabled-panel');
            document.getElementById('arrow-2').classList.add('active');
            document.getElementById('btn-descargar').style.display = 'inline-flex';
            document.getElementById('placeholder-btn-descargar').style.display = 'none';
            
            document.getElementById('pagar-label').textContent = 'Pagado';
            cargarTransaccionesRecientes();
        } catch (error) {
            alert(error.message);
            boton.disabled = false;
            actualizarMontoYBoton();
        }
    });

    document.getElementById('btn-descargar').addEventListener('click', async () => {
        try {
            await descargarConstancia(matriculaIdConfirmada);
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('recent-body').addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-generar-txt');
        if (btn) {
            const item = JSON.parse(decodeURIComponent(btn.getAttribute('data-transaccion')));
            const fecha = formatearFecha(item.fechaRegistro);
            const monto = item.montoMatricula != null ? `S/ ${Number(item.montoMatricula).toFixed(2)}` : 'S/ -';
            const referencia = item.referenciaPago || 'N/A';
            const contenido = `Detalle de Transacción\n======================\nFecha: ${fecha}\nAlumno: ${item.alumno || 'N/A'}\nCategoría: ${item.categoria || 'N/A'}\nMonto: ${monto}\nEstado: ${item.estado || 'N/A'}\nReferencia: ${referencia}\n`;
            
            const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Transaccion_${referencia}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    actualizarMontoYBoton();
});

function actualizarMontoYBoton() {
    const select = document.getElementById('categoria');
    const cat = categorias.find(c => c.id == select.value);
    const montoTexto = cat ? `S/ ${cat.montoMatricula}` : 'S/ 150.00';
    document.getElementById('montoDisplay').textContent = montoTexto;
    document.getElementById('pagar-label').textContent = cat ? `Pagar ${montoTexto}` : 'Pagar S/ 150.00';
}

async function manejarLogin() {
    const usuario = document.getElementById('login-user').value.trim();
    const clave = document.getElementById('login-pass').value;
    const errorEl = document.getElementById('login-error');
    const btnLogin = document.getElementById('btn-login');

    if (errorEl) errorEl.textContent = '';
    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.textContent = 'Ingresando...';
    }

    try {
        const respuesta = await loginUsuario({ username: usuario, password: clave });
        if (respuesta && respuesta.success) {
            usuarioActual = respuesta.nombre || usuario;
            mostrarApp();
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

function mostrarApp() {
    const loginPanel = document.getElementById('login-panel');
    const appContent = document.getElementById('app-content');
    if (loginPanel) loginPanel.classList.add('oculto');
    if (appContent) appContent.classList.remove('oculto');
    cargarTransaccionesRecientes();
}

async function cargarTransaccionesRecientes() {
    const tbody = document.getElementById('recent-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="tabla-cargando">Cargando...</td></tr>';

    try {
        const items = await obtenerTransaccionesRecientes(5);
        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="tabla-cargando">Sin transacciones recientes.</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => {
            const fecha = formatearFecha(item.fechaRegistro);
            const monto = item.montoMatricula != null
                ? `S/ ${Number(item.montoMatricula).toFixed(2)}`
                : 'S/ -';
            const estadoClase = obtenerClaseEstado(item.estado);
            const referencia = item.referenciaPago || 'N/A';

            return `
                <tr>
                    <td>${fecha}</td>
                    <td>${item.alumno || 'N/A'}</td>
                    <td>${item.categoria || 'N/A'}</td>
                    <td>${monto}</td>
                    <td><span class="estado-badge ${estadoClase}">${item.estado || 'N/A'}</span></td>
                    <td>${referencia}</td>
                    <td>
                        <button class="btn-generar-txt" data-transaccion='${encodeURIComponent(JSON.stringify(item))}'>
                            Generar .txt
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="tabla-cargando">Error al cargar transacciones.</td></tr>';
    }
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
