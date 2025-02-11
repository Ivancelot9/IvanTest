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

    // Evento para cerrar el modal
    comentariosModal.querySelector(".close-modal").addEventListener("click", function () {
        comentariosModal.style.display = "none";
    });

    // Evento para abrir el modal al hacer clic en "Agregar Comentario"
    document.querySelectorAll(".agregar-comentario").forEach((boton) => {
        boton.addEventListener("click", function () {
            comentariosModal.style.display = "flex"; // 🔹 Ahora aparecerá centrado
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