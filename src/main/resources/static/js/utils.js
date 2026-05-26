function formatearFecha(fechaStr) {
    if (!fechaStr) return '-';
    const fecha = fechaStr instanceof Date ? fechaStr : new Date(fechaStr);
    if (Number.isNaN(fecha.getTime())) return String(fechaStr);
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
    return `estado-${String(estado).toLowerCase().replace(/_/g, '-')}`;
}
