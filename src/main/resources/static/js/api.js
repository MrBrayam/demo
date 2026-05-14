// URL base del backend Spring Boot
const API_BASE = 'http://localhost:8080/api';

/**
 * Obtiene las categorías disponibles con sus cupos y montos.
 * Endpoint: GET /api/matriculas/categorias
 */
async function obtenerCategorias() {
    const response = await fetch(`${API_BASE}/matriculas/categorias`);
    if (!response.ok) {
        throw new Error('No se pudieron cargar las categorías.');
    }
    return response.json();
}

/**
 * Envía el formulario completo al backend para registrar la matrícula.
 * Endpoint: POST /api/matriculas
 */
async function registrarMatricula(datos) {
    const response = await fetch(`${API_BASE}/matriculas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (response.status === 409) {
        const mensaje = await response.text();
        throw new Error(mensaje);   // Sin cupos
    }

    if (response.status === 402) {
        const mensaje = await response.text();
        throw new Error(mensaje);   // Pago rechazado
    }

    if (!response.ok) {
        throw new Error('Error al procesar la matrícula. Intente nuevamente.');
    }

    return response.json();
}

/**
 * Descarga la constancia de una matrícula confirmada en formato TXT.
 * Endpoint: GET /api/matriculas/{id}/constancia
 */
async function descargarConstancia(matriculaId) {
    const response = await fetch(`${API_BASE}/matriculas/${matriculaId}/constancia`);
    if (!response.ok) {
        throw new Error('No se pudo descargar la constancia.');
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `constancia_${matriculaId}.txt`;
    enlace.click();
    URL.revokeObjectURL(url);
}

/**
 * Verifica si el alumno existe y si no, lo crea (Paso 1).
 * Endpoint: POST /api/matriculas/verificar-alumno
 */
async function verificarAlumno(datos) {
    const response = await fetch(`${API_BASE}/matriculas/verificar-alumno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        throw new Error('Error al verificar o crear el alumno. Comprueba los datos.');
    }
}
