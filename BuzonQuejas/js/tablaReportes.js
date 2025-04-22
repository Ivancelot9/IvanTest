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
    const userId            = document.body.getAttribute("data-user-id") || "default";  /* ✅ MOD */
    const canal             = new BroadcastChannel("canalReportes");
    const canalFinalizados  = new BroadcastChannel("canalFinalizados");

    const filasPorPagina    = 10;
    let   paginaActual      = 1;
    let   datosReportes     = [];   // todos los pendientes
    let   datosFiltrados    = [];   // filtrados/paginados

    /* DOM */
    const tablaBody         = document.getElementById("tabla-body");
    const prevPageBtn       = document.getElementById("prevPage");
    const nextPageBtn       = document.getElementById("nextPage");
    const pageIndicator     = document.getElementById("pageIndicator");
    const filterColumn      = document.getElementById("filter-column");
    const filterInput       = document.getElementById("filter-input");
    const filterButton      = document.getElementById("filter-button");

    /* Columnas BD ↔ nombres internos */
    const columnasBD = {
        folio         : "FolioReportes",
        nomina        : "NumeroNomina",
        encargado     : "Encargado",
        fechaRegistro : "FechaRegistro"
    };

    /* ─────────────────────────────────────────
       2. Utilidades
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
       3. Carga inicial desde backend
    ───────────────────────────────────────── */
    function cargarReportes() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerReportesPendientes.php")
            .then(r => r.json())
            .then(data => {
                datosReportes  = data || [];
                datosFiltrados = [...datosReportes];
                mostrarReportes(1);

                // Marcar folios visibles como vistos
                const foliosKey = `foliosContados_${userId}`;
                localStorage.setItem(foliosKey, JSON.stringify(datosReportes.map(r => r.FolioReportes)));
            })
            .catch(e => console.error("❌ Error al cargar reportes:", e));
    }

    /* ─────────────────────────────────────────
       4. Mostrar y paginar
    ───────────────────────────────────────── */
    function mostrarReportes(page = 1) {
        tablaBody.innerHTML = "";
        const start = (page - 1) * filasPorPagina;
        const end   = start + filasPorPagina;
        const slice = datosFiltrados.slice(start, end);
        const col   = filterColumn.value;
        const txt   = filterInput.value;

        slice.forEach(rep => {
            const folio = rep.FolioReportes || "S/F";

            // Estatus
            const est       = JSON.parse(localStorage.getItem("estatusReportes") || "{}")[folio] || null;
            const prog      = est?.progresoManual ?? null;
            const color     = est?.colorManual ?? null;
            const clase     = color
                ? {G:"green",B:"blue",Y:"yellow",R:"red"}[color] || obtenerClaseEstado(prog)
                : obtenerClaseEstado(prog);
            const esCirculo = prog !== null;
            const btnHTML   = `
                <button class="ver-estatus-btn ${clase}" data-folio="${folio}"
                    style="${esCirculo
                ? `width:50px;height:50px;border-radius:50%;
                               background:${clase};color:white;font-weight:bold;
                               font-size:14px;text-shadow:2px 2px 0 black;
                               border:3px solid black;margin:auto;
                               display:flex;align-items:center;justify-content:center;`
                : `background:white;color:black;border:2px solid black;
                               font-weight:bold;padding:4px 10px;margin:auto;` }">
                    ${esCirculo ? prog + "%" : "Ver Estatus"}
                </button>`;

            // Encargados
            let [sup, sl] = (rep.Encargado || "N/A").split("<br>");
            sup = extraerTextoPlano(sup); sl = extraerTextoPlano(sl);
            if (col === "encargado") {
                sup = resaltarTexto(sup, txt);
                sl  = resaltarTexto(sl,  txt);
            }

            const row = document.createElement("tr");
            row.dataset.folio = String(folio);
            row.innerHTML = `
                <td>${col==="folio"?resaltarTexto(folio,txt):folio}</td>
                <td>${formatearFecha(rep.FechaRegistro)}</td>
                <td>${rep.NumeroNomina||"Sin nómina"}</td>
                <td>${rep.Area||"Sin área"}</td>
                <td class="celda-encargado">${sup}<br>${sl}</td>
                <td><button class="mostrar-descripcion" data-descripcion="${rep.Descripcion||'Sin descripción'}">Mostrar Descripción</button></td>
                <td><button class="agregar-comentario" data-folio="${folio}">Agregar Comentario</button></td>
                <td class="estatus-cell">${btnHTML}</td>
                <td><button class="seleccionar-fecha" data-folio="${folio}">Finalizar Reporte</button></td>`;
            tablaBody.appendChild(row);
        });

        pageIndicator.textContent = `Página ${page}`;
        prevPageBtn.disabled = page === 1;
        nextPageBtn.disabled = end >= datosFiltrados.length;
        paginaActual = page;
    }

    /* ─────────────────────────────────────────
       5. Filtros y eventos de paginación
    ───────────────────────────────────────── */
    function filtrarReportes() {
        const f = filterInput.value.trim().toLowerCase();
        const c = filterColumn.value;
        const bd = columnasBD[c];
        if (!bd) return;

        datosFiltrados = f === ""
            ? [...datosReportes]
            : datosReportes.filter(r => {
                let v = r[bd] ?? "";
                if (bd === "Encargado") v = extraerTextoPlano(v).toLowerCase();
                if (bd === "FechaRegistro") v = formatearFecha(v);
                return String(v).toLowerCase().includes(f);
            });

        mostrarReportes(1);
    }

    prevPageBtn.addEventListener("click", () => { if (paginaActual > 1) mostrarReportes(--paginaActual); });
    nextPageBtn.addEventListener("click", () => { if (paginaActual * filasPorPagina < datosFiltrados.length) mostrarReportes(++paginaActual); });
    filterInput.addEventListener("input", filtrarReportes);
    filterButton.addEventListener("click", filtrarReportes);

    /* ─────────────────────────────────────────
       6. Nuevos reportes en vivo
    ───────────────────────────────────────── */
    window.foliosNotificados = new Set();
    canal.addEventListener("message", ev => {
        if (ev.data?.tipo !== "nuevo-reporte" || !ev.data.folio) return;
        if (window.foliosNotificados.has(ev.data.folio)) return;
        window.foliosNotificados.add(ev.data.folio);
        fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/obteneReportesPorFolio.php?folio=${ev.data.folio}`)
            .then(r => r.json())
            .then(rep => { if (rep?.FolioReportes) agregarReporte(rep); });
    });

    function agregarReporte(rep) {
        datosReportes.push(rep);
        datosReportes.sort((a,b) => new Date(b.FechaRegistro) - new Date(a.FechaRegistro));
        filtrarReportes();
        const first = tablaBody.querySelector("tr");
        if (first) { first.classList.add("nueva-fila"); setTimeout(()=>first.classList.remove("nueva-fila"),2000); }

        // Badge historial
        const vis = document.querySelector(".main-content .content:not([style*='display: none'])")?.id;
        if (vis !== "historial-reportes") {
            const badge = document.getElementById("contador-historial");
            const kF    = `foliosContados_${userId}`;
            const kC    = `contadorHistorial_${userId}`;
            let fV      = JSON.parse(localStorage.getItem(kF)||"[]");
            if (!fV.includes(rep.FolioReportes)) {
                fV.push(rep.FolioReportes);
                localStorage.setItem(kF, JSON.stringify(fV));
                let c = parseInt(localStorage.getItem(kC)||"0");
                c++;
                localStorage.setItem(kC, String(c));
                badge.textContent   = String(c);
                badge.style.display = "inline-block";
            }
        }
    }

    /* ─────────────────────────────────────────
       7. Listener: reportes FINALIZADOS
    ───────────────────────────────────────── */
    if (!window[`listenerFinalizados_${userId}`]) {
        window.foliosFinalizados = new Set();

        canalFinalizados.addEventListener("message", (event) => {
            // Debug: llegada de mensaje
            console.log("🛰️ [tablaReportes] mensaje recibido en", userId, "→", event.data);
            const repFin = event.data;

            // Debug: origen vs receptor
            console.log("🔑 [tablaReportes] repFin.origen =", repFin.origen, " listener userId =", userId);

            // Filtro inicial
            if (!repFin?.folio ||
                repFin.origen === userId ||
                window.foliosFinalizados.has(repFin.folio)) {
                console.log("⛔ [tablaReportes] mensaje FILTRADO en", userId, {
                    causa: !repFin?.folio     ? "noFolio"
                        : repFin.origen===userId ? "origen===userId"
                            : "yaProcesado",
                    repFin
                });
                return;
            }
            console.log("✅ [tablaReportes] mensaje VÁLIDO, procesando folio", repFin.folio);

            // Marca como procesado
            window.foliosFinalizados.add(repFin.folio);

            // Eliminar de pendientes
            const folioStr = String(repFin.folio);
            const fila     = document.querySelector(`tr[data-folio="${folioStr}"]`);
            console.log("🔍 [tablaReportes] buscando fila[data-folio="+folioStr+"] →", fila);
            if (fila) fila.remove();
            datosReportes  = datosReportes .filter(r => r.FolioReportes !== repFin.folio);
            datosFiltrados = datosFiltrados.filter(r => r.FolioReportes !== repFin.folio);
            mostrarReportes(paginaActual);

            // Claves vistos
            const keyF  = `foliosContadosCompletos_${userId}`;
            let foliosC = JSON.parse(localStorage.getItem(keyF)||"[]");

            // ¿Completados visible?
            const vis2    = document.querySelector(".main-content .content:not([style*='display: none'])")?.id;
            const notify = vis2 !== "reportes-completos";

            // Mover a completados
            if (typeof window.moverReporteACompletados === "function") {
                window.moverReporteACompletados(repFin, notify);
            }
            // Si completados está abierta, sólo marcar visto
            if (vis2 === "reportes-completos" && !foliosC.includes(repFin.folio)) {
                foliosC.push(repFin.folio);
                localStorage.setItem(keyF, JSON.stringify(foliosC));
            }
        });

        window[`listenerFinalizados_${userId}`] = true;
    }

    /* ─────────────────────────────────────────
       8. Arranque
    ───────────────────────────────────────── */
    cargarReportes();
    filtrarReportes();
});
