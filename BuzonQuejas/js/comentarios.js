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
        cargarComentarios(currentFolio); // 📌 Carga los comentarios desde la BD
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
            // 🔹 Enviar comentario a la base de datos
            fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/agregarComentario.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ FolioReportes: currentFolio, Comentario: textoComentario })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === "success") {
                        console.log(`✅ Comentario agregado a folio ${currentFolio}:`, textoComentario);
                        inputComentario.value = "";
                        cargarComentarios(currentFolio);
                    } else {
                        console.error("❌ Error al agregar comentario:", data.message);
                    }
                })
                .catch(error => console.error("❌ Error en el servidor:", error));
        }
    });

    // 🔹 Función para cargar comentarios desde la BD
    function cargarComentarios(folio) {
        listaComentarios.innerHTML = "Cargando...";

        fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerComentarios.php?FolioReportes=${folio}`)
            .then(response => response.json())
            .then(data => {
                listaComentarios.innerHTML = "";
                if (data.status === "success" && data.comentarios.length > 0) {
                    data.comentarios.forEach(comentario => {
                        let nuevoComentario = document.createElement("div");
                        nuevoComentario.classList.add("comentario");
                        nuevoComentario.textContent = comentario;
                        listaComentarios.appendChild(nuevoComentario);
                    });
                } else {
                    listaComentarios.innerHTML = "<p>No hay comentarios.</p>";
                }
            })
            .catch(error => {
                console.error("❌ Error al obtener comentarios:", error);
                listaComentarios.innerHTML = "<p>Error al cargar comentarios.</p>";
            });
    }
});
