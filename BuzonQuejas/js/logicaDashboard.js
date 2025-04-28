/* --- JS: js/logicaDashboard.js --- */
/**
 * @file logicaDashboard.js
 * @description
 * Gestiona la interacción y navegación del dashboard de reportes:
 *  1. Controla la apertura/cierre de la sidebar con animaciones.
 *  2. Resalta nuevas filas en tablas de pendientes y completados.
 *  3. Navega entre secciones y actualiza badges de notificaciones.
 *  4. Restaura contadores y visibilidad de badges al cargar la página.
 *
 * Requiere:
 *  - Elementos en el DOM:
 *      • data-user-id en <body>
 *      • .sidebar, .main-content, #toggleSidebar, .hero-animation
 *      • enlaces .sidebar a con IDs "btn-<seccion>"
 *      • secciones .main-content .content con IDs respectivos
 *      • tablas con <tr data-folio> en #tabla-body y #tabla-completos-body
 *  - Variables globales:
 *      • window.datosReportes (array de reportes pendientes)
 *      • window.datosReportesCompletos (array de reportes completados)
 */

document.addEventListener("DOMContentLoaded", function () {
    /* ─────────────────────────────────────────
       1. Variables globales y referencias al DOM
    ───────────────────────────────────────── */
    const userId      = document.body.getAttribute("data-user-id") || "default";
    const sidebar     = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const toggleBtn   = document.getElementById("toggleSidebar");
    const hero        = document.querySelector(".hero-animation");
    const botones     = document.querySelectorAll(".sidebar a");
    const secciones   = document.querySelectorAll(".main-content .content");

    /* ─────────────────────────────────────────
       2. Inicializar sets para destacar nuevos
    ───────────────────────────────────────── */
    window.nuevosPendientes  = window.nuevosPendientes  || new Set();
    window.nuevosCompletados = window.nuevosCompletados || new Set();

    // Limpiar badges antiguos en localStorage
    localStorage.removeItem("contadorCompletos");
    localStorage.removeItem("contadorHistorial");

    let animationInProgress = false;

    /* ─────────────────────────────────────────
       3. Animación apertura/cierre de sidebar
    ───────────────────────────────────────── */
    toggleBtn.addEventListener("click", function () {
        if (animationInProgress) return;
        animationInProgress = true;

        // Resetear clases de animación
        hero.classList.remove(
            "hero-fly-left","hero-fly-left-end",
            "hero-fly-right","hero-fly-right-end"
        );
        hero.style.opacity   = "1";
        hero.style.transform = "scale(1)";
        void hero.offsetWidth; // Forzar repaint

        if (sidebar.classList.contains("hidden")) {
            // Abrir sidebar
            hero.style.transform = "rotateY(0deg) scale(1)";
            hero.classList.add("hero-fly-right");
            setTimeout(() => {
                hero.style.transform = "rotateY(0deg) scale(1.5)";
                hero.classList.add("hero-fly-right-end");
            }, 100);
            sidebar.classList.remove("hidden");
            mainContent.classList.remove("expanded");
            setTimeout(() => { hero.style.opacity = "0"; animationInProgress = false; }, 1500);
            toggleBtn.innerHTML = "☰";
        } else {
            // Cerrar sidebar
            hero.style.transform = "rotateY(180deg) scale(1)";
            hero.classList.add("hero-fly-left");
            setTimeout(() => {
                hero.style.transform = "rotateY(180deg) scale(1.5)";
                hero.classList.add("hero-fly-left-end");
            }, 100);
            setTimeout(() => {
                sidebar.classList.add("hidden");
                mainContent.classList.add("expanded");
            }, 200);
            setTimeout(() => { hero.style.opacity = "0"; animationInProgress = false; }, 1500);
            toggleBtn.innerHTML = "❯";
        }
    });

    /* ─────────────────────────────────────────
       4. Funciones para resaltar nuevas filas
    ───────────────────────────────────────── */
    function highlightPendientes() {
        document.querySelectorAll("#tabla-body tr").forEach(fila => {
            const folio = fila.dataset.folio;
            if (window.nuevosPendientes.has(folio)) {
                fila.classList.add("resaltar-nuevo");
                setTimeout(() => fila.classList.remove("resaltar-nuevo"), 4000);
            }
        });
        window.nuevosPendientes.clear();
    }
    function highlightCompletados() {
        document.querySelectorAll("#tabla-completos-body tr").forEach(fila => {
            const folio = fila.dataset.folio;
            if (window.nuevosCompletados.has(folio)) {
                fila.classList.add("resaltar-completado");
                setTimeout(() => fila.classList.remove("resaltar-completado"), 4000);
            }
        });
        window.nuevosCompletados.clear();
    }

    /* ─────────────────────────────────────────
       5. Navegación entre secciones
    ───────────────────────────────────────── */
    function mostrarSeccion(id) {
        // Ocultar todas
        secciones.forEach(sec => sec.style.display = "none");
        // Mostrar sección activa
        const activa = document.getElementById(id);
        if (activa) activa.style.display = "block";
        // Marcar botón activo
        botones.forEach(b => b.classList.remove("active"));
        const btn = document.querySelector(`#btn-${id}`);
        if (btn) btn.classList.add("active");

        if (id === "historial-reportes") {
            // Limpiar badge de pendientes
            const bh = document.getElementById("contador-historial");
            if (bh) {
                bh.textContent   = "";
                bh.style.display = "none";
                // Marcar todos como vistos
                const fols = window.datosReportes.map(r => r.FolioReportes);
                localStorage.setItem(`foliosContados_${userId}`, JSON.stringify(fols));
                localStorage.setItem(`contadorHistorial_${userId}`, "0");
            }
            highlightPendientes();
        }

        if (id === "reportes-completos") {
            // Limpiar badge de completados
            const bc = document.getElementById("contador-completos");
            if (bc) {
                bc.textContent   = "";
                bc.style.display = "none";
                const fols = window.datosReportesCompletos.map(r => r.folio);
                localStorage.setItem(`foliosContadosCompletos_${userId}`, JSON.stringify(fols));
                localStorage.setItem(`contadorCompletos_${userId}`, "0");
            }
            highlightCompletados();
        }
    }
    // Inicializar sección por defecto
    mostrarSeccion("datos-personales");

    // Asignar evento a botones del menú
    botones.forEach(boton => {
        boton.addEventListener("click", e => {
            e.preventDefault();
            const idSeccion = boton.id.replace("btn-", "");
            mostrarSeccion(idSeccion);
        });
    });

    /* ─────────────────────────────────────────
       6. Restaurar contadores de badges al cargar
    ───────────────────────────────────────── */
    const badgeC = document.getElementById("contador-completos");
    const cntC   = parseInt(localStorage.getItem(`contadorCompletos_${userId}`) || "0", 10);
    if (badgeC && cntC > 0) {
        badgeC.textContent   = cntC.toString();
        badgeC.style.display = "inline-block";
    }
    const badgeH = document.getElementById("contador-historial");
    const cntH   = parseInt(localStorage.getItem(`contadorHistorial_${userId}`) || "0", 10);
    if (badgeH && cntH > 0) {
        badgeH.textContent   = cntH.toString();
        badgeH.style.display = "inline-block";
    }
});
