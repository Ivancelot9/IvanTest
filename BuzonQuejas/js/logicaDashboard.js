// logicaDashboard.js
document.addEventListener("DOMContentLoaded", function () {
    /* ────────────────────────────────────────────────────────────── */
    /* Datos base y elementos                                         */
    /* ────────────────────────────────────────────────────────────── */
    const userId      = document.body.getAttribute("data-user-id") || "default";
    const sidebar     = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const toggleBtn   = document.getElementById("toggleSidebar");
    const hero        = document.querySelector(".hero-animation");
    const botones     = document.querySelectorAll(".sidebar a");
    const secciones   = document.querySelectorAll(".main-content .content");

    /* ────────────────────────────────────────────────────────────── */
    /* Inicializar Sets globales para resaltado                       */
    /* ────────────────────────────────────────────────────────────── */
    window.nuevosPendientes  = window.nuevosPendientes  || new Set();
    window.nuevosCompletados = window.nuevosCompletados || new Set();

    /* ✅ Limpiar badges antiguos que daban errores                    */
    localStorage.removeItem("contadorCompletos");
    localStorage.removeItem("contadorHistorial");

    let animationInProgress = false;

    /* ────────────────────────────────────────────────────────────── */
    /* Animación apertura / cierre de sidebar                         */
    /* ────────────────────────────────────────────────────────────── */
    toggleBtn.addEventListener("click", function () {
        if (animationInProgress) return;
        animationInProgress = true;
        hero.classList.remove(
            "hero-fly-left","hero-fly-left-end",
            "hero-fly-right","hero-fly-right-end"
        );
        hero.style.opacity   = "1";
        hero.style.transform = "scale(1)";
        void hero.offsetWidth;

        if (sidebar.classList.contains("hidden")) {
            // ABRIR
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
            // CERRAR
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

    /* ────────────────────────────────────────────────────────────── */
    /* Funciones de resaltado                                          */
    /* ────────────────────────────────────────────────────────────── */
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

    /* ────────────────────────────────────────────────────────────── */
    /* Navegación entre secciones                                     */
    /* ────────────────────────────────────────────────────────────── */
    function mostrarSeccion(id) {
        // ocultar todas
        secciones.forEach(sec => sec.style.display = "none");
        // mostrar la activa
        const activa = document.getElementById(id);
        if (activa) activa.style.display = "block";
        // marcar botón activo
        botones.forEach(b => b.classList.remove("active"));
        const btn = document.querySelector(`#btn-${id}`);
        if (btn) btn.classList.add("active");

        // al entrar a historial de pendientes
        if (id === "historial-reportes") {
            // limpiar badge
            const bh = document.getElementById("contador-historial");
            if (bh) {
                bh.textContent   = "";
                bh.style.display = "none";
                // marcar vistos en storage
                const fols = window.datosReportes.map(r => r.FolioReportes);
                localStorage.setItem(`foliosContados_${userId}`, JSON.stringify(fols));
                localStorage.setItem(`contadorHistorial_${userId}`, "0");
            }
            // resaltar llegadas
            highlightPendientes();
        }

        // al entrar a completados
        if (id === "reportes-completos") {
            // limpiar badge
            const bc = document.getElementById("contador-completos");
            if (bc) {
                bc.textContent   = "";
                bc.style.display = "none";
                // marcar vistos en storage
                const fols = window.datosReportesCompletos.map(r => r.folio);
                localStorage.setItem(`foliosContadosCompletos_${userId}`, JSON.stringify(fols));
                localStorage.setItem(`contadorCompletos_${userId}`, "0");
            }
            // resaltar finalizaciones
            highlightCompletados();
        }
    }

    // inicializa seccion
    mostrarSeccion("datos-personales");

    // click en menú
    botones.forEach(boton => {
        boton.addEventListener("click", e => {
            e.preventDefault();
            const idSeccion = boton.id.replace("btn-", "");
            mostrarSeccion(idSeccion);
        });
    });

    /* ────────────────────────────────────────────────────────────── */
    /* Restaurar contadores al cargar                                 */
    /* ────────────────────────────────────────────────────────────── */
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
