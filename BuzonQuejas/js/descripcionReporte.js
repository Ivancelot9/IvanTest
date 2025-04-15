document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de descripción
    let descripcionModal = document.createElement("div");
    descripcionModal.id = "descripcion-modal";
    descripcionModal.style.display = "none"; // 🔹 Oculto por defecto
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

    // Agregar el modal al body
    document.body.appendChild(descripcionModal);

    let modalContent = descripcionModal.querySelector(".modal-content");
    let lastClickedButton = null; // 🔹 Guarda el botón que activó el modal

    // 🔹 Función para animar apertura/cierre del modal correctamente
    function animarModal(abrir) {
        if (abrir) {
            if (!lastClickedButton) return;

            let rect = lastClickedButton.getBoundingClientRect(); // 🔹 Posición del botón
            modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity = "0";

            descripcionModal.style.display = "flex"; // 🔹 Mostrar modal antes de animar
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
                descripcionModal.style.display = "none";
            }, 300);
        }
    }

    // Evento para cerrar el modal con animación inversa
    descripcionModal.querySelector(".close-modal").addEventListener("click", function () {
        animarModal(false);
    });

    // 🔹 Delegación de eventos para los botones de "Mostrar Descripción"
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("mostrar-descripcion")) {
            lastClickedButton = event.target;

            // 🔹 Mostrar la descripción en el modal
            document.getElementById("descripcion-texto").textContent =
                lastClickedButton.getAttribute("data-descripcion") || "Sin descripción disponible.";

            // 🔹 Mostrar y animar el modal correctamente
            animarModal(true);
        }
    });
});
