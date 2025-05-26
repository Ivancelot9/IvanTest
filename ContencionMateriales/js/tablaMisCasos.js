/**
 * Script reutilizable para paginar y filtrar una tabla de casos.
 * Ahora recalcula las filas cada vez que renderiza para
 * incluir dinámicamente las nuevas inserciones.
 *
 * Uso:
 *   inicializarTablaCasos('#historial');
 *   inicializarTablaCasos('#historial-casos');
 */
function inicializarTablaCasos(idContenedor) {
    const filasPorPagina = 5;
    let paginaActual = 1;
    const contenedor = document.querySelector(idContenedor);
    if (!contenedor) return;

    // Controles fijos
    const botonAnterior  = contenedor.querySelector('button[id$="-prev"]');
    const botonSiguiente = contenedor.querySelector('button[id$="-next"]');
    const indicadorPagina= contenedor.querySelector('span[id$="-page-indicator"]');
    const selectorFiltro = contenedor.querySelector('select[id$="-filter-column"]');
    const entradaFiltro  = contenedor.querySelector('input[id$="-filter-input"]');
    const cuerpoTabla    = contenedor.querySelector('.cases-table tbody');

    // Escapa texto para regex
    function escapeRegExp(texto) {
        return texto.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&');
    }

    // Resalta coincidencias
    function resaltarTexto(texto, termino) {
        if (!termino) return texto;
        const regex = new RegExp(`(${escapeRegExp(termino)})`, 'gi');
        return texto.replace(regex, '<mark>$1</mark>');
    }

    // Obtiene *siempre* el array completo de filas del DOM
    function obtenerTodasFilas() {
        return Array.from(cuerpoTabla.querySelectorAll('tr'));
    }

    // Filtra sobre el array actual
    function obtenerFilasFiltradas() {
        const termino = entradaFiltro.value.trim().toLowerCase();
        const indice  = selectorFiltro.value === 'folio' ? 0 : 1;
        return obtenerTodasFilas().filter(fila =>
            fila.cells[indice].textContent.trim().toLowerCase().includes(termino)
        );
    }

    // Renderiza la página actual
    function renderizarPagina() {
        const filtradas    = obtenerFilasFiltradas();
        const totalPaginas = Math.max(1, Math.ceil(filtradas.length / filasPorPagina));
        if (paginaActual > totalPaginas) paginaActual = totalPaginas;

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin    = inicio + filasPorPagina;
        const termino = entradaFiltro.value.trim();

        // Limpia y muestra sólo el slice correspondiente
        cuerpoTabla.innerHTML = '';
        filtradas.slice(inicio, fin).forEach(fila => {
            const clon = fila.cloneNode(true);
            const celda = clon.cells[ selectorFiltro.value === 'folio' ? 0 : 1 ];
            celda.innerHTML = resaltarTexto(celda.textContent, termino);
            cuerpoTabla.appendChild(clon);
        });

        // Actualiza controles
        botonAnterior.disabled  = paginaActual === 1;
        botonSiguiente.disabled = paginaActual === totalPaginas;
        indicadorPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    }

    // Eventos
    entradaFiltro.addEventListener('input', () => { paginaActual = 1; renderizarPagina(); });
    selectorFiltro.addEventListener('change', () => { paginaActual = 1; renderizarPagina(); });
    botonAnterior.addEventListener('click', () => { if (paginaActual > 1) { paginaActual--; renderizarPagina(); } });
    botonSiguiente.addEventListener('click', () => { paginaActual++; renderizarPagina(); });

    // Primer render
    renderizarPagina();
}

// ——— Llamadas de inicialización ———
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
