document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de descripción
    let descripcionModal = document.createElement("div");
    descripcionModal.id = "descripcion-modal";
    descripcionModal.style.display = "none"; // 🔹 Oculto por defecto
    descripcionModal.innerHTML = `
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div class="descripcion-container">
            <h2>Descripción del Reporte</h2>
            <p id="descripcion-texto"></p>
        </div>
    </div>
    `;

    // Agregar el modal al body
    document.body.appendChild(descripcionModal);

    let modalContent = descripcionModal.querySelector(".modal-content");
    let lastClickedButton = null; // 🔹 Guarda el botón que activó el modal

    // Evento para cerrar el modal con animación inversa
    descripcionModal.querySelector(".close-modal").addEventListener("click", function () {
        if (!lastClickedButton) {
            descripcionModal.style.display = "none";
            return;
        }

        let rect = lastClickedButton.getBoundingClientRect(); // 🔹 Posición del botón
        modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
        modalContent.style.transform = "scale(0)";
        modalContent.style.opacity = "0";

        setTimeout(() => {
            descripcionModal.style.display = "none";
        }, 300); // 🔹 Esperamos que termine la animación antes de ocultarlo
    });

    // Evento para abrir el modal con animación desde el botón "Mostrar Descripción"
    document.querySelectorAll(".mostrar-descripcion").forEach((boton) => {
        boton.addEventListener("click", function () {
            lastClickedButton = boton; // 🔹 Guarda el botón que activó el modal
            let rect = boton.getBoundingClientRect(); // 🔹 Posición del botón

            // 🔹 Obtener la descripción del reporte
            let descripcion = this.getAttribute("data-descripcion") || "Sin descripción disponible.";

            // 🔹 Mostrar la descripción en el modal
            document.getElementById("descripcion-texto").textContent = descripcion;

            // 🔹 Mostrar el modal con animación
            descripcionModal.style.display = "flex";
            modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
            modalContent.style.transform = "scale(0)";
            modalContent.style.opacity = "0";

            setTimeout(() => {
                modalContent.classList.add("active");
                modalContent.style.transform = "scale(1)";
                modalContent.style.opacity = "1";
            }, 10);
        });
    });
});