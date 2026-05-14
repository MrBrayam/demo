let categorias = [];
let matriculaIdConfirmada = null;

document.addEventListener('DOMContentLoaded', async () => {

    // Cargar categorías al iniciar
    try {
        categorias = await obtenerCategorias();
        const select = document.getElementById('categoria');
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.nombre} (${cat.cuposDisponibles} cupos) — S/ ${cat.montoMatricula}`;
            select.appendChild(option);
        });
    } catch (error) {
        alert('Error al cargar categorías: ' + error.message);
    }

    // Actualizar monto al elegir categoría
    document.getElementById('categoria').addEventListener('change', actualizarMontoYBoton);

    // Mostrar campo tarjeta según método
    document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const campoTarjeta = document.getElementById('campo-tarjeta');
            campoTarjeta.style.display = this.value === 'TARJETA' ? 'block' : 'none';
        });
    });

    // Paso 1 -> Paso 2
    document.getElementById('btn-siguiente-1').addEventListener('click', () => {
        if (validarPaso1()) {
            mostrarPaso(2);
        }
    });

    // Paso 2 -> Paso 1
    document.getElementById('btn-atras-2').addEventListener('click', () => {
        mostrarPaso(1);
    });

    // Pagar
    document.getElementById('btn-pagar').addEventListener('click', async () => {
        if (!validarPaso2()) return;

        const boton = document.getElementById('btn-pagar');
        const pagarLabel = document.getElementById('pagar-label');
        boton.disabled = true;
        pagarLabel.textContent = 'Procesando...';

        const datos = {
            nombreCompleto: document.getElementById('nombre').value.trim(),
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            dni: document.getElementById('dni').value.trim(),
            correoTutor: document.getElementById('correoTutor').value.trim(),
            categoriaId: parseInt(document.getElementById('categoria').value),
            metodoPago: document.querySelector('input[name="metodoPago"]:checked').value,
            tokenPago: 'tok_test_simulado'  // En producción: token real de pasarela
        };

        try {
            const respuesta = await registrarMatricula(datos);
            matriculaIdConfirmada = respuesta.matriculaId;
            document.getElementById('referenciaConfirmacion').textContent =
                'Referencia de pago: ' + respuesta.referenciaPago;
            mostrarPaso(3);
        } catch (error) {
            alert(error.message);
            boton.disabled = false;
            actualizarMontoYBoton();
        }
    });

    // Descargar constancia
    document.getElementById('btn-descargar').addEventListener('click', async () => {
        try {
            await descargarConstancia(matriculaIdConfirmada);
        } catch (error) {
            alert(error.message);
        }
    });

    // Reiniciar formulario
    document.getElementById('btn-reiniciar').addEventListener('click', () => {
        location.reload();
    });
    actualizarMontoYBoton();
});

function actualizarMontoYBoton() {
    const select = document.getElementById('categoria');
    const cat = categorias.find(c => c.id == select.value);
    const montoTexto = cat ? `S/ ${cat.montoMatricula}` : 'S/ —';
    document.getElementById('montoDisplay').textContent = montoTexto;
    document.getElementById('pagar-label').textContent = cat ? `Pagar ${montoTexto}` : 'Pagar S/ —';
}

function mostrarPaso(numero) {
    [1, 2, 3].forEach(n => {
        document.getElementById(`paso-${n}`).classList.toggle('oculto', n !== numero);
        const step = document.getElementById(`step-${n}`);
        if (step) {
            step.classList.toggle('activo', n === numero);
            step.classList.toggle('completo', n < numero);
        }
    });

    const line1 = document.getElementById('line-1');
    const line2 = document.getElementById('line-2');
    if (line1) line1.classList.toggle('activo', numero > 1);
    if (line2) line2.classList.toggle('activo', numero > 2);
}
