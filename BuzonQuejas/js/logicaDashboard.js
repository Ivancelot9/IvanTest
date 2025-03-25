document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const toggleBtn = document.getElementById("toggleSidebar");
    const hero = document.querySelector(".hero-animation");

    let animationInProgress = false;

    toggleBtn.addEventListener("click", function () {
        if (animationInProgress) return;
        animationInProgress = true;

        hero.classList.remove("hero-fly-left", "hero-fly-left-end", "hero-fly-right", "hero-fly-right-end");
        hero.style.opacity = "1";
        hero.style.transform = "scale(1)";
        void hero.offsetWidth;

        if (sidebar.classList.contains("hidden")) {
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
        } else {
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

    const botones = document.querySelectorAll(".sidebar a");
    const secciones = document.querySelectorAll(".main-content .content");

    function mostrarSeccion(idSeccion) {
        secciones.forEach((seccion) => {
            seccion.style.display = "none";
        });

        const seccionActiva = document.getElementById(idSeccion);
        if (seccionActiva) {
            seccionActiva.style.display = "block";
        }

        botones.forEach((boton) => boton.classList.remove("active"));
        const botonActivo = document.querySelector(`#btn-${idSeccion}`);
        if (botonActivo) {
            botonActivo.classList.add("active");
        }
    }

    mostrarSeccion("datos-personales");

    botones.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            e.preventDefault();
            const idSeccion = boton.id.replace("btn-", "");
            mostrarSeccion(idSeccion);

            if (idSeccion === "reportes-completos") {
                const badge = document.getElementById("contador-completos");
                if (badge) {
                    badge.textContent = "";
                    badge.style.display = "none";
                    localStorage.removeItem("contadorCompletos");
                }
            }

            if (idSeccion === "historial-reportes") {
                const badgeHistorial = document.getElementById("contador-historial");
                if (badgeHistorial) {
                    badgeHistorial.textContent = "";
                    badgeHistorial.style.display = "none";
                    localStorage.removeItem("contadorHistorial");
                }
            }
        });
    });

    // 🔁 Restaurar contadores al cargar
    const badge = document.getElementById("contador-completos");
    let countGuardado = parseInt(localStorage.getItem("contadorCompletos") || "0");
    if (badge && countGuardado > 0) {
        badge.textContent = countGuardado.toString();
        badge.style.display = "inline-block";
    }

    const badgeHistorial = document.getElementById("contador-historial");
    let countHistorial = parseInt(localStorage.getItem("contadorHistorial") || "0");
    if (badgeHistorial && countHistorial > 0) {
        badgeHistorial.textContent = countHistorial.toString();
        badgeHistorial.style.display = "inline-block";
    }

    // ✅ BroadcastChannel para recibir reportes en tiempo real
    const canal = new BroadcastChannel("canalReportes");

    canal.addEventListener("message", (event) => {
        const mensaje = event.data;

        if (mensaje.tipo === "nuevo-reporte" && mensaje.data) {
            const nuevo = mensaje.data;

            // Solo actualizamos si existe la función y los datos clave no son undefined
            if (
                typeof window.agregarReporteAHistorial === "function" &&
                nuevo.folio !== undefined &&
                nuevo.nomina !== undefined
            ) {
                window.agregarReporteAHistorial(nuevo);

                // ✅ Actualizar contador de historial
                let count = parseInt(localStorage.getItem("contadorHistorial") || "0");
                count++;
                localStorage.setItem("contadorHistorial", count.toString());

                if (badgeHistorial) {
                    badgeHistorial.textContent = count.toString();
                    badgeHistorial.style.display = "inline-block";
                }
            } else {
                console.warn("⚠ Reporte recibido sin datos válidos:", mensaje.data);
            }
        }
    });
});
