/* --- JS: js/descripcionReporte.js --- */
/**
 * @file descripcionReporte.js
 * @description
 * Inserta dinámicamente un modal para mostrar la descripción de un reporte.
 * Permite abrirse desde cualquier botón “Mostrar Descripción” con animación
 * de escala desde el punto del botón y cerrarse al pulsar la “X”.
 *
 * Requiere:
 *  - Botones con clase "mostrar-descripcion" y atributo data-descripcion
 *  - Font Awesome cargado para el icono de archivo
 */

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       1. Creación y configuración del modal
    ───────────────────────────────────────── */
    // 🔹 Crear el contenedor principal del modal
    let descripcionModal = document.createElement("div");
    descripcionModal.id = "descripcion-modal";
    descripcionModal.style.display = "none"; // Oculto por defecto

    // 🔹 Definir la estructura interna: X de cierre, icono, título y párrafo para la descripción
    descripcionModal.innerHTML = `
    <div class="modal-content descripcion-modal">
        <span class="close-modal">&times;</span>
        <div class="modal-icon-header">
            <i class="fas fa-file-alt"></i>
            <span>Descripción del Reporte</span>
        </div>
        <div class="descripcion-container">
            <p id="descripcion-texto"></p>
        </div>
    </div>
    `;

    // 🔹 Agregar el modal al final del <body>
    document.body.appendChild(descripcionModal);

    /* ─────────────────────────────────────────
       2. Referencias a elementos y estado global
    ───────────────────────────────────────── */
    // Elemento que contiene la caja blanca del modal
    let modalContent = descripcionModal.querySelector(".modal-content");
    // Botón que abrió el modal (punto de origen de la animación)
    let lastClickedButton = null;

    /* ─────────────────────────────────────────
       3. Función de animación de apertura/cierre
    ───────────────────────────────────────── */
    function animarModal(abrir) {
        if (abrir) {
            // ❗ Si no sabemos desde dónde abrir, salimos
            if (!lastClickedButton) return;

            // 🔹 Obtener posición y tamaño del botón origen
            let rect = lastClickedButton.getBoundingClientRect();
            // 🔹 Ajustar el transform-origin al centro de ese botón
            modalContent.style.transformOrigin =
                `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;

            // 🔹 Partir desde escala 0 y opacidad 0
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity   = "0";

            // 🔹 Mostrar el contenedor del modal
            descripcionModal.style.display = "flex";
            // ✨ Pequeño retraso para que la transición CSS se active
            setTimeout(() => {
                modalContent.classList.add("active");
                modalContent.style.transform = "scale(1)";
                modalContent.style.opacity   = "1";
            }, 10);

        } else {
            // 🔹 Escala a 0 y opacidad 0 para cerrar
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity   = "0";
            // 🔹 Tras la duración de la transición, ocultar el contenedor
            setTimeout(() => {
                modalContent.classList.remove("active");
                descripcionModal.style.display = "none";
            }, 300);
        }
    }

    /* ─────────────────────────────────────────
       4. Evento de cierre al pulsar la “X”
    ───────────────────────────────────────── */
    descripcionModal.querySelector(".close-modal")
        .addEventListener("click", function () {
            animarModal(false);
        });

    /* ─────────────────────────────────────────
       5. Delegación para abrir el modal
    ───────────────────────────────────────── */
    document.addEventListener("click", function (event) {
        // 🔹 Solo reaccionar a botones con clase "mostrar-descripcion"
        if (!event.target.classList.contains("mostrar-descripcion")) return;

        // ✔️ Guardar la referencia del botón que disparó el evento
        lastClickedButton = event.target;

        // 🔹 Mostrar la descripción obtenida del atributo data-descripcion
        document.getElementById("descripcion-texto").textContent =
            lastClickedButton.getAttribute("data-descripcion") || "Sin descripción disponible.";

        // 🔹 Abrir y animar el modal desde el botón origen
        animarModal(true);
    });
});
