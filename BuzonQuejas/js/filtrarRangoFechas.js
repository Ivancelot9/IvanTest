document.addEventListener("DOMContentLoaded", function () {
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const filterDateButton = document.getElementById("filter-date-button");
    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");

    let datosReportesCompletos = JSON.parse(localStorage.getItem("reportesCompletos")) || [];
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;
    let datosFiltradosCompletos = [...datosReportesCompletos];

    // 📌 Bloquear la escritura manual en los inputs de fecha
    startDateInput.setAttribute("onkeydown", "return false;");
    endDateInput.setAttribute("onkeydown", "return false;");

    // 📌 Mostrar reportes en la tabla con animación
    function mostrarReportesCompletos(pagina, reportes = datosFiltradosCompletos) {
        tablaCompletosBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = reportes.slice(inicio, fin);

        if (reportesPagina.length === 0) {
            tablaCompletosBody.innerHTML = `
                <tr><td colspan="6" style="color: red; font-weight: bold;">❌ No hay reportes en este rango de fechas.</td></tr>`;
            return;
        }

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");
            fila.classList.add("fade-in"); // Aplica la animación de entradaaa

            fila.innerHTML = `
                <td>${reporte.folio}</td>
                <td>${reporte.nomina}</td>
                <td>${reporte.encargado}</td>
                <td class="fecha-finalizacion">${reporte.fechaFinalizacion}</td>
                <td>${reporte.estatus}</td>
                <td><button class="convertidor"><i class="fas fa-file-excel"></i> Convertir a Excel</button></td>
            `;

            tablaCompletosBody.appendChild(fila);

            // 🟡 Resaltar filas filtradas por 1.5 segundos
            fila.classList.add("highlighted");
            setTimeout(() => {
                fila.classList.remove("highlighted");
            }, 1500);
        });

        // 📌 Actualizar paginación
        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= reportes.length;
    }

    // 📅 Filtrar reportes por rango de fechas
    function filtrarPorRango() {
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            const fechaReporte = new Date(reporte.fechaFinalizacion.split('/').reverse().join('-')); // Convierte dd/mm/yyyy a yyyy-mm-dd

            if (startDate && endDate) {
                return fechaReporte >= startDate && fechaReporte <= endDate;
            } else if (startDate) {
                return fechaReporte >= startDate;
            } else if (endDate) {
                return fechaReporte <= endDate;
            }
            return true;
        });

        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);
    }

    // 📅 Evento para filtrar por rango de fechas
    filterDateButton.addEventListener("click", filtrarPorRango);

    // 📌 Cargar reportes al inicio
    mostrarReportesCompletos(paginaActualCompleto);
});
