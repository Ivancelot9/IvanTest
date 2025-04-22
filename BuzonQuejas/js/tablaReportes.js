/*  tablaReportes.js  ───────────────────────────────────────────
    Gestión de reportes pendientes
    – Carga inicial desde PHP
    – Paginación, filtros y resaltado
    – Notificaciones en tiempo real (BroadcastChannel)
    – Sincronización de badges por‑usuario
    – Debugging: console.log en listener de finalizados
*/

document.addEventListener("DOMContentLoaded", function () {
    /* ─────────────────────────────────────────
       1. Constantes y variables globales
    ───────────────────────────────────────── */
    const userId           = document.body.getAttribute("data-user-id") || "default";
    const canal            = new BroadcastChannel("canalReportes");
    const canalFinalizados = new BroadcastChannel("canalFinalizados");

    const filasPorPagina = 10;
    let   paginaActual   = 1;
    let   datosReportes  = [];  // todos los pendientes
    let   datosFiltrados = [];  // filtrados/paginados

    /* ─────────────────────────────────────────
       2. DOM
    ───────────────────────────────────────── */
    const tablaBody     = document.getElementById("tabla-body");
    const prevPageBtn   = document.getElementById("prevPage");
    const nextPageBtn   = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const filterColumn  = document.getElementById("filter-column");
    const filterInput   = document.getElementById("filter-input");
    const filterButton  = document.getElementById("filter-button");

    /* ─────────────────────────────────────────
       3. Mapeo Columnas BD
    ───────────────────────────────────────── */
    const columnasBD = {
        folio:         "FolioReportes",
        nomina:        "NumeroNomina",
        encargado:     "Encargado",
        fechaRegistro: "FechaRegistro"
    };

    /* ─────────────────────────────────────────
       4. Utilidades
    ───────────────────────────────────────── */
    const resaltarTexto = (txt, f) =>
        (!f || f.trim() === "") ? txt
            : String(txt).replace(new RegExp(`(${f})`, "gi"), `<span class="highlight">$1</span>`);
    function obtenerClaseEstado(p) {
        switch (parseInt(p)) {
            case 100: return "green";
            case  75: return "blue";
            case  50: return "yellow";
            case  25: return "red";
            default:  return "";
        }
    }
    const formatearFecha = f => {
        const p = f.split(" ")[0].split("-");
        return (p.length === 3) ? `${p[2]}-${p[1]}-${p[0]}` : f;
    };
    const extraerTextoPlano = html => {
        const d = document.createElement("div"); d.innerHTML = html;
        return d.textContent || d.innerText || "";
    };

    /* ─────────────────────────────────────────
       5. Carga inicial desde backend
    ───────────────────────────────────────── */
    function cargarReportes() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerReportesPendientes.php")
            .then(r => r.json())
            .then(data => {
                datosReportes  = data || [];
                datosFiltrados = [...datosReportes];
                mostrarReportes(1);
                // Guardar vistos
                const foliosKey = `foliosContados_${userId}`;
                localStorage.setItem(foliosKey, JSON.stringify(datosReportes.map(r => r.FolioReportes)));
            })
            .catch(e => console.error("❌ Error al cargar reportes:", e));
    }

    /* ─────────────────────────────────────────
       6. Renderizado + paginación
    ───────────────────────────────────────── */
    function mostrarReportes(page = 1) {
        tablaBody.innerHTML = "";
        const start = (page - 1) * filasPorPagina;
        const slice = datosFiltrados.slice(start, start + filasPorPagina);

        slice.forEach(rep => {
            const folio = rep.FolioReportes || "S/F";
            // Estatus
            const est     = JSON.parse(localStorage.getItem("estatusReportes") || "{}")[folio] || null;
            const prog    = est?.progresoManual  ?? null;
            const color   = est?.colorManual     ?? null;
            const clase   = color
                ? {G:"green",B:"blue",Y:"yellow",R:"red"}[color] || obtenerClaseEstado(prog)
                : obtenerClaseEstado(prog);
            const esCir   = prog !== null;
            const btnHTML = `
                <button class="ver-estatus-btn ${clase}" data-folio="${folio}"
                        style="${esCir
                ? `width:50px;height:50px;border-radius:50%;background:${clase};
                               color:white;font-weight:bold;font-size:14px;text-shadow:2px 2px 0 black;
                               border:3px solid black;margin:auto;display:flex;
                               align-items:center;justify-content:center;`
                : `background:white;color:black;border:2px solid black;
                               font-weight:bold;padding:4px 10px;margin:auto;`}">
                    ${esCir ? prog + "%" : "Ver Estatus"}
                </button>`;

            // Encargados
            let [sup, sl] = (rep.Encargado || "N/A").split("<br>");
            sup = extraerTextoPlano(sup);
            sl  = extraerTextoPlano(sl);
            if (filterColumn.value === "encargado") {
                sup = resaltarTexto(sup, filterInput.value);
                sl  = resaltarTexto(sl,  filterInput.value);
            }

            const row = document.createElement("tr");
            row.dataset.folio = String(folio);
            row.innerHTML = `
                <td>${filterColumn.value==="folio"
                ? resaltarTexto(folio, filterInput.value)
                : folio}</td>
                <td>${formatearFecha(rep.FechaRegistro)}</td>
                <td>${rep.NumeroNomina || "Sin nómina"}</td>
                <td>${rep.Area         || "Sin área"}</td>
                <td class="celda-encargado">${sup}<br>${sl}</td>
                <td><button class="mostrar-descripcion"
                            data-descripcion="${rep.Descripcion || 'Sin descripción'}">
                        Mostrar Descripción
                    </button></td>
                <td><button class="agregar-comentario"
                            data-folio="${folio}">
                        Agregar Comentario
                    </button></td>
                <td class="estatus-cell">${btnHTML}</td>
                <td><button class="seleccionar-fecha"
                            data-folio="${folio}">
                        Finalizar Reporte
                    </button></td>`;
            tablaBody.appendChild(row);
        });

        pageIndicator.textContent      = `Página ${page}`;
        prevPageBtn.disabled           = page === 1;
        nextPageBtn.disabled           = (start + filasPorPagina) >= datosFiltrados.length;
        paginaActual                   = page;
    }

    /* ─────────────────────────────────────────
       7. Filtros y eventos de paginación
    ───────────────────────────────────────── */
    function filtrarReportes() {
        const f = filterInput.value.trim().toLowerCase();
        const bd = columnasBD[filterColumn.value];
        datosFiltrados = !bd
            ? [...datosReportes]
            : datosReportes.filter(r => {
                let v = r[bd] ?? "";
                if (bd === "Encargado")       v = extraerTextoPlano(v).toLowerCase();
                if (bd === "FechaRegistro")    v = formatearFecha(v);
                return String(v).toLowerCase().includes(f);
            });
        mostrarReportes(1);
    }
    prevPageBtn .addEventListener("click", () => paginaActual > 1 && mostrarReportes(--paginaActual));
    nextPageBtn .addEventListener("click", () => paginaActual * filasPorPagina < datosFiltrados.length && mostrarReportes(++paginaActual));
    filterInput.addEventListener("input", filtrarReportes);
    filterButton.addEventListener("click", filtrarReportes);

    /* ─────────────────────────────────────────
       8. Nuevos reportes en vivo (canalReportes)
    ───────────────────────────────────────── */
    window.foliosNotificados = new Set();
    canal.addEventListener("message", ev => {
        if (ev.data?.tipo === "nuevo-reporte" && ev.data.folio && !window.foliosNotificados.has(ev.data.folio)) {
            window.foliosNotificados.add(ev.data.folio);
            fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/obteneReportesPorFolio.php?folio=${ev.data.folio}`)
                .then(r => r.json())
                .then(rep => { if (rep?.FolioReportes) {
                    datosReportes.unshift(rep);
                    filtrarReportes();
                }});
        }
    });

    /* ─────────────────────────────────────────
       9. Listener: reportes FINALIZADOS
    ───────────────────────────────────────── */
    if (!window[`listenerFinalizados_${userId}`]) {
        window.foliosFinalizados = new Set();

        canalFinalizados.addEventListener("message", event => {
            const repFin = event.data;
            if (!repFin?.folio || repFin.origen === userId || window.foliosFinalizados.has(repFin.folio)) {
                return;
            }
            window.foliosFinalizados.add(repFin.folio);

            // Actualizar arrays internos y re-renderizar
            datosReportes  = datosReportes.filter(r => r.FolioReportes !== repFin.folio);
            datosFiltrados = datosFiltrados.filter(r => r.FolioReportes !== repFin.folio);
            mostrarReportes(paginaActual);
        });

        window[`listenerFinalizados_${userId}`] = true;
    }

    /* ─────────────────────────────────────────
       10. Arranque
    ───────────────────────────────────────── */
    cargarReportes();
    filtrarReportes();
});
