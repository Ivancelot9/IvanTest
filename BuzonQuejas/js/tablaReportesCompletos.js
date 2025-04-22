/*  tablaReportesCompletos.js  ──────────────────────────────
    Gestión de reportes COMPLETADOS
    – Filtro por texto y rango de fechas
    – Paginación + resaltado
    – Exportar reporte individual a Excel
    – Recibe notificaciones de tablaReportes.js mediante
      window.moverReporteACompletados(reporte, notificar)
*/

document.addEventListener("DOMContentLoaded", function () {
    // ─────────────────────────────────────────────────
    // 1. Variables y elementos
    // ─────────────────────────────────────────────────
    const userId               = document.body.getAttribute("data-user-id") || "default";
    const claveStorageCompletos= `contadorCompletos_${userId}`;

    const tablaCompletosBody   = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto  = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto  = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto= document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto  = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");
    const startDateInput       = document.getElementById("start-date");
    const endDateInput         = document.getElementById("end-date");
    const filterDateButton     = document.getElementById("filter-date-button");
    const clearDateButton      = document.getElementById("clear-date-button");

    let datosReportesCompletos  = [];
    let datosFiltradosCompletos = [];
    let paginaActualCompleto    = 1;
    const filasPorPagina        = 10;
    let resaltarFechas          = false;

    const columnasBDCompletos = {
        folio           : "folio",
        nomina          : "nomina",
        encargado       : "encargado",
        fechaFinalizacion: "fechaFinalizacion",
        estatus         : "estatus"
    };

    startDateInput.setAttribute("onkeydown", "return false;");
    endDateInput.  setAttribute("onkeydown", "return false;");

    // ─────────────────────────────────────────────────
    // 2. Utilidades
    // ─────────────────────────────────────────────────
    const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const resaltarTexto = (txt, filtro) => {
        if (!filtro || !filtro.trim()) return String(txt ?? "");
        const safe = String(txt ?? "");
        return safe.replace(new RegExp(`(${escapeRegex(filtro)})`, "gi"), `<span class="highlight">$1</span>`);
    };

    const aplicarResaltado = (valor, campo, filtro, campoActual) =>
        campoActual === campo ? resaltarTexto(valor, filtro) : valor;

    const formatearFecha = fecha => {
        const partes = fecha.split(" ")[0].split("-");
        return partes.length === 3
            ? `${partes[2]}-${partes[1]}-${partes[0]}`
            : fecha;
    };

    const extraerTextoPlano = html => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    };

    const parseFechaDMY = str => {
        const p = str.split("/");
        return p.length === 3 ? new Date(`${p[2]}-${p[1]}-${p[0]}`) : null;
    };

    const limpiarHTMLParaExcel = html => {
        if (!html) return "N/A";
        const tmp = document.createElement("div");
        tmp.innerHTML = html.replace(/<br\s*\/?>/gi, "\n");
        return tmp.textContent.trim();
    };

    const formatearEncargadoParaVista = text => {
        if (!text) return "N/A";
        return text
            .replace(/\n/g, "<br>")
            .replace(/SUPERVISOR:/gi, "<strong>SUPERVISOR:</strong>")
            .replace(/SHIFT LEADER:/gi, "<strong>SHIFT LEADER:</strong>");
    };

    // ─────────────────────────────────────────────────
    // 3. Mostrar y paginar completados
    // ─────────────────────────────────────────────────
    window.mostrarReportesCompletos = function (pag = 1) {
        const inicio = (pag - 1) * filasPorPagina;
        const fin    = inicio + filasPorPagina;
        const filtro = filterInputCompleto.value.toLowerCase();
        const colSel = filterColumnCompleto.value;
        const lista  = datosFiltradosCompletos.slice(inicio, fin);

        tablaCompletosBody.innerHTML = "";

        if (lista.length === 0) {
            const usandoFecha = startDateInput.value || endDateInput.value;
            const mensaje = usandoFecha
                ? "❌ No hay reportes en este rango de fechas."
                : "❌ No hay reportes que coincidan con el filtro.";
            tablaCompletosBody.innerHTML = `<tr><td colspan="6" style="color:red;font-weight:bold;">${mensaje}</td></tr>`;
            pageIndicatorCompleto.textContent = `Página ${pag}`;
            prevPageBtnCompleto.disabled = pag === 1;
            nextPageBtnCompleto.disabled = true;
            return;
        }

        lista.forEach(rep => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${aplicarResaltado(rep.folio,"folio",filtro,colSel)}</td>
                <td>${aplicarResaltado(rep.nomina,"nomina",filtro,colSel)}</td>
                <td>${formatearEncargadoParaVista(
                aplicarResaltado(rep.encargado,"encargado",filtro,colSel)
            )}</td>
                <td>${aplicarResaltado(formatearFecha(rep.fechaFinalizacion),"fechaFinalizacion",filtro,colSel)}</td>
                <td>${aplicarResaltado(rep.estatus,"estatus",filtro,colSel)}</td>
            `;
            // Botón Excel
            const btn = document.createElement("button");
            btn.className = "convertidor";
            btn.dataset.folio = rep.folio;
            btn.innerHTML = `<i class="fas fa-file-excel"></i> Convertir a Excel`;
            const tdBtn = document.createElement("td");
            tdBtn.appendChild(btn);
            row.appendChild(tdBtn);

            tablaCompletosBody.appendChild(row);
        });

        pageIndicatorCompleto.textContent   = `Página ${pag}`;
        prevPageBtnCompleto.disabled        = pag === 1;
        nextPageBtnCompleto.disabled        = fin >= datosFiltradosCompletos.length;
        paginaActualCompleto                = pag;

        if (resaltarFechas) {
            tablaCompletosBody
                .querySelectorAll("td:nth-child(4)")
                .forEach(td => td.classList.add("highlight"));
        }
    };

    // ─────────────────────────────────────────────────
    // 4. Carga inicial de completados
    // ─────────────────────────────────────────────────
    function cargarReportesCompletos() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/conseguirReportesCompletos.php")
            .then(r => r.json())
            .then(data => {
                datosReportesCompletos  = Array.isArray(data) ? data : [];
                datosFiltradosCompletos = [...datosReportesCompletos];
                mostrarReportesCompletos(1);
            })
            .catch(err => console.error("❌ Error al cargar completados:", err));
    }

    // ─────────────────────────────────────────────────
    // 5. Filtrar por texto y fecha
    // ─────────────────────────────────────────────────
    function filtrarReportesCompletos() {
        const filtro = filterInputCompleto.value.toLowerCase();
        const colSel = filterColumnCompleto.value;
        const bd     = columnasBDCompletos[colSel];
        if (!bd) return;

        datosFiltradosCompletos = datosReportesCompletos.filter(rep => {
            let val = rep[bd] ?? "";
            if (bd === "encargado") val = extraerTextoPlano(val);
            if (bd === "fechaFinalizacion") val = formatearFecha(val);
            return val.toString().toLowerCase().includes(filtro);
        });

        resaltarFechas = false;
        mostrarReportesCompletos(1);
    }

    function filtrarPorRangoDeFechas() {
        const start = startDateInput.value ? parseFechaDMY(startDateInput.value) : null;
        const end   = endDateInput.value   ? parseFechaDMY(endDateInput.value)   : null;
        if (!start && !end) {
            Swal.fire("Advertencia", "Debes seleccionar al menos una fecha para filtrar.", "warning");
            return;
        }

        datosFiltradosCompletos = datosReportesCompletos.filter(rep => {
            const fecha = new Date(rep.fechaFinalizacion.split(" ")[0]);
            if (start && end) return fecha >= start && fecha <= end;
            if (start) return fecha >= start;
            return fecha <= end;
        });

        datosFiltradosCompletos.sort((a, b) => new Date(a.fechaFinalizacion) - new Date(b.fechaFinalizacion));
        resaltarFechas = true;
        filterInputCompleto.value = "";
        mostrarReportesCompletos(1);
    }

    function limpiarRangoFechas() {
        startDateInput.value = "";
        endDateInput.value   = "";
        resaltarFechas       = false;
        datosFiltradosCompletos = [...datosReportesCompletos];
        mostrarReportesCompletos(1);
    }

    // ─────────────────────────────────────────────────
    // 6. Exportar a Excel
    // ─────────────────────────────────────────────────
    function exportarExcel(rep) {
        const wb = XLSX.utils.book_new();
        wb.Props = { Title: "Reporte Completado", Author: "Sistema", CreatedDate: new Date() };
        wb.SheetNames.push("Reporte");

        const wsData = [
            ["Folio","Número de Nómina","Encargado","Fecha Registro","Fecha Finalización","Descripción","Estatus","Comentarios"],
            [
                rep.folio,
                rep.nomina,
                limpiarHTMLParaExcel(rep.encargado),
                formatearFecha(rep.fechaRegistro),
                formatearFecha(rep.fechaFinalizacion),
                rep.descripcion || "-",
                rep.estatus,
                rep.comentarios || "Sin comentarios"
            ]
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws["!cols"] = [
            { wch: 15 },{ wch: 20 },{ wch: 80 },{ wch: 20 },
            { wch: 20 },{ wch: 30 },{ wch: 15 },{ wch: 25 }
        ];
        wb.Sheets["Reporte"] = ws;
        XLSX.writeFile(wb, `Reporte_${rep.folio}.xlsx`, { bookType: "xlsx", cellStyles: true });
    }

    tablaCompletosBody.addEventListener("click", event => {
        const btn = event.target.closest(".convertidor");
        if (!btn) return;
        const folio = btn.dataset.folio;
        const rep = datosReportesCompletos.find(r => String(r.folio) === folio);
        if (rep) exportarExcel(rep);
        else Swal.fire("Error", "No se encontró el reporte para exportar.", "error");
    });

    // ─────────────────────────────────────────────────
    // 7. Eventos UI
    // ─────────────────────────────────────────────────
    prevPageBtnCompleto .addEventListener("click", () => {
        if (paginaActualCompleto > 1) mostrarReportesCompletos(--paginaActualCompleto);
    });
    nextPageBtnCompleto .addEventListener("click", () => {
        if (paginaActualCompleto * filasPorPagina < datosFiltradosCompletos.length)
            mostrarReportesCompletos(++paginaActualCompleto);
    });

    filterInputCompleto .addEventListener("input", filtrarReportesCompletos);
    filterButtonCompleto.addEventListener("click", filtrarReportesCompletos);
    filterDateButton   .addEventListener("click", filtrarPorRangoDeFechas);
    clearDateButton    .addEventListener("click", limpiarRangoFechas);

    flatpickr("#start-date", { dateFormat: "d/m/Y", locale: "es" });
    flatpickr("#end-date",   { dateFormat: "d/m/Y", locale: "es" });

    // ─────────────────────────────────────────────────
    // 8. moverReporteACompletados (flag notificar)
    // ─────────────────────────────────────────────────
    window.moverReporteACompletados = function (nuevoReporte, notificar = true) {
        // Evita duplicados
        if (datosReportesCompletos.some(r => String(r.folio) === String(nuevoReporte.folio))) return;

        // Agrega y muestra
        datosReportesCompletos.unshift(nuevoReporte);
        datosFiltradosCompletos = [...datosReportesCompletos];
        mostrarReportesCompletos(1);

        // Cuenta solo si notificar === true
        if (notificar) {
            const badge    = document.getElementById("contador-completos");
            const foliosKey= `foliosContadosCompletos_${userId}`;
            let folios     = JSON.parse(localStorage.getItem(foliosKey) || "[]");

            if (!folios.includes(nuevoReporte.folio)) {
                folios.push(nuevoReporte.folio);
                localStorage.setItem(foliosKey, JSON.stringify(folios));

                let count = parseInt(localStorage.getItem(claveStorageCompletos) || "0", 10);
                count++;
                localStorage.setItem(claveStorageCompletos, String(count));
                if (badge) {
                    badge.textContent   = String(count);
                    badge.style.display = "inline-block";
                }
            }
        }
    };

    // ─────────────────────────────────────────────────
    // 9. Carga inicial
    // ─────────────────────────────────────────────────
    cargarReportesCompletos();
});
