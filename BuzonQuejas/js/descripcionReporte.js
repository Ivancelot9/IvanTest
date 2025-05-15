/* --- JS: js/descripcionReporte.js --- */
/**
 * @file descripcionReporte.js
 * @description
 * Inserta dinámicamente un modal para mostrar y editar la descripción de un reporte.
 * Permite abrirse desde cualquier botón “Mostrar Descripción” con animación
 * de escala desde el punto del botón y cerrarse al pulsar la “X”.
 * También permite editar, guardar y persistir la descripción en la base de datos.
 *
 * Requiere:
 *  - Botones con clase "mostrar-descripcion" y atributos:
 *      • data-descripcion (texto actual)
 *      • data-folioreportes (folio del reporte)
 *  - Endpoint PHP "actualizarDescripcion.php" que reciba JSON:
 *      { FolioReportes: int, Descripcion: string }
 *  - Font Awesome cargado para el icono de archivo
 */

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       1. Creación y configuración del modal
    ───────────────────────────────────────── */
    let descripcionModal = document.createElement("div");
    descripcionModal.id = "descripcion-modal";
    descripcionModal.style.display = "none";

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

    document.body.appendChild(descripcionModal);

    /* ─────────────────────────────────────────
       2. Referencias y estado global
    ───────────────────────────────────────── */
    let modalContent         = descripcionModal.querySelector(".modal-content");
    let lastClickedButton    = null;
    let folioActual          = null;
    const btnEditar          = document.getElementById("editar-descripcion-btn");
    const texto              = document.getElementById("descripcion-texto");
    const editor             = document.getElementById("descripcion-editor");

    /* ─────────────────────────────────────────
       3. Animación apertura / cierre
    ───────────────────────────────────────── */
    function animarModal(abrir) {
        if (abrir) {
            if (!lastClickedButton) return;
            let rect = lastClickedButton.getBoundingClientRect();
            modalContent.style.transformOrigin =
                `${rect.left + rect.width/2}px ${rect.top + rect.height/2}px`;
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
       4. Cerrar modal al pulsar “X”
    ───────────────────────────────────────── */
    descripcionModal.querySelector(".close-modal")
        .addEventListener("click", () => {
            animarModal(false);
            texto.style.display         = "block";
            editor.style.display        = "none";
            btnEditar.textContent       = "Editar";
        });

    /* ─────────────────────────────────────────
       5. Abrir modal desde botón
    ───────────────────────────────────────── */
    document.addEventListener("click", function (event) {
        if (!event.target.classList.contains("mostrar-descripcion")) return;

        lastClickedButton = event.target;
        folioActual       = lastClickedButton.dataset.folioreportes;

        const descripcion = lastClickedButton.getAttribute("data-descripcion")
            || "Sin descripción disponible.";
        texto.textContent = descripcion;
        editor.value      = descripcion;

        texto.style.display   = "block";
        editor.style.display  = "none";
        btnEditar.textContent = "Editar";

        animarModal(true);
    });

    /* ─────────────────────────────────────────
       6. Editar y guardar (con persistencia)
    ───────────────────────────────────────── */
    btnEditar.addEventListener("click", () => {
        if (btnEditar.textContent === "Editar") {
            editor.value        = texto.textContent.trim();
            texto.style.display = "none";
            editor.style.display= "block";
            btnEditar.textContent = "Guardar";
        } else {
            const nuevoTexto = editor.value.trim();
            texto.textContent = nuevoTexto || "Sin descripción disponible.";
            texto.style.display  = "block";
            editor.style.display = "none";
            btnEditar.textContent = "Editar";

            // Actualizar atributo data para futuras ediciones
            if (lastClickedButton) {
                lastClickedButton.setAttribute("data-descripcion", nuevoTexto);
            }

            // Enviar al servidor para persistir en BD
            fetch('actualizarDescripcion.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    FolioReportes: folioActual,
                    Descripcion:   nuevoTexto
                })
            })
                .then(res => res.json())
                .then(json => {
                    if (json.status === 'success') {
                        console.log('✅ Descripción actualizada en BD');
                    } else {
                        alert('❌ Error al actualizar: ' + json.message);
                    }
                })
                .catch(err => {
                    alert('❌ No se pudo conectar al servidor: ' + err);
                });
        }
    });

});
