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

    // 📌 Función para mostrar reportes en la tabla de completados
    function mostrarReportesCompletos(pagina, reportes = datosFiltradosCompletos) {
        tablaCompletosBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = reportes.slice(inicio, fin);

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${reporte.folio}</td>
                <td>${reporte.nomina}</td>
                <td>${reporte.encargado}</td>
                <td>${reporte.fechaFinalizacion}</td>
                <td>${reporte.estatus}</td>
                <td><button class="convertidor"><i class="fas fa-file-excel"></i> Convertir a Excel</button></td>
            `;

            let btnConvertir = fila.querySelector(".convertidor");
            btnConvertir.addEventListener("click", function () {
                exportarExcel(reporte);
            });

            tablaCompletosBody.appendChild(fila);
        });

        // 📌 Actualizar paginación
        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= reportes.length;
    }

    // 📅 Función para filtrar reportes por rango de fechas
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
