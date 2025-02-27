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
    let lastClickedButton = null;
    let currentFolio = null;

    // 🔄 Cargar comentarios desde `localStorage`
    let comentariosPorReporte = JSON.parse(localStorage.getItem("comentariosPorReporte")) || {};
    console.log("Comentarios al cargar:", comentariosPorReporte); // ✅ DEPURACIÓN

    // 🔹 Función para animar el modal
    function animarModal(abrir) {
        if (abrir) {
            let rect = lastClickedButton.getBoundingClientRect();
            modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity = "0";

            comentariosModal.style.display = "flex";
            setTimeout(() => {
                modalContent.classList.add("active");
                modalContent.style.transform = "scale(1)";
                modalContent.style.opacity = "1";
            }, 10);
        } else {
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity = "0";
            setTimeout(() => {
                modalContent.classList.remove("active");
                comentariosModal.style.display = "none";
            }, 300);
        }
    }

    // 🔹 Evento para cerrar el modal
    comentariosModal.querySelector(".close-modal").addEventListener("click", function () {
        animarModal(false);
    });

    // 🔹 Función para abrir el modal desde cualquier botón "Agregar Comentario"
    function abrirModal(event) {
        lastClickedButton = event.target;
        currentFolio = lastClickedButton.getAttribute("data-folio");
        animarModal(true);
        cargarComentarios(currentFolio);
    }

    // ✅ **Delegación de eventos**: Asignamos el evento a un contenedor en vez de cada botón individualmente.
    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("agregar-comentario")) {
            abrirModal(event);
        }
    });

    // 🔹 Botón para guardar comentarios
    let btnGuardar = comentariosModal.querySelector(".btn-guardar");
    let inputComentario = comentariosModal.querySelector("#nueva-nota");
    let listaComentarios = comentariosModal.querySelector(".comentarios-lista");

    btnGuardar.addEventListener("click", function () {
        let textoComentario = inputComentario.value.trim();
        if (textoComentario !== "" && currentFolio) {
            if (!comentariosPorReporte[currentFolio]) {
                comentariosPorReporte[currentFolio] = [];
            }
            comentariosPorReporte[currentFolio].push(textoComentario);

            // 🔄 Guardar en `localStorage`
            localStorage.setItem("comentariosPorReporte", JSON.stringify(comentariosPorReporte));

            console.log(`Comentario agregado a folio ${currentFolio}:`, textoComentario); // ✅ DEPURACIÓN
            console.log("Comentarios actualizados en `localStorage`:", comentariosPorReporte); // ✅ DEPURACIÓN

            inputComentario.value = "";
            cargarComentarios(currentFolio);
        }
    });

    // 🔹 Función para cargar comentarios del folio actual
    function cargarComentarios(folio) {
        listaComentarios.innerHTML = "";

        // ✅ DEPURACIÓN: Verificar si los comentarios existen
        console.log(`Cargando comentarios para folio ${folio}:`, comentariosPorReporte[folio]);

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
