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