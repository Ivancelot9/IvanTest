/* --- JS: js/descripcionReporte.js --- */
/**
 * @file descripcionReporte.js
 * @description
 * Inserta dinámicamente un modal para mostrar la descripción de un reporte.
 * Permite abrirse desde cualquier botón “Mostrar Descripción” con animación
 * de escala desde el punto del botón y cerrarse al pulsar la “X”.
 * También permite editar y guardar la descripción desde el modal.
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

    // 🔹 Definir la estructura interna: X de cierre, icono, título y contenido editable
    descripcionModal.innerHTML = `
    <div class="modal-content descripcion-modal">
        <span class="close-modal">&times;</span>
        <div class="modal-icon-header">
            <i class="fas fa-file-alt"></i>
            <span>Descripción del Reporte</span>
        </div>
        <div class="descripcion-container">
            <p id="descripcion-texto"></p>
            <textarea id="descripcion-editor" style="display: none;"></textarea>
        </div>
        <button id="editar-descripcion-btn" class="btn-editar">Editar</button>
    </div>
    `;

    // 🔹 Agregar el modal al final del <body>
    document.body.appendChild(descripcionModal);

    /* ─────────────────────────────────────────
       2. Referencias a elementos y estado global
    ───────────────────────────────────────── */
    let modalContent = descripcionModal.querySelector(".modal-content");
    let lastClickedButton = null;
    const btnEditar = document.getElementById("editar-descripcion-btn");
    const texto = document.getElementById("descripcion-texto");
    const editor = document.getElementById("descripcion-editor");

    /* ─────────────────────────────────────────
       3. Función de animación de apertura/cierre
    ───────────────────────────────────────── */
    function animarModal(abrir) {
        if (abrir) {
            if (!lastClickedButton) return;

            let rect = lastClickedButton.getBoundingClientRect();
            modalContent.style.transformOrigin =
                `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;

            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity   = "0";

            descripcionModal.style.display = "flex";
            setTimeout(() => {
                modalContent.classList.add("active");
                modalContent.style.transform = "scale(1)";
                modalContent.style.opacity   = "1";
            }, 10);

        } else {
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity   = "0";
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
            // Cancelar edición si estaba activa
            texto.style.display = "block";
            editor.style.display = "none";
            btnEditar.textContent = "Editar";
        });

    /* ─────────────────────────────────────────
       5. Delegación para abrir el modal
    ───────────────────────────────────────── */
    document.addEventListener("click", function (event) {
        if (!event.target.classList.contains("mostrar-descripcion")) return;

        lastClickedButton = event.target;

        const descripcion = lastClickedButton.getAttribute("data-descripcion") || "Sin descripción disponible.";
        texto.textContent = descripcion;
        editor.value = descripcion;

        texto.style.display = "block";
        editor.style.display = "none";
        btnEditar.textContent = "Editar";

        animarModal(true);
    });

    /* ─────────────────────────────────────────
       6. Editar y guardar contenido
    ───────────────────────────────────────── */
    btnEditar.addEventListener("click", () => {
        if (btnEditar.textContent === "Editar") {
            editor.value = texto.textContent.trim();
            texto.style.display = "none";
            editor.style.display = "block";
            btnEditar.textContent = "Guardar";
        } else {
            const nuevoTexto = editor.value.trim();
            texto.textContent = nuevoTexto || "Sin descripción disponible.";
            texto.style.display = "block";
            editor.style.display = "none";
            btnEditar.textContent = "Editar";

            // (Opcional) Actualizar el atributo del botón original
            if (lastClickedButton) {
                lastClickedButton.setAttribute("data-descripcion", nuevoTexto);
            }

            // (Opcional) Enviar a servidor con fetch si desea persistir
            // fetch('/guardar-descripcion.php', {
            //     method: 'POST',
            //     body: JSON.stringify({ folio: lastClickedButton.dataset.folio, nuevaDescripcion: nuevoTexto }),
            //     headers: { 'Content-Type': 'application/json' }
            // });
        }
    });
});
