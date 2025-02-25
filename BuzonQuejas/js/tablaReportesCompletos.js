document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");

    // 🔄 Cargar reportes completados desde localStorage
    let datosReportesCompletos = JSON.parse(localStorage.getItem("reportesCompletados")) || [];
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;
    let datosFiltradosCompletos = [...datosReportesCompletos];

    // ✅ Guardar cambios en localStorage
    function guardarReportesCompletados() {
        localStorage.setItem("reportesCompletados", JSON.stringify(datosReportesCompletos));
    }

    // 🔄 Función global para mover el reporte a la tabla de completados y guardarlo en localStorage
    window.moverReporteACompletados = function (reporte) {
        datosReportesCompletos.push(reporte); // Agregar el reporte al array
        guardarReportesCompletados(); // Guardar en localStorage
        filtrarReportesCompletos(); // Actualizar la tabla con los datos nuevos
    };

    // 🔎 Función para resaltar el texto filtrado
    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    // 📌 Función para mostrar reportes en la tabla de completados
    function mostrarReportesCompletos(pagina, reportes = datosFiltradosCompletos) {
        tablaCompletosBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = reportes.slice(inicio, fin);
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columnaSeleccionada = filterColumnCompleto.value;

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${columnaSeleccionada === "folio" ? resaltarTexto(reporte.folio, valorFiltro) : reporte.folio}</td>
                <td>${columnaSeleccionada === "nomina" ? resaltarTexto(reporte.nomina, valorFiltro) : reporte.nomina}</td>
                <td>${columnaSeleccionada === "encargado" ? resaltarTexto(reporte.encargado, valorFiltro) : reporte.encargado}</td>
                <td>${columnaSeleccionada === "fechaFinalizacion" ? resaltarTexto(reporte.fechaFinalizacion, valorFiltro) : reporte.fechaFinalizacion}</td>
                <td>${columnaSeleccionada === "estatus" ? resaltarTexto(reporte.estatus, valorFiltro) : reporte.estatus}</td>
                <button class="convertidor"><i class="fa-solid fa-file-excel"></i> Convertir</button>
            `;

            // 🔹 Agregar evento al botón "Convertir"
            let btnConvertir = fila.querySelector(".convertidor");
            btnConvertir.addEventListener("click", function () {
                alert(`Convertir reporte ${reporte.folio} - (Funcionalidad pendiente de implementar)`);
            });

            tablaCompletosBody.appendChild(fila);
        });

        // 📌 Actualizar paginación
        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= reportes.length;
    }

    // 📌 Función para filtrar reportes completados
    function filtrarReportesCompletos() {
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columna = filterColumnCompleto.value;

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            return reporte[columna].toLowerCase().includes(valorFiltro);
        });

        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);
    }

    // 📌 Eventos de paginación
    prevPageBtnCompleto.addEventListener("click", () => {
        paginaActualCompleto--;
        mostrarReportesCompletos(paginaActualCompleto);
    });

    nextPageBtnCompleto.addEventListener("click", () => {
        paginaActualCompleto++;
        mostrarReportesCompletos(paginaActualCompleto);
    });

    // 📌 Evento de filtrado
    filterInputCompleto.addEventListener("input", filtrarReportesCompletos);
    filterButtonCompleto.addEventListener("click", filtrarReportesCompletos);

    // 📌 Mostrar reportes completados al cargar la página
    mostrarReportesCompletos(paginaActualCompleto);
});
