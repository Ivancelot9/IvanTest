/* --- JS: js/tablaReportes.js --- */
/**
 * @file tablaReportes.js
 * @description
 * Gestión de reportes pendientes:
 *  – Carga inicial desde backend (PHP)
 *  – Paginación, filtros y resaltado dinámico
 *  – Actualización de estatus manual en tiempo real (BroadcastChannel)
 *  – Notificaciones de nuevos y finalizados
 *  – Sincronización de badges por usuario en localStorage
 *  – Debugging: console.log en listener de finalizados
 *
 * Requiere:
 *  – <body data-user-id="..."> para identificar usuario.
 *  – Elementos en el DOM:
 *      • #tabla-body, #prevPage, #nextPage, #pageIndicator
 *      • #filter-column, #filter-input, #filter-button
 *  – Botones en cada fila con clases:
 *      • .ver-estatus-btn, .mostrar-descripcion,
 *        .agregar-comentario, .seleccionar-fecha
 *  – Funciones y variables globales:
 *      • window.datosReportes, window.moverReporteACompletados()
 *      • SweetAlert2 (Swal) para alertas
 */

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       1. Constantes y variables globales
    ───────────────────────────────────────── */
    const userId           = document.body.getAttribute("data-user-id") || "default";
    const canal            = new BroadcastChannel("canalReportes");
    const canalFinalizados = new BroadcastChannel("canalFinalizados");

    // 1) nuevo canal para estatus manual
    const canalStatus = new BroadcastChannel("canalStatus");

    // 2) listener que actualiza el botón correspondiente cuando se guarda un estatus manual
    canalStatus.addEventListener("message", ({ data }) => {
        const { folio, progreso, color } = data;
        // busca el botón que tenga data-folio==folio
        const btn = document.querySelector(`.ver-estatus-btn[data-folio='${folio}']`);
        if (!btn) return;

        // aplica estilo + texto igual que en el modal:
        btn.style.backgroundColor = color;
        btn.textContent = `${progreso}%`;
        btn.classList.add("ver-estatus-circulo");
        // (opcional) podrías ajustar aquí textShadow, fontSize, etc.
    });

    const filasPorPagina   = 10;
    let   paginaActual     = 1;
    let   datosReportes    = [];   // todos los pendientes
    let   datosFiltrados   = [];   // filtrados/paginados

    // Exponer para uso en dashboard u otros scripts
    window.datosReportes = datosReportes;

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
        const foliosKey = `foliosContados_${userId}`;
        const vistos    = JSON.parse(localStorage.getItem(foliosKey) || "[]");

        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerReportesPendientes.php")
            .then(r => r.json())
            .then(data => {
                datosReportes    = data || [];
                datosFiltrados   = [...datosReportes];
                window.datosReportes = datosReportes;
                mostrarReportes(1);

                // Calcular cuántos nuevos desde la última carga
                const actuales = datosReportes.map(r => r.FolioReportes);
                const nuevos   = actuales.filter(folio => !vistos.includes(folio));

                const badge = document.getElementById("contador-historial");
                if (nuevos.length > 0) {
                    badge.textContent   = String(nuevos.length);
                    badge.style.display = "inline-block";
                } else {
                    badge.textContent   = "";
                    badge.style.display = "none";
                }
            })
            .catch(e => console.error("❌ Error al cargar reportes:", e));
    }

    /* ─────────────────────────────────────────
       4. Mostrar y paginar
    ───────────────────────────────────────── */
    function mostrarReportes(page = 1) {
        tablaBody.innerHTML = "";
        const start  = (page - 1) * filasPorPagina;
        const end    = start + filasPorPagina;
        const slice  = datosFiltrados.slice(start, end);
        const col    = filterColumn.value;
        const txt    = filterInput.value;

        slice.forEach(rep => {
            const folio = rep.FolioReportes || "S/F";

            // ---------------------------------------------------
            //  ↓↓↓ Aquí empieza la parte corregida ↓↓↓
            //
            //  Antes se calculaba automático o se asumía estatus existente.
            //  Ahora SOLO mostramos color/porcentaje si el usuario ya guardó
            //  manualmente una letra válida (G, B, Y o R). En cualquier otro
            //  caso, el botón sale por defecto "Ver Estatus" sin color.
            //
            const storageAll = JSON.parse(localStorage.getItem("estatusReportes") || "{}");
            const entry      = storageAll[folio] || {};

            //  Sólo existe círculo si entry.colorManual es una de las letras válidas
            const letrasValidas       = ["G", "B", "Y", "R"];
            const tieneEstatusManual  = letrasValidas.includes(entry.colorManual);
            const prog                = tieneEstatusManual ? entry.progresoManual : null;
            const colorCode           = tieneEstatusManual
                ? { G: "green", B: "blue", Y: "yellow", R: "red" }[entry.colorManual]
                : null;

            let btnHTML;
            if (tieneEstatusManual) {
                // Si ya hay un estatus manual, mostrará el círculo con porcentaje
                const circleStyle = `
    width:50px;height:50px;border-radius:50%;
    background:${colorCode};color:white;font-weight:bold;
    font-size:14px;text-shadow:2px 2px 0 black;
    border:3px solid black;margin:auto;
    display:flex;align-items:center;justify-content:center;`;
                btnHTML = `<button
         class="ver-estatus-btn ver-estatus-circulo"
         data-folio="${folio}"
         style="${circleStyle}">
           ${prog}% 
       </button>`;
            } else {
                // Si NO hay estatus manual, botón por defecto "Ver Estatus"
                const defaultStyle = `
    background:white;color:black;border:2px solid black;
    font-weight:bold;padding:4px 10px;margin:auto;`;
                btnHTML = `<button
         class="ver-estatus-btn"
         data-folio="${folio}"
         style="${defaultStyle}">
           Ver Estatus
       </button>`;
            }
            //  ↑↑↑ Aquí termina la parte corregida ↑↑↑
            // ---------------------------------------------------

            // Encargados (separar supervisor/shift leader para poder filtrar o resaltar)
            let [sup, sl] = (rep.Encargado || "N/A").split("<br>");
            sup = extraerTextoPlano(sup); sl = extraerTextoPlano(sl);
            if (col === "encargado") {
                sup = resaltarTexto(sup, txt);
                sl  = resaltarTexto(sl,  txt);
            }

            const row = document.createElement("tr");
            row.dataset.folio = String(folio);
            row.innerHTML = `
    <td>${col === "folio"
                ? resaltarTexto(folio, txt)
                : folio
            }</td>
    <td>${col === "fechaRegistro"
                ? resaltarTexto(formatearFecha(rep.FechaRegistro), txt)
                : formatearFecha(rep.FechaRegistro)
            }</td>
    <td>${col === "nomina"
                ? resaltarTexto(rep.NumeroNomina || "Sin nómina", txt)
                : (rep.NumeroNomina || "Sin nómina")
            }</td>
    <td>${rep.Area || "Sin área"}</td>
    <td class="celda-encargado">${sup}<br>${sl}</td>
   <td>
  <button class="mostrar-descripcion"
          data-descripcion="${rep.Descripcion || 'Sin descripción'}"
          data-folioreportes="${rep.FolioReportes}">
    Mostrar Descripción
  </button>
</td>
    <td>
        <button class="agregar-comentario" data-folio="${folio}">
            Agregar Comentario
        </button>
    </td>
    <td class="estatus-cell">${btnHTML}</td>
    <td>
        <button class="seleccionar-fecha" data-folio="${folio}">
            Finalizar Reporte
        </button>
    </td>`;
            tablaBody.appendChild(row);
        });

        pageIndicator.textContent    = `Página ${page}`;
        prevPageBtn.disabled         = page === 1;
        nextPageBtn.disabled         = end >= datosFiltrados.length;
        paginaActual                 = page;
    }

    /* ─────────────────────────────────────────
       5. Filtros y eventos de paginación
    ───────────────────────────────────────── */
    function filtrarReportes() {
        const f  = filterInput.value.trim().toLowerCase();
        const c  = filterColumn.value;
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

    prevPageBtn.addEventListener("click", () => {
        if (paginaActual > 1) mostrarReportes(--paginaActual);
    });
    nextPageBtn.addEventListener("click", () => {
        if (paginaActual * filasPorPagina < datosFiltrados.length) mostrarReportes(++paginaActual);
    });
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
            .then(rep => {
                if (rep?.FolioReportes) agregarReporte(rep);
            });
    });

    function agregarReporte(rep) {
        // 1. Agregar al array y exponer globalmente
        datosReportes.push(rep);
        window.datosReportes = datosReportes;

        // 2. Ordenar por fecha descendente y refrescar la vista
        datosReportes.sort((a, b) => new Date(b.FechaRegistro) - new Date(a.FechaRegistro));
        filtrarReportes();

        // 3. Animación de entrada (solo un efecto visual)
        const first = tablaBody.querySelector("tr");
        if (first) {
            first.classList.add("nueva-fila");
            setTimeout(() => first.classList.remove("nueva-fila"), 2000);
        }

        // 4. Registrar este folio como “nuevo pendiente” para resalte al entrar
        window.nuevosPendientes = window.nuevosPendientes || new Set();
        window.nuevosPendientes.add(String(rep.FolioReportes));

        // 5. Actualizar badge de historial si no estamos en esa sección
        const vis = document.querySelector(".main-content .content:not([style*='display: none'])")?.id;
        if (vis !== "historial-reportes") {
            const badge = document.getElementById("contador-historial");
            const kF    = `foliosContados_${userId}`;
            const kC    = `contadorHistorial_${userId}`;
            let fV      = JSON.parse(localStorage.getItem(kF) || "[]");
            if (!fV.includes(rep.FolioReportes)) {
                fV.push(rep.FolioReportes);
                localStorage.setItem(kF, JSON.stringify(fV));
                let c = parseInt(localStorage.getItem(kC) || "0");
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
            const repFin = event.data;

            // Filtro inicial: no procesar si es del mismo usuario o ya procesado
            if (!repFin?.folio
                || repFin.origen === userId
                || window.foliosFinalizados.has(repFin.folio)
            ) return;

            // Marcar como procesado
            window.foliosFinalizados.add(repFin.folio);

            // Eliminar de pendientes y re-renderizar
            const folioStr = String(repFin.folio);
            datosReportes    = datosReportes.filter(r => String(r.FolioReportes) !== folioStr);
            datosFiltrados   = datosFiltrados.filter(r => String(r.FolioReportes) !== folioStr);
            window.datosReportes = datosReportes;
            mostrarReportes(paginaActual);

            // Mover a completados
            const vis2  = document.querySelector(".main-content .content:not([style*='display: none'])")?.id;
            const notify = vis2 !== "reportes-completos";
            if (typeof window.moverReporteACompletados === "function") {
                window.moverReporteACompletados(repFin, notify);
            }

            // Si completados está abierta, solo marcarlo como “visto”
            if (vis2 === "reportes-completos") {
                const keyF  = `foliosContadosCompletos_${userId}`;
                let foliosC = JSON.parse(localStorage.getItem(keyF) || "[]");
                if (!foliosC.includes(repFin.folio)) {
                    foliosC.push(repFin.folio);
                    localStorage.setItem(keyF, JSON.stringify(foliosC));
                }
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
