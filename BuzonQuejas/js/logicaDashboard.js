document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
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

    // Agregar eventos de clic a los botones
    botones.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            e.preventDefault(); // Prevenir comportamiento predeterminado del enlace
            const idSeccion = boton.id.replace("btn-", ""); // Obtener el ID de la sección
            mostrarSeccion(idSeccion);
        });
    });
});
