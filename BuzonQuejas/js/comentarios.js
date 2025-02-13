document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de comentarios
    let comentariosModal = document.createElement("div");
    comentariosModal.id = "reporte-modal";
    comentariosModal.style.display = "none"; // 🔹 Oculto por defecto
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

    // Agregar el modal al body
    document.body.appendChild(comentariosModal);

    let modalContent = comentariosModal.querySelector(".modal-content");
    let lastClickedButton = null; // 🔹 Guarda el botón que abrió el modal
    let currentFolio = null; // 🔹 Guarda el folio del reporte actual
    let comentariosPorReporte = {}; // 🔥 Objeto para guardar comentarios por folio

    // Evento para cerrar el modal con animación inversa
    comentariosModal.querySelector(".close-modal").addEventListener("click", function () {
        if (!lastClickedButton) {
            comentariosModal.style.display = "none";
            return;
        }

        let rect = lastClickedButton.getBoundingClientRect(); // 🔹 Posición del botón

        modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
        modalContent.style.transform = "scale(0)";
        modalContent.style.opacity = "0";

        setTimeout(() => {
            comentariosModal.style.display = "none";
        }, 300); // 🔹 Esperamos que termine la animación antes de ocultarlo
    });

    // Evento para abrir el modal con animación desde el botón
    document.querySelectorAll(".agregar-comentario").forEach((boton) => {
        boton.addEventListener("click", function () {
            lastClickedButton = boton; // 🔹 Guarda el botón que activó el modal
            let rect = boton.getBoundingClientRect(); // 🔹 Posición del botón
            currentFolio = boton.getAttribute("data-folio"); // 🔥 Obtener el folio del reporte

            comentariosModal.style.display = "flex";
            modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity = "0";

            setTimeout(() => {
                modalContent.classList.add("active");
                modalContent.style.transform = "scale(1)";
                modalContent.style.opacity = "1";
            }, 10);

            // 🔹 Cargar comentarios del folio actual
            cargarComentarios(currentFolio);
        });
    });

    // Botón para guardar comentarios
    let btnGuardar = comentariosModal.querySelector(".btn-guardar");
    let inputComentario = comentariosModal.querySelector("#nueva-nota");
    let listaComentarios = comentariosModal.querySelector(".comentarios-lista");

    btnGuardar.addEventListener("click", function () {
        let textoComentario = inputComentario.value.trim();
        if (textoComentario !== "" && currentFolio) {
            if (!comentariosPorReporte[currentFolio]) {
                comentariosPorReporte[currentFolio] = []; // 🔥 Si no existe, creamos el array
            }

            comentariosPorReporte[currentFolio].push(textoComentario); // 🔥 Guardar comentario en su reporte
            inputComentario.value = ""; // 🔹 Limpiar el textarea después de guardar

            cargarComentarios(currentFolio); // 🔥 Volver a cargar los comentarios del reporte actual
        }
    });

    // 🔹 Función para cargar comentarios del folio actual
    function cargarComentarios(folio) {
        listaComentarios.innerHTML = ""; // 🔥 Limpiar comentarios previos

        if (comentariosPorReporte[folio]) {
            comentariosPorReporte[folio].forEach((comentario) => {
                let nuevoComentario = document.createElement("div");
                nuevoComentario.classList.add("comentario");
                nuevoComentario.textContent = comentario;
                listaComentarios.appendChild(nuevoComentario);
            });
        }
    }
});
