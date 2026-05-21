let categorias = [];
let matriculaIdConfirmada = null;
let credencialesCliente = null;

document.addEventListener('DOMContentLoaded', async () => {
    const formLogin = document.getElementById('form-cliente-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault();
            await manejarLoginCliente();
        });
    }

    document.querySelectorAll('.cliente-nav').forEach(button => {
        button.addEventListener('click', () => {
            const view = button.getAttribute('data-view');
            cambiarVista(view);
        });
    });

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
        alert('Error al cargar categorias: ' + error.message);
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
                contrasena: document.getElementById('contrasena').value.trim(),
                categoriaId: parseInt(document.getElementById('categoria').value),
                metodoPago: 'TARJETA'
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
            contrasena: document.getElementById('contrasena').value.trim(),
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
            await cargarHistorialCliente();
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

    document.getElementById('historial-body').addEventListener('click', async (event) => {
        const btnPagar = event.target.closest('.btn-pagar-historial');
        if (!btnPagar) return;

        if (!credencialesCliente) {
            alert('Inicia sesion para continuar.');
            return;
        }

        const id = Number(btnPagar.getAttribute('data-id'));
        if (!id) return;

        const token = prompt('Token de pago', 'tok_test_simulado');
        if (!token) return;

        try {
            await pagarMatriculaCliente(credencialesCliente, id, token);
            await cargarHistorialCliente();
        } catch (error) {
            alert(error.message);
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

async function manejarLoginCliente() {
    const dni = document.getElementById('login-dni').value.trim();
    const contrasena = document.getElementById('login-pass').value;
    const errorEl = document.getElementById('login-error');
    const btnLogin = document.getElementById('btn-login');

    if (errorEl) errorEl.textContent = '';
    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.textContent = 'Ingresando...';
    }

    try {
        const respuesta = await loginCliente({ dni, contrasena });
        if (respuesta && respuesta.success) {
            credencialesCliente = { dni, contrasena, nombre: respuesta.nombre };
            mostrarAppCliente();
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

function mostrarAppCliente() {
    const loginPanel = document.getElementById('cliente-login');
    const appPanel = document.getElementById('cliente-app');
    const userLabel = document.getElementById('cliente-user');
    if (loginPanel) loginPanel.classList.add('oculto');
    if (appPanel) appPanel.classList.remove('oculto');
    if (userLabel && credencialesCliente) {
        userLabel.textContent = `Cliente ${credencialesCliente.dni}`;
    }
    cambiarVista('pagos');
}

function cambiarVista(view) {
    const pagos = document.getElementById('cliente-pagos');
    const historial = document.getElementById('cliente-historial');
    const botones = document.querySelectorAll('.cliente-nav');

    botones.forEach(btn => {
        btn.classList.toggle('activo', btn.getAttribute('data-view') === view);
    });

    if (pagos) pagos.classList.toggle('oculto', view !== 'pagos');
    if (historial) historial.classList.toggle('oculto', view !== 'historial');

    if (view === 'historial') {
        cargarHistorialCliente();
    }
}

async function cargarHistorialCliente() {
    const tbody = document.getElementById('historial-body');
    if (!tbody) return;

    if (!credencialesCliente) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Inicia sesion para ver tu historial.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Cargando...</td></tr>';

    try {
        const items = await obtenerHistorialCliente(credencialesCliente);
        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">No hay matriculas registradas.</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => {
            const fecha = formatearFecha(item.fechaRegistro);
            const monto = item.montoMatricula != null
                ? `S/ ${Number(item.montoMatricula).toFixed(2)}`
                : 'S/ -';
            const estadoClase = obtenerClaseEstado(item.estado);
            const referencia = item.referenciaPago || 'N/A';
            const puedePagar = item.estado === 'PENDIENTE' || item.estado === 'RECHAZADA';

            return `
                <tr>
                    <td>${fecha}</td>
                    <td>${item.categoria || 'N/A'}</td>
                    <td>${monto}</td>
                    <td><span class="estado-badge ${estadoClase}">${item.estado || 'N/A'}</span></td>
                    <td>${referencia}</td>
                    <td>
                        <button class="btn-accion btn-pagar-historial" data-id="${item.id}" ${puedePagar ? '' : 'disabled'}>
                            Pagar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">Error al cargar historial.</td></tr>';
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
