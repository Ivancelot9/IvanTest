// Seleccionar botones y secciones
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
    seccionActiva.style.display = "block";

    // Cambiar el estilo del botón activo
    botones.forEach((boton) => boton.classList.remove("active"));
    const botonActivo = document.querySelector(`#btn-${idSeccion}`);
    botonActivo.classList.add("active");
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


document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const toggleBtn = document.getElementById("toggleSidebar");
    const hero = document.querySelector(".hero-animation");

    toggleBtn.addEventListener("click", function () {
        // Forzar reinicio de la animación eliminando todas las clases activas antes de iniciar
        hero.classList.remove("hero-fly-left", "hero-fly-left-end", "hero-fly-right", "hero-fly-right-end");
        void hero.offsetWidth; // 🔥 Truco para reiniciar la animación correctamente

        if (sidebar.classList.contains("hidden")) {
            // 🟢 Mostrar sidebar y hacer que el superhéroe vuele a la derecha
            hero.style.opacity = "1";
            hero.classList.add("hero-fly-right");

            setTimeout(() => {
                hero.classList.add("hero-fly-right-end");
            }, 100);

            sidebar.classList.remove("hidden");
            mainContent.classList.remove("expanded");

            setTimeout(() => {
                hero.style.opacity = "0";
            }, 1500);

            // 🔹 Ajustar el botón cuando la sidebar está visible
            toggleBtn.style.left = "16px"; // Botón en la esquina izquierda
            toggleBtn.style.top = "16px";
            toggleBtn.innerHTML = "☰"; // Icono de menú

        } else {
            // 🔵 Ocultar sidebar y hacer que el superhéroe vuele a la izquierda
            hero.style.opacity = "1";
            hero.classList.add("hero-fly-left");

            setTimeout(() => {
                hero.classList.add("hero-fly-left-end");
            }, 100);

            setTimeout(() => {
                sidebar.classList.add("hidden");
                mainContent.classList.add("expanded");
            }, 200);

            setTimeout(() => {
                hero.style.opacity = "0";
            }, 1500);

            // 🔹 Ajustar el botón cuando la sidebar está oculta
            toggleBtn.style.left = "350px"; // Mueve el botón a la derecha
            toggleBtn.innerHTML = "❯"; // Cambia el ícono a una flecha
        }
    });


    // 🔴 Funcionalidad para el botón de Cerrar Sesión
    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", function (e) {
            e.preventDefault(); // Evita que recargue la página

            // 🔥 Aquí podrías agregar lógica para eliminar la sesión del usuario
            alert("Cerrando sesión...");

            // Redirigir a la página de login o inicio
            window.location.href = "index.php"; // Cambia esto por tu página de login
        });
    }


});

