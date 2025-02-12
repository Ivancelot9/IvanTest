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

        modalContent.classList.remove("active"); // 🔹 Ocultar animadamente
        setTimeout(() => {
            descripcionModal.style.display = "none";
        }, 300);
    });

    // Evento para abrir el modal con animación desde el botón "Mostrar Descripción"
    document.querySelectorAll(".mostrar-descripcion").forEach((boton) => {
        boton.addEventListener("click", function () {
            lastClickedButton = boton; // 🔹 Guarda el botón que activó el modal

            // 🔹 Mostrar la descripción en el modal sin necesidad de usar una variable intermedia
            document.getElementById("descripcion-texto").textContent =
                this.getAttribute("data-descripcion") || "Sin descripción disponible.";

            // 🔹 Mostrar el modal con animación
            descripcionModal.style.display = "flex";
            setTimeout(() => {
                modalContent.classList.add("active");
            }, 10);
        });
    });
});
