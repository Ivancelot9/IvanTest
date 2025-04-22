/*  tablaReportes.js  ───────────────
    Gestión de reportes pendientes
    – Carga inicial desde PHP
    – Paginación, filtros y resaltado
    – Notificaciones en tiempo real (BroadcastChannel)
    – Sincronización de badges por‑usuario
*/

document.addEventListener("DOMContentLoaded", function () {

    /* ──────────────────────────────────
       1. Constantes y variables globales
    ────────────────────────────────── */
    const userId = document.body.getAttribute("data-user-id") || "default";   /* ✅ MOD */
    const canal            = new BroadcastChannel("canalReportes");
    const canalFinalizados = new BroadcastChannel("canalFinalizados");

    const filasPorPagina = 10;
    let   paginaActual   = 1;
    let   datosReportes  = [];   // todos los pendientes
    let   datosFiltrados = [];   // filtrados/paginados

    /* DOM */
    const tablaBody     = document.getElementById("tabla-body");
    const prevPageBtn   = document.getElementById("prevPage");
    const nextPageBtn   = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const filterColumn  = document.getElementById("filter-column");
    const filterInput   = document.getElementById("filter-input");
    const filterButton  = document.getElementById("filter-button");

    /* Columnas BD ↔ nombres internos */
    const columnasBD = {
        folio        : "FolioReportes",
        nomina       : "NumeroNomina",
        encargado    : "Encargado",
        fechaRegistro: "FechaRegistro"
    };

    /* ──────────────────────────────────
       2. Utilidades
    ────────────────────────────────── */
    const resaltarTexto = (txt, f) =>
        (!f || f.trim() === "") ? txt : String(txt).replace(new RegExp(`(${f})`, "gi"), `<span class="highlight">$1</span>`);

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
        const d = document.createElement("div");
        d.innerHTML = html;
        return d.textContent || d.innerText || "";
    };

    /* ──────────────────────────────────
       3. Carga inicial
    ────────────────────────────────── */
    function cargarReportes() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerReportesPendientes.php")
            .then(r => r.json())
            .then(data => {
                datosReportes  = data || [];
                datosFiltrados = [...datosReportes];
                mostrarReportes(1);

                /* Marcar folios visibles como vistos */
                const foliosKey = `foliosContados_${userId}`;
                localStorage.setItem(foliosKey, JSON.stringify(datosReportes.map(r => r.FolioReportes)));
            })
            .catch(e => console.error("❌ Error al cargar reportes:", e));
    }

    /* ──────────────────────────────────
       4. Renderizado + paginación
    ────────────────────────────────── */
    function mostrarReportes(pag = 1) {
        tablaBody.innerHTML = "";
        const ini     = (pag - 1) * filasPorPagina;
        const fin     = ini + filasPorPagina;
        const lista   = datosFiltrados.slice(ini, fin);
        const colAct  = filterColumn.value;
        const filtro  = filterInput.value;
        const estatus = JSON.parse(localStorage.getItem("estatusReportes") || "{}");

        lista.forEach(rep => {
            const folio = rep.FolioReportes || "S/F";

            /* Botón Estatus */
            const est   = estatus[folio] || null;
            const prog  = est?.progresoManual ?? null;
            const color = est?.colorManual ?? null;
            const clase = color
                ? {G:"green",B:"blue",Y:"yellow",R:"red"}[color] || obtenerClaseEstado(prog)
                : obtenerClaseEstado(prog);

            const esCir = prog !== null;
            const btnHTML = `
                <button class="ver-estatus-btn ${clase}" data-folio="${folio}"
                    style="${esCir ? `
                        width:50px;height:50px;border-radius:50%;
                        background:${clase};color:white;font-weight:bold;
                        font-size:14px;text-shadow:2px 2px 0 black;
                        border:3px solid black;margin:auto;
                        display:flex;align-items:center;justify-content:center;
                    ` : `
                        background:white;color:black;border:2px solid black;
                        font-weight:bold;padding:4px 10px;margin:auto;
                    `}">
                    ${esCir ? prog + "%" : "Ver Estatus"}
                </button>`;

            /* Encargados */
            let [sup, sl] = (rep.Encargado || "N/A").split("<br>");
            sup = extraerTextoPlano(sup || "SUPERVISOR: N/A");
            sl  = extraerTextoPlano(sl  || "SHIFT LEADER: N/A");
            if (colAct === "encargado") {
                sup = resaltarTexto(sup, filtro);
                sl  = resaltarTexto(sl , filtro);
            }

            const fila = document.createElement("tr");
            fila.dataset.folio = folio;
            fila.innerHTML = `
                <td>${colAct==="folio"?resaltarTexto(folio,filtro):folio}</td>
                <td>${formatearFecha(rep.FechaRegistro)}</td>
                <td>${rep.NumeroNomina || "Sin nómina"}</td>
                <td>${rep.Area || "Sin área"}</td>
                <td class="celda-encargado">${sup}<br>${sl}</td>
                <td><button class="mostrar-descripcion" data-descripcion="${rep.Descripcion||'Sin descripción'}">Mostrar Descripción</button></td>
                <td><button class="agregar-comentario" data-folio="${folio}">Agregar Comentario</button></td>
                <td class="estatus-cell">${btnHTML}</td>
                <td><button class="seleccionar-fecha" data-folio="${folio}">Finalizar Reporte</button></td>`;
            tablaBody.appendChild(fila);
        });

        pageIndicator.textContent = `Página ${pag}`;
        prevPageBtn.disabled = pag === 1;
        nextPageBtn.disabled = fin >= datosFiltrados.length;
        paginaActual = pag;
    }

    /* ──────────────────────────────────
       5. Filtros, paginación y eventos
    ────────────────────────────────── */
    function filtrarReportes() {
        const fTxt  = filterInput.value.trim().toLowerCase();
        const colUI = filterColumn.value;
        const colBD = columnasBD[colUI];
        if (!colBD) return;

        datosFiltrados = fTxt === "" ? [...datosReportes] : datosReportes.filter(rep => {
            let val = rep[colBD] ?? "";
            if (colBD === "Encargado") val = extraerTextoPlano(val).toLowerCase();
            if (colBD === "FechaRegistro") val = formatearFecha(val);
            return String(val).toLowerCase().includes(fTxt);
        });

        mostrarReportes(1);
    }

    prevPageBtn.addEventListener("click", () => {
        if (paginaActual > 1) mostrarReportes(--paginaActual);
    });
    nextPageBtn.addEventListener("click", () => {
        if (paginaActual * filasPorPagina < datosFiltrados.length) mostrarReportes(++paginaActual);
    });
    filterInput .addEventListener("input", filtrarReportes);
    filterButton.addEventListener("click" , filtrarReportes);

    /* ──────────────────────────────────
       6. Nuevos reportes (canalReportes)
    ────────────────────────────────── */
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
        datosReportes.sort((a,b) => new Date(b.FechaRegistro)-new Date(a.FechaRegistro));
        filtrarReportes();

        const first = tablaBody.querySelector("tr");
        if (first) { first.classList.add("nueva-fila"); setTimeout(()=>first.classList.remove("nueva-fila"),2000); }

        /* Badge historial solo si no estamos en la sección */
        const visible = document.querySelector(".main-content .content:not([style*='display: none'])")?.id;
        if (visible !== "historial-reportes") {
            const badge   = document.getElementById("contador-historial");
            const keyC    = `contadorHistorial_${userId}`;
            const keyF    = `foliosContados_${userId}`;
            let fVistos   = JSON.parse(localStorage.getItem(keyF) || "[]");

            if (!fVistos.includes(rep.FolioReportes)) {
                fVistos.push(rep.FolioReportes);
                localStorage.setItem(keyF, JSON.stringify(fVistos));

                let c = parseInt(localStorage.getItem(keyC) || "0");
                c++;                                                     // ⬆️ incrementa
                localStorage.setItem(keyC, String(c));                   // ✅ guarda como string
                badge.textContent   = String(c);                         // ✅ muestra como string
                badge.style.display = "inline-block";
            }
        }
    }

    /* ──────────────────────────────────
       7. Reportes FINALIZADOS
    ────────────────────────────────── */
    /* ✅ Guard para no registrar dos veces si el script se inyecta de nuevo */
    if (!window[`listenerFinalizados_${userId}`]) {

        window.foliosFinalizados = new Set();                        /* anti‑duplicados */

        canalFinalizados.addEventListener("message", event => {
            const repFin = event.data;
            if (!repFin?.folio || repFin.origen === userId || window.foliosFinalizados.has(repFin.folio)) return;
            window.foliosFinalizados.add(repFin.folio);

            /* ① Sacar de la tabla de pendientes */
            const fila = document.querySelector(`tr[data-folio="${repFin.folio}"]`);
            if (fila) fila.remove();
            datosReportes  = datosReportes .filter(r => r.FolioReportes !== repFin.folio);
            datosFiltrados = datosFiltrados.filter(r => r.FolioReportes !== repFin.folio);
            mostrarReportes(paginaActual);

            /* ② Claves de conteo */
            const badge     = document.getElementById("contador-completos");
            const keyC      = `contadorCompletos_${userId}`;
            const keyF      = `foliosContadosCompletos_${userId}`;
            let foliosC     = JSON.parse(localStorage.getItem(keyF) || "[]");

            const seccionVis = document.querySelector(".main-content .content:not([style*='display: none'])")?.id;
            const notificar  = seccionVis !== "reportes-completos";

            /* ③ Mover a tabla 2 (completados) */
            if (typeof window.moverReporteACompletados === "function")
                window.moverReporteACompletados(repFin, notificar);  /* ✅ MOD flag */

            /* ④ Badge solo si procede */
            if (!foliosC.includes(repFin.folio) && notificar) {
                foliosC.push(repFin.folio);
                localStorage.setItem(keyF, JSON.stringify(foliosC));

                let c = parseInt(localStorage.getItem(keyC) || "0");
                c++;                                                         // ⬆️ incrementa
                localStorage.setItem(keyC, String(c));                       // ✅ guarda como string

                if (badge) {
                    badge.textContent = String(c);                         // ✅ muestra como string
                    badge.style.display = "inline-block";
                }
            }

            /* ⑤ Refrescar tabla de completados si está visible */
            if (seccionVis === "reportes-completos" && typeof window.mostrarReportesCompletos === "function")
                window.mostrarReportesCompletos(1);
        });

        window[`listenerFinalizados_${userId}`] = true;              /* ✅ MOD */
    }

    /* ──────────────────────────────────
       8. Arranque
    ────────────────────────────────── */
    cargarReportes();
    filtrarReportes();   // primera visualización
});
