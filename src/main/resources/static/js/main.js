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
    document.getElementById('categoria').addEventListener('change', function () {
        const cat = categorias.find(c => c.id == this.value);
        document.getElementById('montoDisplay').textContent = cat ? `S/ ${cat.montoMatricula}` : 'S/ —';
    });

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
        boton.disabled = true;
        boton.textContent = 'Procesando...';

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
            boton.textContent = 'Pagar';
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
});

function mostrarPaso(numero) {
    [1, 2, 3].forEach(n => {
        document.getElementById(`paso-${n}`).classList.toggle('oculto', n !== numero);
        const indicador = document.getElementById(`indicador-${n}`);
        indicador.classList.toggle('activo', n === numero);
    });
}
