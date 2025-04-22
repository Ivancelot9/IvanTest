document.addEventListener("DOMContentLoaded", function () {
    const userId = document.body.getAttribute("data-user-id") || "default";
    const claveStorageCompletos = `contadorCompletos_${userId}`;

    const tablaCompletosBody = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto = document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const filterDateButton = document.getElementById("filter-date-button");
    const clearDateButton = document.getElementById("clear-date-button");

    let datosReportesCompletos = [];
    let datosFiltradosCompletos = [];
    let paginaActualCompleto = 1;
    const filasPorPagina = 10;
    let resaltarFechas = false;

    const columnasBDCompletos = {
        folio: "folio",
        nomina: "nomina",
        encargado: "encargado",
        fechaFinalizacion: "fechaFinalizacion",
        estatus: "estatus"
    };

    startDateInput.setAttribute("onkeydown", "return false;");
    endDateInput.setAttribute("onkeydown", "return false;");

    function escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return String(texto ?? "");
        const safeText = String(texto ?? "");
        const regex = new RegExp(`(${escapeRegex(filtro)})`, "gi");
        return safeText.replace(regex, `<span class="highlight">$1</span>`);
    }

    function aplicarResaltado(valorCampo, campo, filtro, columnaSeleccionada) {
        return columnaSeleccionada === campo ? resaltarTexto(valorCampo, filtro) : valorCampo;
    }

    function formatearFecha(fechaOriginal) {
        const partes = fechaOriginal.split(" ")[0].split("-");
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
        return fechaOriginal;
    }

    function extraerTextoPlano(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    }

    window.mostrarReportesCompletos = function (pagina = 1) {
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltradosCompletos.slice(inicio, fin);
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columnaSeleccionada = filterColumnCompleto.value;

        tablaCompletosBody.innerHTML = "";

        if (reportesPagina.length === 0) {
            const usandoFiltroFecha = startDateInput.value || endDateInput.value;
            const mensaje = usandoFiltroFecha
                ? "❌ No hay reportes en este rango de fechas."
                : "❌ No hay reportes que coincidan con el filtro.";
            tablaCompletosBody.innerHTML = `<tr><td colspan="6" style="color: red; font-weight: bold;">${mensaje}</td></tr>`;
            return;
        }

        reportesPagina.forEach(reporte => {
            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${aplicarResaltado(reporte.folio, "folio", valorFiltro, columnaSeleccionada)}</td>
                <td>${aplicarResaltado(reporte.nomina, "nomina", valorFiltro, columnaSeleccionada)}</td>
                <td>${formatearEncargadoParaVista(aplicarResaltado(reporte.encargado, "encargado", valorFiltro, columnaSeleccionada))}</td>
                <td>${aplicarResaltado(formatearFecha(reporte.fechaFinalizacion), "fechaFinalizacion", valorFiltro, columnaSeleccionada)}</td>
                <td>${aplicarResaltado(reporte.estatus, "estatus", valorFiltro, columnaSeleccionada)}</td>`;

            const boton = document.createElement("button");
            boton.classList.add("convertidor");
            boton.setAttribute("data-folio", reporte.folio);
            boton.innerHTML = `<i class="fas fa-file-excel"></i> Convertir a Excel`;

            const celdaBoton = document.createElement("td");
            celdaBoton.appendChild(boton);
            fila.appendChild(celdaBoton);

            tablaCompletosBody.appendChild(fila);
        });

        if (resaltarFechas) {
            const celdasFecha = tablaCompletosBody.querySelectorAll("td:nth-child(4)");
            celdasFecha.forEach(celda => celda.classList.add("highlight"));
        }

        pageIndicatorCompleto.textContent = `Página ${pagina}`;
        prevPageBtnCompleto.disabled = pagina === 1;
        nextPageBtnCompleto.disabled = fin >= datosFiltradosCompletos.length;
        paginaActualCompleto = pagina;
    };

    function cargarReportesCompletos() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/conseguirReportesCompletos.php")
            .then(res => res.json())
            .then(data => {
                datosReportesCompletos = Array.isArray(data) ? data : [];
                window.datosReportesCompletos = datosReportesCompletos;
                datosFiltradosCompletos = [...datosReportesCompletos];
                mostrarReportesCompletos(1);

                // ✅ Marcar todos los folios ya visibles como "vistos" para evitar contar de nuevo
                const foliosKey = `foliosContadosCompletos_${userId}`;
                const foliosYaContados = datosReportesCompletos.map(r => r.folio);
                localStorage.setItem(foliosKey, JSON.stringify(foliosYaContados));
            })
            .catch(err => console.error("❌ Error al cargar reportes completados:", err));
    }

    function filtrarReportesCompletos() {
        const valorFiltro = filterInputCompleto.value.toLowerCase();
        const columnaSeleccionada = filterColumnCompleto.value;
        const columnaBD = columnasBDCompletos[columnaSeleccionada];
        if (!columnaBD) return;

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            let valor = reporte[columnaBD] ?? "";
            if (columnaBD === "encargado") valor = extraerTextoPlano(valor);
            if (columnaBD === "fechaFinalizacion") valor = formatearFecha(valor);
            return valor.toString().toLowerCase().includes(valorFiltro);
        });

        resaltarFechas = false;
        paginaActualCompleto = 1;
        mostrarReportesCompletos(1);
    }

    function parseFechaDMY(fechaStr) {
        const partes = fechaStr.split("/");
        if (partes.length !== 3) return null;
        return new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    }

    function filtrarPorRangoDeFechas() {
        const start = startDateInput.value ? parseFechaDMY(startDateInput.value) : null;
        const end = endDateInput.value ? parseFechaDMY(endDateInput.value) : null;

        if (!start && !end) {
            Swal.fire("Advertencia", "Debes seleccionar al menos una fecha para filtrar.", "warning");
            return;
        }

        datosFiltradosCompletos = datosReportesCompletos.filter(reporte => {
            const fechaStr = reporte.fechaFinalizacion?.split(" ")[0];
            const fecha = new Date(fechaStr);
            if (!fechaStr) return false;
            return (start && end) ? fecha >= start && fecha <= end
                : start ? fecha >= start
                    : end ? fecha <= end : false;
        });

        datosFiltradosCompletos.sort((a, b) => new Date(a.fechaFinalizacion) - new Date(b.fechaFinalizacion));
        resaltarFechas = true;
        filterInputCompleto.value = "";
        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);
    }

    function limpiarRangoFechas() {
        startDateInput.value = "";
        endDateInput.value = "";
        resaltarFechas = false;
        datosFiltradosCompletos = [...datosReportesCompletos];
        paginaActualCompleto = 1;
        mostrarReportesCompletos(paginaActualCompleto);
    }

    function limpiarHTMLParaExcel(html) {
        if (!html) return "N/A";
        const temporal = document.createElement("div");
        html = html.replace(/<br\s*\/?>/gi, '\n');
        temporal.innerHTML = html;
        return temporal.textContent.trim();
    }

    function formatearEncargadoParaVista(textoPlano) {
        if (!textoPlano) return "N/A";
        const conSaltos = textoPlano.replace(/\n/g, "<br>");
        return conSaltos
            .replace(/SUPERVISOR:/gi, "<strong>SUPERVISOR:</strong>")
            .replace(/SHIFT LEADER:/gi, "<strong>SHIFT LEADER:</strong>");
    }

    function exportarExcel(reporte) {
        let wb = XLSX.utils.book_new();
        wb.Props = { Title: "Reporte Completado", Author: "Sistema", CreatedDate: new Date() };
        wb.SheetNames.push("Reporte");

        const ws_data = [
            ["Folio", "Número de Nómina", "Encargado", "Fecha Registro", "Fecha Finalización", "Descripción", "Estatus", "Comentarios"],
            [
                reporte.folio,
                reporte.nomina,
                limpiarHTMLParaExcel(reporte.encargado),
                formatearFecha(reporte.fechaRegistro),
                formatearFecha(reporte.fechaFinalizacion),
                reporte.descripcion || "-",
                reporte.estatus,
                reporte.comentarios || "Sin comentarios"
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws["!cols"] = [ { wch: 15 }, { wch: 20 }, { wch: 80 }, { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 25 } ];
        wb.Sheets["Reporte"] = ws;
        XLSX.writeFile(wb, `Reporte_${reporte.folio}.xlsx`, { bookType: "xlsx", cellStyles: true });
    }

    tablaCompletosBody.addEventListener("click", function (event) {
        if (event.target.closest(".convertidor")) {
            const folio = event.target.closest(".convertidor").getAttribute("data-folio");
            const reporte = datosReportesCompletos.find(rep => String(rep.folio) === String(folio));
            if (reporte) exportarExcel(reporte);
            else Swal.fire("Error", "No se encontró el reporte para exportar.", "error");
        }
    });

    prevPageBtnCompleto.addEventListener("click", () => { if (paginaActualCompleto > 1) paginaActualCompleto--, mostrarReportesCompletos(paginaActualCompleto); });
    nextPageBtnCompleto.addEventListener("click", () => { if (paginaActualCompleto * filasPorPagina < datosFiltradosCompletos.length) paginaActualCompleto++, mostrarReportesCompletos(paginaActualCompleto); });

    filterInputCompleto.addEventListener("input", filtrarReportesCompletos);
    filterButtonCompleto.addEventListener("click", filtrarReportesCompletos);
    filterDateButton.addEventListener("click", filtrarPorRangoDeFechas);
    clearDateButton.addEventListener("click", limpiarRangoFechas);

    cargarReportesCompletos();

    window.cargarReportesCompletos = cargarReportesCompletos;

    window.moverReporteACompletados = function (nuevoReporte) {
        const yaExiste = datosReportesCompletos.some(r => String(r.folio) === String(nuevoReporte.folio));
        if (yaExiste) return;

        const badge = document.getElementById("contador-completos");
        const foliosKey = `foliosContadosCompletos_${userId}`;
        let foliosContados = JSON.parse(localStorage.getItem(foliosKey) || "[]");

        // ✅ Solo contar si no ha sido notificado ya
        if (!foliosContados.includes(nuevoReporte.folio)) {
            foliosContados.push(nuevoReporte.folio);
            localStorage.setItem(foliosKey, JSON.stringify(foliosContados));

            if (badge) {
                let count = parseInt(localStorage.getItem(claveStorageCompletos) || "0");
                count++;
                localStorage.setItem(claveStorageCompletos, count);
                badge.textContent = count.toString();
                badge.style.display = "inline-block";
            }
        }

        datosReportesCompletos.unshift(nuevoReporte);
        datosFiltradosCompletos = [...datosReportesCompletos];
        mostrarReportesCompletos(1);
    };

    flatpickr("#start-date", { dateFormat: "d/m/Y", locale: "es" });
    flatpickr("#end-date", { dateFormat: "d/m/Y", locale: "es" });
});
