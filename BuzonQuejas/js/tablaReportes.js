document.addEventListener("DOMContentLoaded", function () {
    const filasPorPagina = 10;
    let paginaActual = 1;
    let datosReportes = [];
    let datosFiltrados = [];

    // ✅ Elementos del DOM
    const tablaBody = document.getElementById("tabla-body");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const filterColumn = document.getElementById("filter-column");
    const filterInput = document.getElementById("filter-input");
    const filterButton = document.getElementById("filter-button");

    // 🔹 Correlación entre los valores del SELECT y los campos de la BD
    const columnasBD = {
        folio: "FolioReportes",
        nomina: "NumeroNomina",
        encargado: "Encargado",
        fechaRegistro: "FechaRegistro"
    };

    // 🔹 Función para resaltar texto en la búsqueda
    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    // 🔹 Cargar reportes desde la base de datos
    function cargarReportes() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerReportesPendientes.php")
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    console.warn("⚠ No hay reportes disponibles.");
                    return;
                }
                datosReportes = data;
                datosFiltrados = [...datosReportes]; // Copia para filtrado sin modificar datos originales
                mostrarReportes(paginaActual);
            })
            .catch(error => console.error("❌ Error al cargar reportes:", error));
    }

    function mostrarReportes(pagina) {
        tablaBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltrados.slice(inicio, fin);

        reportesPagina.forEach(reporte => {
            let encargadoTexto = reporte.Encargado ? reporte.Encargado : "N/A";

            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${resaltarTexto(reporte.FolioReportes, filterInput.value)}</td>
                <td>${resaltarTexto(reporte.FechaRegistro, filterInput.value)}</td>
                <td>${resaltarTexto(reporte.NumeroNomina, filterInput.value)}</td>
                <td>${resaltarTexto(reporte.Area, filterInput.value)}</td>
                <td>${resaltarTexto(encargadoTexto, filterInput.value)}</td>
                <td><button class="mostrar-descripcion" data-descripcion="${reporte.Descripcion}">Mostrar Descripción</button></td>
                <td><button class="agregar-comentario" data-folio="${reporte.FolioReportes}">Agregar Comentario</button></td>
                <td class="estatus-cell">
                    <button class="ver-estatus-btn" data-folio="${reporte.FolioReportes}">
                        Ver Estatus
                    </button>
                </td>
                <td><button class="seleccionar-fecha" data-folio="${reporte.FolioReportes}">Finalizar Reporte</button></td>
            `;

            tablaBody.appendChild(fila);
        });

        pageIndicator.textContent = `Página ${pagina}`;
        prevPageBtn.disabled = pagina === 1;
        nextPageBtn.disabled = fin >= datosFiltrados.length;
    }

    // 🔹 Filtrar reportes en tiempo real
    function filtrarReportes() {
        const valorFiltro = filterInput.value.trim().toLowerCase();
        const columnaSeleccionada = filterColumn.value;

        if (!columnaSeleccionada) {
            console.warn("⚠ No se ha seleccionado una columna para filtrar.");
            return;
        }

        const columnaBD = columnasBD[columnaSeleccionada];

        if (!columnaBD) {
            console.warn("⚠ No se encontró la columna en la base de datos.");
            return;
        }

        datosFiltrados = datosReportes.filter(reporte => {
            let valor = reporte[columnaBD] ? String(reporte[columnaBD]).toLowerCase() : "";
            return valor.includes(valorFiltro);
        });

        paginaActual = 1;
        mostrarReportes(paginaActual);
    }

    // 🔹 Eventos para paginación
    prevPageBtn.addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarReportes(paginaActual);
        }
    });

    nextPageBtn.addEventListener("click", () => {
        if ((paginaActual * filasPorPagina) < datosFiltrados.length) {
            paginaActual++;
            mostrarReportes(paginaActual);
        }
    });

    // 🔹 Evento para búsqueda en tiempo real con cada letra ingresada
    filterInput.addEventListener("input", filtrarReportes);
    filterButton.addEventListener("click", filtrarReportes);

    // 🔹 Cargar los reportes al iniciar
    cargarReportes();
});
