const hostname = window.location.hostname || 'localhost';
const API_BASE = `http://${hostname}:8080/api`;

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

async function actualizarEstadoMatricula(id, estado) {
    const response = await fetch(`${API_BASE}/matriculas/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
    });

    if (!response.ok) {
        throw new Error('No se pudo actualizar el estado.');
    }
    return response.json();
}

async function actualizarCategoriaMatricula(id, categoriaId) {
    const response = await fetch(`${API_BASE}/matriculas/${id}/categoria`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoriaId })
    });

    if (!response.ok) {
        throw new Error('No se pudo cambiar la categoria.');
    }
    return response.json();
}

async function obtenerReporteMensual(anio, mes) {
    const response = await fetch(`${API_BASE}/matriculas/reporte-mensual?anio=${anio}&mes=${mes}`);
    if (!response.ok) {
        throw new Error('No se pudo generar el reporte mensual.');
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

async function loginCliente(datos) {
    const response = await fetch(`${API_BASE}/cliente/login`, {
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

async function obtenerHistorialCliente(credenciales) {
    const response = await fetch(`${API_BASE}/cliente/matriculas`, {
        headers: {
            'X-Cliente-Dni': credenciales.dni,
            'X-Cliente-Pass': credenciales.contrasena
        }
    });

    if (!response.ok) {
        throw new Error('No se pudo cargar el historial.');
    }
    return response.json();
}

async function pagarMatriculaCliente(credenciales, id, tokenPago) {
    const response = await fetch(`${API_BASE}/cliente/matriculas/${id}/pagar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Cliente-Dni': credenciales.dni,
            'X-Cliente-Pass': credenciales.contrasena
        },
        body: JSON.stringify({ tokenPago })
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'No se pudo procesar el pago.');
    }
    return response.json();
}

async function obtenerMatriculasAdmin(credenciales, estado = '') {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    const response = await fetch(`${API_BASE}/admin/matriculas${query}`, {
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });

    if (!response.ok) {
        throw new Error('No se pudieron cargar las matriculas.');
    }
    return response.json();
}

async function actualizarEstadoAdmin(credenciales, id, estado) {
    const response = await fetch(`${API_BASE}/admin/matriculas/${id}/estado`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        },
        body: JSON.stringify({ estado })
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'No se pudo actualizar el estado.');
    }
    return response.json();
}

async function crearMatriculaAdmin(credenciales, datos) {
    const response = await fetch(`${API_BASE}/admin/matriculas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        },
        body: JSON.stringify(datos)
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'No se pudo crear la matricula.');
    }
    return response.json();
}

async function actualizarCategoriaAdmin(credenciales, id, categoriaId) {
    const response = await fetch(`${API_BASE}/admin/matriculas/${id}/categoria`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        },
        body: JSON.stringify({ categoriaId })
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'No se pudo cambiar la categoria.');
    }
    return response.json();
}

async function eliminarMatriculaAdmin(credenciales, id) {
    const response = await fetch(`${API_BASE}/admin/matriculas/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });

    if (!response.ok && response.status !== 204) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'No se pudo eliminar la matricula.');
    }
}

async function obtenerReporteMensualAdmin(credenciales, anio, mes) {
    const response = await fetch(`${API_BASE}/admin/reporte-mensual?anio=${anio}&mes=${mes}` , {
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'No se pudo generar el reporte.');
    }
    return response.json();
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
    window.open(url, '_blank');
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

// --- CRUD ALUMNOS ---
async function obtenerAlumnosAdmin(credenciales) {
    const response = await fetch(`${API_BASE}/admin/alumnos`, {
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });
    if (!response.ok) throw new Error('No se pudieron cargar los alumnos.');
    return response.json();
}

async function guardarAlumnoAdmin(credenciales, datos, id) {
    const url = id ? `${API_BASE}/admin/alumnos/${id}` : `${API_BASE}/admin/alumnos`;
    const method = id ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        },
        body: JSON.stringify(datos)
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar el alumno.');
    }
    return response.json();
}

async function eliminarAlumnoAdmin(credenciales, id) {
    const response = await fetch(`${API_BASE}/admin/alumnos/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });
    if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar el alumno.');
    }
}

// --- CRUD CATEGORIAS ---
async function obtenerCategoriasAdmin(credenciales) {
    const response = await fetch(`${API_BASE}/admin/categorias`, {
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });
    if (!response.ok) throw new Error('No se pudieron cargar las categorías.');
    return response.json();
}

async function guardarCategoriaAdmin(credenciales, datos, id) {
    const url = id ? `${API_BASE}/admin/categorias/${id}` : `${API_BASE}/admin/categorias`;
    const method = id ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        },
        body: JSON.stringify(datos)
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar la categoría.');
    }
    return response.json();
}

async function eliminarCategoriaAdmin(credenciales, id) {
    const response = await fetch(`${API_BASE}/admin/categorias/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });
    if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar la categoría.');
    }
}

// --- CRUD USUARIOS ---
async function obtenerUsuariosAdmin(credenciales) {
    const response = await fetch(`${API_BASE}/admin/usuarios`, {
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });
    if (!response.ok) throw new Error('No se pudieron cargar los usuarios.');
    return response.json();
}

async function guardarUsuarioAdmin(credenciales, datos, id) {
    const url = id ? `${API_BASE}/admin/usuarios/${id}` : `${API_BASE}/admin/usuarios`;
    const method = id ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        },
        body: JSON.stringify(datos)
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al guardar el usuario.');
    }
    return response.json();
}

async function eliminarUsuarioAdmin(credenciales, id) {
    const response = await fetch(`${API_BASE}/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
            'X-Admin-User': credenciales.username,
            'X-Admin-Pass': credenciales.password
        }
    });
    if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar el usuario.');
    }
}
