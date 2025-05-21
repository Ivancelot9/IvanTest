document.addEventListener('DOMContentLoaded', () => {
    const filasPorPagina = 5;
    let paginaActual = 1;

    const seccionHistorial = document.getElementById('historial');
    const cuerpoTabla = seccionHistorial.querySelector('.cases-table tbody');
    const todasFilas = Array.from(cuerpoTabla.querySelectorAll('tr'));

    const botonAnterior = document.getElementById('hist-prev');
    const botonSiguiente = document.getElementById('hist-next');
    const indicadorPagina = document.getElementById('hist-page-indicator');

    const selectorFiltro = document.getElementById('historial-filter-column');
    const entradaFiltro = document.getElementById('historial-filter-input');

    // Escapa caracteres especiales para la expresión regular
    function escapeRegExp(texto) {
        return texto.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    }

    // Resalta el término buscado dentro del texto con <mark>
    function resaltarTexto(texto, termino) {
        if (!termino) return texto;
        const regex = new RegExp(`(${escapeRegExp(termino)})`, 'gi');
        return texto.replace(regex, '<mark>$1</mark>');
    }

    // Filtra filas según input y columna seleccionada
    function obtenerFilasFiltradas() {
        const termino = entradaFiltro.value.trim().toLowerCase();
        const indice = selectorFiltro.value === 'folio' ? 0 : 1;
        return todasFilas.filter(fila => {
            const contenido = fila.cells[indice].textContent.trim().toLowerCase();
            return contenido.includes(termino);
        });
    }

    // Renderiza las filas de la página actual con resaltado
    function renderizarPagina() {
        const filasFiltradas = obtenerFilasFiltradas();
        const totalPaginas = Math.max(1, Math.ceil(filasFiltradas.length / filasPorPagina));
        if (paginaActual > totalPaginas) paginaActual = totalPaginas;

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const indice = selectorFiltro.value === 'folio' ? 0 : 1;
        const termino = entradaFiltro.value.trim();

        cuerpoTabla.innerHTML = '';
        filasFiltradas.slice(inicio, fin).forEach(fila => {
            const nuevaFila = fila.cloneNode(true);
            // Resalta el contenido en la celda filtrada
            const celda = nuevaFila.cells[indice];
            celda.innerHTML = resaltarTexto(celda.textContent, termino);
            cuerpoTabla.appendChild(nuevaFila);
        });

        botonAnterior.disabled = paginaActual === 1;
        botonSiguiente.disabled = paginaActual === totalPaginas;
        indicadorPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    }

    // Eventos
    entradaFiltro.addEventListener('input', () => {
        paginaActual = 1;
        renderizarPagina();
    });
    selectorFiltro.addEventListener('change', () => {
        paginaActual = 1;
        renderizarPagina();
    });
    botonAnterior.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarPagina();
        }
    });
    botonSiguiente.addEventListener('click', () => {
        paginaActual++;
        renderizarPagina();
    });

    // Inicializa
    renderizarPagina();
});
