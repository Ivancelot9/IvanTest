document.addEventListener("DOMContentLoaded", function () {
    /* ────────────────────────────────────────────────────────────── */
    /* Datos base y elementos                                         */
    /* ────────────────────────────────────────────────────────────── */

    /* ✅ MOD (1): obtenemos el userId una sola vez y lo usamos en todo el script */
    const userId = document.body.getAttribute("data-user-id") || "default";

    const sidebar      = document.querySelector(".sidebar");
    const mainContent  = document.querySelector(".main-content");
    const toggleBtn    = document.getElementById("toggleSidebar");
    const hero         = document.querySelector(".hero-animation");
    const botones      = document.querySelectorAll(".sidebar a");
    const secciones    = document.querySelectorAll(".main-content .content");

    /* ✅ MOD (2): limpiamos claves antiguas que causaban números fantasma */
    localStorage.removeItem("contadorCompletos");
    localStorage.removeItem("contadorHistorial");

    let animationInProgress = false;

    /* ────────────────────────────────────────────────────────────── */
    /* Animación de apertura / cierre de sidebar                      */
    /* ────────────────────────────────────────────────────────────── */

    toggleBtn.addEventListener("click", function () {
        if (animationInProgress) return;
        animationInProgress = true;

        hero.classList.remove(
            "hero-fly-left",
            "hero-fly-left-end",
            "hero-fly-right",
            "hero-fly-right-end"
        );
        hero.style.opacity  = "1";
        hero.style.transform = "scale(1)";
        void hero.offsetWidth; // reset CSS animation

        if (sidebar.classList.contains("hidden")) {             // → ABRIR
            hero.style.transform = "rotateY(0deg) scale(1)";
            hero.classList.add("hero-fly-right");
            setTimeout(() => {
                hero.style.transform = "rotateY(0deg) scale(1.5)";
                hero.classList.add("hero-fly-right-end");
            }, 100);

            sidebar.classList.remove("hidden");
            mainContent.classList.remove("expanded");

            setTimeout(() => {
                hero.style.opacity = "0";
                animationInProgress = false;
            }, 1500);

            toggleBtn.innerHTML = "☰";
        } else {                                              // → CERRAR
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

            setTimeout(() => {
                hero.style.opacity = "0";
                animationInProgress = false;
            }, 1500);

            toggleBtn.innerHTML = "❯";
        }
    });

    /* ────────────────────────────────────────────────────────────── */
    /* Navegación entre secciones                                     */
    /* ────────────────────────────────────────────────────────────── */

    function mostrarSeccion(idSeccion) {
        secciones.forEach(sec => (sec.style.display = "none"));

        const seccionActiva = document.getElementById(idSeccion);
        if (seccionActiva) seccionActiva.style.display = "block";

        botones.forEach(btn => btn.classList.remove("active"));
        const botonActivo = document.querySelector(`#btn-${idSeccion}`);
        if (botonActivo) botonActivo.classList.add("active");
    }

    mostrarSeccion("datos-personales"); // sección inicial

    botones.forEach(boton => {
        boton.addEventListener("click", e => {
            e.preventDefault();
            const idSeccion = boton.id.replace("btn-", "");
            mostrarSeccion(idSeccion);

            /* ✅ MOD (3): ya NO redeclaramos userId — usamos la var global */

            /* ── Sección: Reportes Completos ───────────────────────── */
            if (idSeccion === "reportes-completos") {
                const badge = document.getElementById("contador-completos");
                if (badge) {
                    badge.textContent = "";
                    badge.style.display = "none";

                    // Guardar como “vistos” los folios actualmente visibles
                    const reportesVisibles = window.datosReportesCompletos || [];
                    const foliosVistos = reportesVisibles.map(r => r.folio);
                    localStorage.setItem(
                        `foliosContadosCompletos_${userId}`,
                        JSON.stringify(foliosVistos)
                    );

                    // Reiniciar contador
                    localStorage.setItem(`contadorCompletos_${userId}`, "0");
                }
            }

            /* ── Sección: Historial de Reportes ───────────────────── */
            if (idSeccion === "historial-reportes") {
                const badgeHist = document.getElementById("contador-historial");
                if (badgeHist) {
                    badgeHist.textContent = "";
                    badgeHist.style.display = "none";
                    localStorage.setItem(`contadorHistorial_${userId}`, "0");
                    localStorage.setItem(`foliosContados_${userId}`, JSON.stringify([]));
                }
            }
        });
    });

    /* ────────────────────────────────────────────────────────────── */
    /* Restaurar contadores al cargar                                 */
    /* ────────────────────────────────────────────────────────────── */

    /* ✅ MOD (4): leemos SIEMPRE usando la clave con userId para evitar “13” */
    const badgeCompletos = document.getElementById("contador-completos");
    const countCompletos = parseInt(
        localStorage.getItem(`contadorCompletos_${userId}`) || "0"
    );
    if (badgeCompletos && countCompletos > 0) {
        badgeCompletos.textContent = countCompletos.toString();
        badgeCompletos.style.display = "inline-block";
    }

    const badgeHistorial = document.getElementById("contador-historial");
    const countHistorial = parseInt(
        localStorage.getItem(`contadorHistorial_${userId}`) || "0"
    );
    if (badgeHistorial && countHistorial > 0) {
        badgeHistorial.textContent = countHistorial.toString();
        badgeHistorial.style.display = "inline-block";
    }
});
