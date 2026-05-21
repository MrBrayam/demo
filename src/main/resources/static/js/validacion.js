function validarPaso1() {
    let valido = true;

    const nombre = document.getElementById('nombre').value.trim();
    if (nombre.length < 3) {
        mostrarError('error-nombre', 'El nombre debe tener al menos 3 caracteres.');
        valido = false;
    } else {
        limpiarError('error-nombre');
    }

    const fecha = document.getElementById('fechaNacimiento').value;
    if (!fecha) {
        mostrarError('error-fecha', 'La fecha de nacimiento es obligatoria.');
        valido = false;
    } else {
        limpiarError('error-fecha');
    }

    const dni = document.getElementById('dni').value.trim();
    if (!/^\d{8}$/.test(dni)) {
        mostrarError('error-dni', 'El DNI debe contener exactamente 8 dígitos.');
        valido = false;
    } else {
        limpiarError('error-dni');
    }

    const correo = document.getElementById('correoTutor').value.trim();
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
        mostrarError('error-correo', 'Ingrese un correo electrónico válido.');
        valido = false;
    } else {
        limpiarError('error-correo');
    }

    const contrasena = document.getElementById('contrasena').value.trim();
    if (contrasena.length < 4) {
        mostrarError('error-contrasena', 'La contrasena debe tener al menos 4 caracteres.');
        valido = false;
    } else {
        limpiarError('error-contrasena');
    }

    return valido;
}

function validarPaso2() {
    let valido = true;

    const categoriaId = document.getElementById('categoria').value;
    if (!categoriaId) {
        mostrarError('error-categoria', 'Seleccione una categoría.');
        valido = false;
    } else {
        limpiarError('error-categoria');
    }

    const metodo = document.querySelector('input[name="metodoPago"]:checked');
    if (!metodo) {
        mostrarError('error-metodo', 'Seleccione un método de pago.');
        valido = false;
    } else {
        limpiarError('error-metodo');
        if (metodo.value === 'TARJETA') {
            const numero = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
            if (numero.length < 13) {
                mostrarError('error-tarjeta', 'Ingrese un número de tarjeta válido.');
                valido = false;
            } else {
                limpiarError('error-tarjeta');
            }
        }
    }

    return valido;
}

function mostrarError(idElemento, mensaje) {
    const el = document.getElementById(idElemento);
    if (el) el.textContent = mensaje;
}

function limpiarError(idElemento) {
    const el = document.getElementById(idElemento);
    if (el) el.textContent = '';
}
