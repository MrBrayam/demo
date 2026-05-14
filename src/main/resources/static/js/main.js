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
            option.textContent = `${cat.nombre} / Edad ${cat.edadMinima}-${cat.edadMaxima}`;
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
            document.getElementById('paso-2').classList.remove('disabled-panel');
            document.getElementById('arrow-1').classList.add('active');
            document.getElementById('btn-pagar').disabled = false;
        }
    });

    // Pagar (Paso 2 -> Paso 3)
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
            tokenPago: 'tok_test_simulado'  // En producción: token real de pasarela
        };

        try {
            const respuesta = await registrarMatricula(datos);
            matriculaIdConfirmada = respuesta.matriculaId;
            document.getElementById('referenciaConfirmacion').textContent = 'Ref: ' + respuesta.referenciaPago;
            
            // Habilitar panel 3
            document.getElementById('paso-3').classList.remove('disabled-panel');
            document.getElementById('arrow-2').classList.add('active');
            document.getElementById('btn-descargar').style.display = 'inline-flex';
            document.getElementById('placeholder-btn-descargar').style.display = 'none';
            
            document.getElementById('pagar-label').textContent = 'Pagado';
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

    actualizarMontoYBoton();
});

function actualizarMontoYBoton() {
    const select = document.getElementById('categoria');
    const cat = categorias.find(c => c.id == select.value);
    const montoTexto = cat ? `S/ ${cat.montoMatricula}` : 'S/ 150.00';
    document.getElementById('montoDisplay').textContent = montoTexto;
    document.getElementById('pagar-label').textContent = cat ? `Pagar ${montoTexto}` : 'Pagar S/ 150.00';
}
