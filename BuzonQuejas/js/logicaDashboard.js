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
        if (sidebar.classList.contains("hidden")) {
            // 🟢 Mostrar sidebar y hacer que el superhéroe vuele a la derecha
            hero.style.opacity = "1";
            hero.classList.remove("hero-fly-left", "hero-fly-left-end");
            hero.classList.add("hero-fly-right");

            setTimeout(() => {
                hero.classList.add("hero-fly-right-end"); // Hace que vuele más lento al final
            }, 500);

            sidebar.classList.remove("hidden");
            mainContent.classList.remove("expanded");

            setTimeout(() => {
                hero.style.opacity = "0"; // Se oculta al salir de la pantalla
            }, 2000);
        } else {
            // 🔵 Ocultar sidebar y hacer que el superhéroe vuele a la izquierda
            hero.style.opacity = "1";
            hero.classList.remove("hero-fly-right", "hero-fly-right-end");
            hero.classList.add("hero-fly-left");

            setTimeout(() => {
                hero.classList.add("hero-fly-left-end");
            }, 500);

            setTimeout(() => {
                sidebar.classList.add("hidden");
                mainContent.classList.add("expanded");
            }, 200);

            setTimeout(() => {
                hero.style.opacity = "0";
            }, 2000);
        }
    });

});

