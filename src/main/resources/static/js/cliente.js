let credencialesCliente = null;
let matriculasCliente = [];
let matriculaSeleccionada = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Login Handling
    const formLogin = document.getElementById('form-cliente-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault();
            await manejarLoginCliente();
        });
    }

    // 2. Sidebar Navigation
    document.querySelectorAll('.cliente-nav').forEach(button => {
        button.addEventListener('click', () => {
            const view = button.getAttribute('data-view');
            cambiarVista(view);
        });
    });

    // 3. Card Form Inputs Formatting
    const inputNumero = document.getElementById('tarjeta-numero');
    const inputVencimiento = document.getElementById('tarjeta-vencimiento');
    const inputCVV = document.getElementById('tarjeta-cvv');

    if (inputNumero) {
        inputNumero.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\s+/g, '');
            if (val !== 'tok_reject_test') {
                val = val.replace(/\D/g, '');
                let formatted = '';
                for (let i = 0; i < val.length; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formatted += ' ';
                    }
                    formatted += val[i];
                }
                e.target.value = formatted;
            }
        });
    }

    if (inputVencimiento) {
        inputVencimiento.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 2) {
                e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
            } else {
                e.target.value = val;
            }
        });
    }

    if (inputCVV) {
        inputCVV.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // 4. Payment Submission
    const formPago = document.getElementById('form-pago-tarjeta');
    if (formPago) {
        formPago.addEventListener('submit', async (event) => {
            event.preventDefault();
            await procesarPagoPendiente();
        });
    }

    document.getElementById('btn-recargar-pagos')?.addEventListener('click', async () => {
        await cargarDatosCliente();
    });

    document.getElementById('btn-recargar-historial')?.addEventListener('click', async () => {
        await cargarDatosCliente();
    });

    // 5. Table Clicks (Selecting pending payments and history shortcuts)
    const pendientesBody = document.getElementById('pendientes-body');
    if (pendientesBody) {
        pendientesBody.addEventListener('click', (event) => {
            const btnPagar = event.target.closest('.btn-seleccionar-pago');
            if (btnPagar) {
                const id = Number(btnPagar.getAttribute('data-id'));
                seleccionarMatricula(id);
            }
        });
    }

    const historialBody = document.getElementById('historial-body');
    if (historialBody) {
        historialBody.addEventListener('click', async (event) => {
            const btnPagar = event.target.closest('.btn-pagar-historial');
            if (btnPagar) {
                const id = Number(btnPagar.getAttribute('data-id'));
                cambiarVista('pagos');
                seleccionarMatricula(id);
                return;
            }

            const btnTxt = event.target.closest('.btn-generar-txt');
            if (btnTxt) {
                const id = Number(btnTxt.getAttribute('data-id'));
                const item = matriculasCliente.find(m => m.id === id);
                if (item) {
                    descargarReciboTxt(item);
                }
            }
        });
    }
});

// LOGIN LOGIC
async function manejarLoginCliente() {
    const dni = document.getElementById('login-dni').value.trim();
    const contrasena = document.getElementById('login-pass').value;
    const errorEl = document.getElementById('login-error');
    const btnLogin = document.getElementById('btn-login');

    if (errorEl) errorEl.textContent = '';
    if (!dni || !contrasena) {
        if (errorEl) errorEl.textContent = 'Ingrese su DNI y contraseña.';
        return;
    }

    if (btnLogin) {
        btnLogin.disabled = true;
        btnLogin.textContent = 'Ingresando...';
    }

    try {
        const respuesta = await loginCliente({ dni, contrasena });
        if (respuesta && respuesta.success) {
            credencialesCliente = { dni, contrasena, nombre: respuesta.nombre };
            mostrarAppCliente();
            await cargarDatosCliente();
            return;
        }

        if (errorEl) {
            errorEl.textContent = respuesta?.mensaje || 'Credenciales inválidas';
        }
    } catch (error) {
        if (errorEl) {
            errorEl.textContent = 'Error de conexión con el servidor';
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
        userLabel.textContent = `${credencialesCliente.nombre || 'Cliente'}\nDNI: ${credencialesCliente.dni}`;
    }
    cambiarVista('pagos');
}

// NAVIGATION
function cambiarVista(view) {
    const pagos = document.getElementById('cliente-pagos');
    const historial = document.getElementById('cliente-historial');
    const botones = document.querySelectorAll('.cliente-nav');

    botones.forEach(btn => {
        btn.classList.toggle('activo', btn.getAttribute('data-view') === view);
    });

    if (pagos) pagos.classList.toggle('oculto', view !== 'pagos');
    if (historial) historial.classList.toggle('oculto', view !== 'historial');
}

// DATA LOADING
async function cargarDatosCliente() {
    if (!credencialesCliente) return;

    try {
        matriculasCliente = await obtenerHistorialCliente(credencialesCliente);
        renderPendientes();
        renderHistorial();
    } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
    }
}

function renderPendientes() {
    const tbody = document.getElementById('pendientes-body');
    if (!tbody) return;

    const pendientes = matriculasCliente.filter(m => m.estado === 'PENDIENTE' || m.estado === 'RECHAZADA');

    if (pendientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="tabla-cargando">No tienes pagos pendientes. ¡Al día!</td></tr>';
        return;
    }

    tbody.innerHTML = pendientes.map(item => {
        const fecha = formatearFecha(item.fechaRegistro);
        const monto = item.montoMatricula != null ? `S/ ${Number(item.montoMatricula).toFixed(2)}` : 'S/ -';
        const estadoClase = obtenerClaseEstado(item.estado);

        return `
            <tr>
                <td>${fecha}</td>
                <td>${item.categoria || 'N/A'}</td>
                <td>${monto}</td>
                <td><span class="estado-badge ${estadoClase}">${item.estado || 'N/A'}</span></td>
                <td>
                    <button class="btn-accion btn-seleccionar-pago" data-id="${item.id}">
                        Pagar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderHistorial() {
    const tbody = document.getElementById('historial-body');
    if (!tbody) return;

    if (matriculasCliente.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-cargando">No hay matrículas registradas.</td></tr>';
        return;
    }

    tbody.innerHTML = matriculasCliente.map(item => {
        const fecha = formatearFecha(item.fechaRegistro);
        const monto = item.montoMatricula != null ? `S/ ${Number(item.montoMatricula).toFixed(2)}` : 'S/ -';
        const estadoClase = obtenerClaseEstado(item.estado);
        const referencia = item.referenciaPago || 'N/A';

        let accionHtml = '';
        if (item.estado === 'CONFIRMADA') {
            accionHtml = `
                <button class="btn-accion btn-generar-txt" data-id="${item.id}">
                    Recibo .txt
                </button>
            `;
        } else if (item.estado === 'PENDIENTE' || item.estado === 'RECHAZADA') {
            accionHtml = `
                <button class="btn-accion btn-pagar-historial" data-id="${item.id}">
                    Pagar
                </button>
            `;
        } else {
            accionHtml = '-';
        }

        return `
            <tr>
                <td>${fecha}</td>
                <td>${item.categoria || 'N/A'}</td>
                <td>${monto}</td>
                <td><span class="estado-badge ${estadoClase}">${item.estado || 'N/A'}</span></td>
                <td>${referencia}</td>
                <td>${accionHtml}</td>
            </tr>
        `;
    }).join('');
}

// SELECTION
function seleccionarMatricula(id) {
    const item = matriculasCliente.find(m => m.id === id);
    if (!item) return;

    matriculaSeleccionada = item;

    document.getElementById('pago-id').textContent = item.id;
    document.getElementById('pago-categoria').textContent = item.categoria || 'N/A';
    document.getElementById('pago-monto').textContent = item.montoMatricula != null ? `S/ ${Number(item.montoMatricula).toFixed(2)}` : 'S/ -';
    document.getElementById('pago-estado').textContent = item.estado || 'N/A';
    document.getElementById('pago-fecha').textContent = formatearFecha(item.fechaRegistro);

    // Habilitar campos
    document.getElementById('tarjeta-numero').disabled = false;
    document.getElementById('tarjeta-vencimiento').disabled = false;
    document.getElementById('tarjeta-cvv').disabled = false;
    document.getElementById('btn-pagar-pendiente').disabled = false;

    // Limpiar errores previos y mensajes
    limpiarErroresTarjeta();
}

function deseleccionarMatricula() {
    matriculaSeleccionada = null;

    document.getElementById('pago-id').textContent = '-';
    document.getElementById('pago-categoria').textContent = '-';
    document.getElementById('pago-monto').textContent = '-';
    document.getElementById('pago-estado').textContent = '-';
    document.getElementById('pago-fecha').textContent = '-';

    // Deshabilitar y limpiar campos
    const inputNumero = document.getElementById('tarjeta-numero');
    const inputVencimiento = document.getElementById('tarjeta-vencimiento');
    const inputCVV = document.getElementById('tarjeta-cvv');

    inputNumero.value = '';
    inputVencimiento.value = '';
    inputCVV.value = '';

    inputNumero.disabled = true;
    inputVencimiento.disabled = true;
    inputCVV.disabled = true;
    document.getElementById('btn-pagar-pendiente').disabled = true;

    limpiarErroresTarjeta();
}

function limpiarErroresTarjeta() {
    document.getElementById('error-tarjeta-numero').textContent = '';
    document.getElementById('error-tarjeta-vencimiento').textContent = '';
    document.getElementById('error-tarjeta-cvv').textContent = '';
    document.getElementById('pago-mensaje').textContent = '';
    document.getElementById('pago-mensaje').className = 'pago-mensaje';
}

// VALIDATION
function validarTarjeta() {
    let valido = true;
    limpiarErroresTarjeta();

    const numero = document.getElementById('tarjeta-numero').value.trim();
    const vencimiento = document.getElementById('tarjeta-vencimiento').value.trim();
    const cvv = document.getElementById('tarjeta-cvv').value.trim();

    if (numero === 'tok_reject_test') {
        // Permitir simulación directa de rechazo
    } else {
        const digitos = numero.replace(/\s+/g, '');
        if (!/^\d{13,16}$/.test(digitos)) {
            document.getElementById('error-tarjeta-numero').textContent = 'El número de tarjeta debe tener entre 13 y 16 dígitos.';
            valido = false;
        }
    }

    if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
        document.getElementById('error-tarjeta-vencimiento').textContent = 'Formato inválido. Use MM/AA.';
        valido = false;
    } else {
        const partes = vencimiento.split('/');
        const mes = Number(partes[0]);
        if (mes < 1 || mes > 12) {
            document.getElementById('error-tarjeta-vencimiento').textContent = 'Mes inválido (1-12).';
            valido = false;
        }
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        document.getElementById('error-tarjeta-cvv').textContent = 'El CVV debe tener 3 o 4 dígitos.';
        valido = false;
    }

    return valido;
}

// PROCESSING PAYMENT
async function procesarPagoPendiente() {
    if (!matriculaSeleccionada || !credencialesCliente) return;

    if (!validarTarjeta()) return;

    const btnPagar = document.getElementById('btn-pagar-pendiente');
    const mensajeEl = document.getElementById('pago-mensaje');

    const textoOriginal = btnPagar.textContent;
    btnPagar.disabled = true;
    btnPagar.textContent = 'Procesando...';

    const numeroTarjetaVal = document.getElementById('tarjeta-numero').value.trim();
    const tokenPago = (numeroTarjetaVal === 'tok_reject_test') ? 'tok_reject_test' : 'tok_test_simulado';

    try {
        const resultado = await pagarMatriculaCliente(credencialesCliente, matriculaSeleccionada.id, tokenPago);

        mensajeEl.textContent = '¡Pago procesado con éxito!';
        mensajeEl.className = 'pago-mensaje exito'; // Usar estilo verde/exito si existe

        // Descargar recibo .txt
        // Obtenemos los datos actualizados combinados con los locales
        const itemExitoso = {
            id: matriculaSeleccionada.id,
            alumno: credencialesCliente.nombre,
            categoria: matriculaSeleccionada.categoria,
            montoMatricula: matriculaSeleccionada.montoMatricula,
            estado: 'CONFIRMADA',
            fechaRegistro: matriculaSeleccionada.fechaRegistro,
            referenciaPago: resultado.referenciaPago || resultado.referencia || 'REF-N/A'
        };

        descargarReciboTxt(itemExitoso);

        // Recargar datos y deseleccionar
        await cargarDatosCliente();
        deseleccionarMatricula();

    } catch (error) {
        mensajeEl.textContent = error.message || 'Error al procesar el pago.';
        mensajeEl.className = 'pago-mensaje error'; // Estilo rojo

        // Recargar para actualizar estado a RECHAZADA en la tabla si es necesario
        await cargarDatosCliente();
    } finally {
        btnPagar.disabled = false;
        btnPagar.textContent = 'Procesar pago';
    }
}

// TXT GENERATION
function descargarReciboTxt(item) {
    const fecha = formatearFecha(item.fechaRegistro);
    const monto = item.montoMatricula != null ? `S/ ${Number(item.montoMatricula).toFixed(2)}` : 'S/ -';
    const referencia = item.referenciaPago || 'N/A';

    const contenido = `=========================================
      ACADEMIA DE FÚTBOL "LOS CRACKS"
         COMPROBANTE DE PAGO EXITOSO
=========================================
Fecha de Pago:  ${formatearFecha(new Date())}
Fecha Matrícula:${fecha}
Matrícula ID:   ${item.id}
Alumno:         ${item.alumno || 'N/A'}
Categoría:      ${item.categoria || 'N/A'}
Monto Pagado:   ${monto}
Estado:         ${item.estado || 'CONFIRMADA'}
Referencia:     ${referencia}
=========================================
     ¡Gracias por su pago y preferencia!
=========================================
`;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibo_Pago_Matricula_${item.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

