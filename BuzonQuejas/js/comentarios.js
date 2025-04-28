/* --- JS: js/comentarios.js --- */
/**
 * @file comentarios.js
 * @description
 * Gestiona la creación y control del modal de comentarios para reportes.
 * Permite abrir, cerrar y animar el modal, cargar comentarios desde el servidor
 * y enviar nuevos comentarios.
 *
 * Requiere:
 *  - Botones con clase "agregar-comentario" y atributo data-folio
 *  - Endpoint GET  en 'dao/obtenerComentarios.php?FolioReportes=…'
 *  - Endpoint POST en 'dao/agregarComentario.php' recibiendo JSON:
 *      { FolioReportes: string, Comentario: string }
 */

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       1. Creación del modal y variables globales
    ───────────────────────────────────────── */
    const comentariosModal   = document.createElement("div");
    comentariosModal.id      = "reporte-modal";
    comentariosModal.style.display = "none"; // Oculto por defecto
    comentariosModal.innerHTML = `
        <div class="modal-content comentarios-modal">
            <span class="close-modal">&times;</span>
            <div class="notas-container">
                <h2>Agregar Comentario</h2>
                <textarea id="nueva-nota" placeholder="Escribe tu comentario aquí..."></textarea>
                <button class="btn-guardar">Guardar Comentario</button>
            </div>
            <div class="comentarios-container">
                <h2>Comentarios Guardados</h2>
                <div class="comentarios-lista"></div>
            </div>
        </div>
    `;
    document.body.appendChild(comentariosModal);

    const modalContent     = comentariosModal.querySelector(".modal-content");
    const btnCerrarModal   = comentariosModal.querySelector(".close-modal");
    const btnGuardar       = comentariosModal.querySelector(".btn-guardar");
    const inputComentario  = comentariosModal.querySelector("#nueva-nota");
    const listaComentarios = comentariosModal.querySelector(".comentarios-lista");
    let lastClickedButton  = null;  // Botón que abrió el modal
    let currentFolio       = null;  // Folio de reporte actual

    /* ─────────────────────────────────────────
       2. Funciones utilitarias
    ───────────────────────────────────────── */
    /**
     * Abre o cierra el modal con animación de escala.
     * @param {boolean} abrir – true: mostrar; false: ocultar.
     */
    function animarModal(abrir) {
        if (abrir) {
            const rect = lastClickedButton.getBoundingClientRect();
            modalContent.style.transformOrigin =
                `${rect.left + rect.width/2}px ${rect.top + rect.height/2}px`;
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity   = "0";

            comentariosModal.style.display = "flex";
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
                comentariosModal.style.display = "none";
            }, 300);
        }
    }

    /**
     * Carga y muestra los comentarios para un folio dado.
     * @param {string} folio – Identificador del reporte.
     */
    function cargarComentarios(folio) {
        listaComentarios.innerHTML = "Cargando...";
        fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerComentarios.php?FolioReportes=${folio}`)
            .then(res => res.json())
            .then(data => {
                listaComentarios.innerHTML = "";
                if (data.status === "success" && data.comentarios.length) {
                    data.comentarios.forEach(texto => {
                        const div = document.createElement("div");
                        div.classList.add("comentario");
                        div.textContent = texto;
                        listaComentarios.appendChild(div);
                    });
                } else {
                    listaComentarios.innerHTML = "<p>No hay comentarios.</p>";
                }
            })
            .catch(err => {
                console.error("❌ Error al obtener comentarios:", err);
                listaComentarios.innerHTML = "<p>Error al cargar comentarios.</p>";
            });
    }

    /* ─────────────────────────────────────────
       3. Gestión de eventos
    ───────────────────────────────────────── */
    // Cerrar modal al pulsar la “X”
    btnCerrarModal.addEventListener("click", () => animarModal(false));

    // Delegación: abrir modal al pulsar botón ".agregar-comentario"
    document.body.addEventListener("click", event => {
        if (event.target.classList.contains("agregar-comentario")) {
            lastClickedButton = event.target;
            currentFolio = lastClickedButton.getAttribute("data-folio");
            animarModal(true);
            cargarComentarios(currentFolio);
        }
    });

    // Guardar un nuevo comentario
    btnGuardar.addEventListener("click", () => {
        const texto = inputComentario.value.trim();
        if (!texto || !currentFolio) return;

        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/agregarComentario.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ FolioReportes: currentFolio, Comentario: texto })
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    inputComentario.value = "";
                    cargarComentarios(currentFolio);
                } else {
                    console.error("❌ Error al agregar comentario:", data.message);
                }
            })
            .catch(err => console.error("❌ Error en el servidor:", err));
    });
});
