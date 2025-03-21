document.addEventListener("DOMContentLoaded", function () {
    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");

    let datosReportesCompletos = [];
    let datosFiltradosCompletos = [];
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;

    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    function cargarReportesCompletos() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/conseguirReportesCompletos.php")
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("❌ Respuesta inesperada:", data);
                    return;
                }

                // Filtrar solo reportes con fecha válida
                datosReportesCompletos = data.filter(rep =>
                    rep.fechaFinalizacion && rep.fechaFinalizacion !== "0000-00-00 00:00:00"
                );
                datosFiltradosCompletos = [...datosReportesCompletos];
                mostrarReportesCompletos(paginaActualCompleto);
            })
            .catch(err => {
                console.error("❌ Error al cargar reportes completados:", err);
            });
    }

    function mostrarReportesCompletos(pagina) {
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltradosCompletos.slice(inicio, fin);
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columna = filterColumnCompleto.value;

        tablaCompletosBody.innerHTML = "";

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${columna === "folio" ? resaltarTexto(reporte.folio, valorFiltro) : reporte.folio}</td>
                <td>${columna === "nomina" ? resaltarTexto(reporte.nomina, valorFiltro) : reporte.nomina}</td>
                <td>${columna === "encargado" ? resaltarTexto(reporte.encargado, valorFiltro) : reporte.encargado}</td>
                <td>${columna === "fechaFinalizacion" ? resaltarTexto(reporte.fechaFinalizacion, valorFiltro) : reporte.fechaFinalizacion}</td>
                <td>${columna === "estatus" ? resaltarTexto(reporte.estatus, valorFiltro) : reporte.estatus}</td>
            `;

            let boton = document.createElement("button");
            boton.classList.add("convertidor");
            boton.setAttribute("data-folio", reporte.folio);
            boton.innerHTML = `<i class="fas fa-file-excel"></i> Convertir a Excel`;

            let celdaBoton = document.createElement("td");
            celdaBoton.appendChild(boton);
            fila.appendChild(celdaBoton);

            tablaCompletosBody.appendChild(fila);
        });

        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= datosFiltradosCompletos.length;
    }

    function filtrarReportesCompletos() {
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columna = filterColumnCompleto.value;

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            const valor = (reporte[columna] || "").toString().toLowerCase();
            return valor.includes(valorFiltro);
        });

        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);
    }

    function exportarExcel(reporte) {
        let wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Reporte Completado",
            Subject: "Exportación Individual",
            Author: "Sistema",
            CreatedDate: new Date()
        };

        wb.SheetNames.push("Reporte");

        const ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Estatus", "Comentarios"],
            [
                reporte.folio,
                reporte.nomina,
                reporte.encargado,
                reporte.fechaRegistro,
                reporte.fechaFinalizacion,
                reporte.descripcion || "-",
                reporte.estatus,
                reporte.comentarios || "Sin comentarios"
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws["!cols"] = Array(ws_data[0].length).fill({ wch: 25 });

        wb.Sheets["Reporte"] = ws;
        XLSX.writeFile(wb, `Reporte_${reporte.folio}.xlsx`);
    }

    tablaCompletosBody.addEventListener("click", function (event) {
        if (event.target.closest(".convertidor")) {
            const folio = event.target.closest(".convertidor").getAttribute("data-folio");
            const reporte = datosReportesCompletos.find(rep => String(rep.folio) === String(folio));

            if (reporte) {
                exportarExcel(reporte);
            } else {
                Swal.fire("Error", "No se encontró el reporte para exportar.", "error");
            }
        }
    });

    prevPageBtnCompleto.addEventListener("click", () => {
        if (paginaActualCompleto > 1) {
            paginaActualCompleto--;
            mostrarReportesCompletos(paginaActualCompleto);
        }
    });

    nextPageBtnCompleto.addEventListener("click", () => {
        if (paginaActualCompleto * filasPorPagina < datosFiltradosCompletos.length) {
            paginaActualCompleto++;
            mostrarReportesCompletos(paginaActualCompleto);
        }
    });

    filterInputCompleto.addEventListener("input", filtrarReportesCompletos);
    filterButtonCompleto.addEventListener("click", filtrarReportesCompletos);

    cargarReportesCompletos();
});
