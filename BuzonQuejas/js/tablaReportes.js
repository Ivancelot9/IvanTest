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
                console.log("📌 Datos obtenidos:", data);
                datosReportes = data;
                datosFiltrados = [...datosReportes];
                mostrarReportes(paginaActual);
            })
            .catch(error => console.error("❌ Error al cargar reportes:", error));
    }

    // 🔹 Mostrar reportes con paginación
    function mostrarReportes(pagina) {
        tablaBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltrados.slice(inicio, fin);
        const valorFiltro = filterInput.value.toLowerCase();
        const columnaSeleccionada = filterColumn.value;

        reportesPagina.forEach(reporte => {
            let encargadoTexto = reporte.Encargado ? reporte.Encargado : "N/A";

            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${columnaSeleccionada === "FolioReportes" ? resaltarTexto(reporte.FolioReportes, valorFiltro) : reporte.FolioReportes}</td>
                <td>${columnaSeleccionada === "FechaRegistro" ? resaltarTexto(reporte.FechaRegistro, valorFiltro) : reporte.FechaRegistro}</td>
                <td>${columnaSeleccionada === "NumeroNomina" ? resaltarTexto(reporte.NumeroNomina, valorFiltro) : reporte.NumeroNomina}</td>
                <td>${columnaSeleccionada === "Area" ? resaltarTexto(reporte.Area, valorFiltro) : reporte.Area}</td> <!-- 🔹 Nueva celda para Área -->
                <td>${columnaSeleccionada === "Encargado" ? resaltarTexto(encargadoTexto, valorFiltro) : encargadoTexto}</td>
                <td><button class="mostrar-descripcion" data-descripcion="${reporte.Descripcion}">Mostrar Descripción</button></td>
                <td><button class="agregar-comentario" data-folio="${reporte.FolioReportes}">Agregar Comentario</button></td>
                <td class="estatus-cell"><strong>${columnaSeleccionada === "NombreEstatus" ? resaltarTexto(reporte.NombreEstatus, valorFiltro) : reporte.NombreEstatus}</strong></td>
                <td><button class="seleccionar-fecha" data-folio="${reporte.FolioReportes}">Finalizar Reporte</button></td>
            `;
            tablaBody.appendChild(fila);
        });

        pageIndicator.textContent = `Página ${pagina}`;
        prevPageBtn.disabled = pagina === 1;
        nextPageBtn.disabled = fin >= datosFiltrados.length;
    }

    // 🔹 Filtrar reportes
    function filtrarReportes() {
        const valorFiltro = filterInput.value.toLowerCase();
        const columna = filterColumn.value;

        datosFiltrados = datosReportes.filter(reporte => {
            return String(reporte[columna]).toLowerCase().includes(valorFiltro);
        });

        paginaActual = 1;
        mostrarReportes(paginaActual);
    }

    // ✅ Mover reporte a reportes completados
    window.moverReporteACompletados = function (folio, fechaFinalizacion) {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/finalizarReporte.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ FolioReportes: folio, FechaFinalizada: fechaFinalizacion })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert("Reporte finalizado correctamente.");
                    cargarReportes(); // 🔄 Recargar la lista después de finalizar un reporte
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => console.error("❌ Error al finalizar el reporte:", error));
    };

    // 🔹 Eventos para paginación
    prevPageBtn.addEventListener("click", () => {
        paginaActual--;
        mostrarReportes(paginaActual);
    });

    nextPageBtn.addEventListener("click", () => {
        paginaActual++;
        mostrarReportes(paginaActual);
    });

    filterInput.addEventListener("input", filtrarReportes);
    filterButton.addEventListener("click", filtrarReportes);

    // 🔹 Cargar los reportes al iniciar
    cargarReportes();
});
