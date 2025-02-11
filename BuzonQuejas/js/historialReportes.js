document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de comentarios
    let comentariosModal = document.createElement("div");
    comentariosModal.id = "reporte-modal";
    comentariosModal.style.display = "none"; // 🔹 Oculto por defecto
    comentariosModal.innerHTML = `
    <div class="modal-content">
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

    // Evento para cerrar el modal con animación
    comentariosModal.querySelector(".close-modal").addEventListener("click", function () {
        modalContent.classList.remove("active"); // 🔹 Ocultar animadamente
        setTimeout(() => {
            comentariosModal.style.display = "none";
        }, 300); // 🔹 Esperar a que termine la animación antes de ocultar
    });

    // Evento para abrir el modal con animación desde el botón
    document.querySelectorAll(".agregar-comentario").forEach((boton) => {
        boton.addEventListener("click", function () {
            let rect = boton.getBoundingClientRect(); // 🔹 Obtener la posición del botón

            // 🔹 Mostrar el modal y hacer que crezca desde el botón
            comentariosModal.style.display = "flex";
            modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity = "0";

            setTimeout(() => {
                modalContent.classList.add("active"); // 🔹 Activar la animación de expansión
                modalContent.style.transform = "scale(1)";
                modalContent.style.opacity = "1";
            }, 10);
        });
    });

    // Botón para guardar comentarios
    let btnGuardar = comentariosModal.querySelector(".btn-guardar");
    let inputComentario = comentariosModal.querySelector("#nueva-nota");
    let listaComentarios = comentariosModal.querySelector(".comentarios-lista");

    btnGuardar.addEventListener("click", function () {
        let textoComentario = inputComentario.value.trim();
        if (textoComentario !== "") {
            let nuevoComentario = document.createElement("div");
            nuevoComentario.classList.add("comentario");
            nuevoComentario.textContent = textoComentario;
            listaComentarios.appendChild(nuevoComentario);
            inputComentario.value = ""; // 🔹 Limpiar el textarea después de guardar
        }
    });
});
