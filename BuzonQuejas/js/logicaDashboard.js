document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content"); // 🔥 Se agregó esta referencia
    const toggleBtn = document.getElementById("toggleSidebar");
    const hero = document.querySelector(".hero-animation");

    let animationInProgress = false; // 🔒 Evita interrupciones en la animación

    toggleBtn.addEventListener("click", function () {
        if (animationInProgress) return;
        animationInProgress = true;

        // 🔄 Reiniciar la animación eliminando todas las clases activas antes de iniciar
        hero.classList.remove("hero-fly-left", "hero-fly-left-end", "hero-fly-right", "hero-fly-right-end");
        hero.style.opacity = "1";
        hero.style.transform = "scale(1)";

        void hero.offsetWidth; // 🔥 Truco para reiniciar la animación correctamente

        if (sidebar.classList.contains("hidden")) {
            // 🟢 Mostrar sidebar y animar el héroe de IZQUIERDA → DERECHA
            hero.style.transform = "rotateY(0deg) scale(1)";
            hero.classList.add("hero-fly-right");

            setTimeout(() => {
                hero.style.transform = "rotateY(0deg) scale(1.5)";
                hero.classList.add("hero-fly-right-end");
            }, 100);

            sidebar.classList.remove("hidden");
            mainContent.classList.remove("expanded"); // 🔥 Asegurar que vuelva a la derecha cuando sidebar esté visible

            setTimeout(() => {
                hero.style.opacity = "0";
                animationInProgress = false;
            }, 1500);

            // 🔹 Cambiar icono del botón
            toggleBtn.innerHTML = "☰";

        } else {
            // 🔵 Ocultar sidebar y animar el héroe de DERECHA → IZQUIERDA
            hero.style.transform = "rotateY(180deg) scale(1)";
            hero.classList.add("hero-fly-left");

            setTimeout(() => {
                hero.style.transform = "rotateY(180deg) scale(1.5)";
                hero.classList.add("hero-fly-left-end");
            }, 100);

            setTimeout(() => {
                sidebar.classList.add("hidden");
                mainContent.classList.add("expanded"); // 🔥 Ahora el contenido se centrará cuando sidebar esté oculta
            }, 200);

            setTimeout(() => {
                hero.style.opacity = "0";
                animationInProgress = false;
            }, 1500);

            // 🔹 Cambiar icono del botón
            toggleBtn.innerHTML = "❯";
        }
    });

    // 🔥 FUNCIÓN RECUPERADA: Manejo de botones para cambiar secciones
    const botones = document.querySelectorAll(".sidebar a");
    const secciones = document.querySelectorAll(".main-content .content");

    // Función para mostrar una sección y ocultar las demás
    function mostrarSeccion(idSeccion) {
        // Ocultar todas las secciones
        secciones.forEach((seccion) => {
            seccion.style.display = "none";
        });

        // Mostrar la sección seleccionada
        const seccionActiva = document.getElementById(idSeccion);
        if (seccionActiva) {
            seccionActiva.style.display = "block";
        }

        // Cambiar el estilo del botón activo
        botones.forEach((boton) => boton.classList.remove("active"));
        const botonActivo = document.querySelector(`#btn-${idSeccion}`);
        if (botonActivo) {
            botonActivo.classList.add("active");
        }
    }

    // Mostrar la sección inicial por defecto
    mostrarSeccion("datos-personales");

    botones.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            e.preventDefault();
            const idSeccion = boton.id.replace("btn-", "");
            mostrarSeccion(idSeccion);

            // ✅ Si el usuario abrió "Reportes Completos", limpiar contador tipo Messenger
            if (idSeccion === "reportes-completos") {
                const badge = document.getElementById("contador-completos");
                if (badge) {
                    badge.textContent = "";
                    badge.style.display = "none";
                    localStorage.removeItem("contadorCompletos"); // 🧽 Borrar del almacenamiento
                }
            }
        });
    });

    // 🔁 Restaurar contador desde localStorage al cargar
    const badge = document.getElementById("contador-completos");
    let countGuardado = parseInt(localStorage.getItem("contadorCompletos") || "0");

    if (badge && countGuardado > 0) {
        badge.textContent = countGuardado.toString();
        badge.style.display = "inline-block";
    }
});
