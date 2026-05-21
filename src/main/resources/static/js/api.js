const API_BASE = 'http://localhost:8080/api';

async function obtenerCategorias() {
    const response = await fetch(`${API_BASE}/matriculas/categorias`);
    if (!response.ok) {
        throw new Error('No se pudieron cargar las categorías.');
    }
    return response.json();
}

async function obtenerTransaccionesRecientes(limit = 5) {
    const response = await fetch(`${API_BASE}/matriculas/recientes?limit=${limit}`);
    if (!response.ok) {
        throw new Error('No se pudieron cargar las transacciones recientes.');
    }
    return response.json();
}

async function loginUsuario(datos) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    const data = await response.json().catch(() => ({
        success: false,
        mensaje: 'Error al leer la respuesta del servidor'
    }));

    return data;
}

async function registrarMatricula(datos) {
    const response = await fetch(`${API_BASE}/matriculas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (response.status === 409) {
        const mensaje = await response.text();
        throw new Error(mensaje);   
    }

    if (response.status === 402) {
        const mensaje = await response.text();
        throw new Error(mensaje);  
    }

    if (!response.ok) {
        throw new Error('Error al procesar la matrícula. Intente nuevamente.');
    }

    return response.json();
}

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

/*Verifica si el alumno existe y si no, lo crea*/
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
