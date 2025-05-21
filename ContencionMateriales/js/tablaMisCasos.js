/**
 * Script reutilizable para paginar y filtrar una tabla de casos.
 * Uso:
 *   inicializarTablaCasos('#historial');
 *   inicializarTablaCasos('#historial-casos');
 */
function inicializarTablaCasos(idContenedor) {
    const filasPorPagina = 5;
    let paginaActual = 1;

    const contenedor = document.querySelector(idContenedor);
    if (!contenedor) return;

    const cuerpoTabla      = contenedor.querySelector('.cases-table tbody');
    const todasFilas       = Array.from(cuerpoTabla.querySelectorAll('tr'));
    const botonAnterior    = contenedor.querySelector('button[id$="-prev"]');
    const botonSiguiente   = contenedor.querySelector('button[id$="-next"]');
    const indicadorPagina  = contenedor.querySelector('span[id$="-page-indicator"]');
    const selectorFiltro   = contenedor.querySelector('select[id$="-filter-column"]');
    const entradaFiltro    = contenedor.querySelector('input[id$="-filter-input"]');

    function escapeRegExp(texto) {
        return texto.replace(/[.*+?^${}()|[\\\]\\]/g, '\\$&');
    }

    function resaltarTexto(texto, termino) {
        if (!termino) return texto;
        const regex = new RegExp(`(${escapeRegExp(termino)})`, 'gi');
        return texto.replace(regex, '<mark>$1</mark>');
    }

    function obtenerFilasFiltradas() {
        const termino = entradaFiltro.value.trim().toLowerCase();
        const indice  = selectorFiltro.value === 'folio' ? 0 : 1;
        return todasFilas.filter(fila => {
            return fila.cells[indice].textContent
                .trim().toLowerCase()
                .includes(termino);
        });
    }

    function renderizarPagina() {
        const filtradas    = obtenerFilasFiltradas();
        const totalPaginas = Math.max(1, Math.ceil(filtradas.length / filasPorPagina));
        if (paginaActual > totalPaginas) paginaActual = totalPaginas;

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin    = inicio + filasPorPagina;
        const termino = entradaFiltro.value.trim();
        const indice  = selectorFiltro.value === 'folio' ? 0 : 1;

        cuerpoTabla.innerHTML = '';
        filtradas
            .slice(inicio, fin)
            .forEach(fila => {
                const clon = fila.cloneNode(true);
                const celda = clon.cells[indice];
                celda.innerHTML = resaltarTexto(celda.textContent, termino);
                cuerpoTabla.appendChild(clon);
            });

        botonAnterior.disabled  = paginaActual === 1;
        botonSiguiente.disabled = paginaActual === totalPaginas;
        indicadorPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    }

    // Eventos
    entradaFiltro.addEventListener('input', () => { paginaActual = 1; renderizarPagina(); });
    selectorFiltro.addEventListener('change', () => { paginaActual = 1; renderizarPagina(); });
    botonAnterior.addEventListener('click', () => { if (paginaActual>1) { paginaActual--; renderizarPagina(); }});
    botonSiguiente.addEventListener('click', () => { paginaActual++; renderizarPagina(); });

    // Render inicial
    renderizarPagina();
}

// ——— Llamadas de inicialización ———
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablaCasos('#historial');
    inicializarTablaCasos('#historial-casos');
});
