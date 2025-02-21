document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de fecha de finalización
    let modalFecha = document.createElement("div");
    modalFecha.id = "modal-fecha";
    modalFecha.style.display = "none";
    modalFecha.innerHTML = `
    <div class="modal-fecha">
        <h2>Seleccionar Fecha de Finalización</h2>
        <input type="text" id="fecha-seleccionada" placeholder="Selecciona una fecha" />
        <div class="botones-container">
            <button id="cerrar-fecha">Cancelar</button>
            <button id="guardar-fecha">Finalizar Reporte</button>
        </div>
    </div>
    `;

    // 🔹 Agregar el modal al body
    document.body.appendChild(modalFecha);

    // 🔹 Inicializar Flatpickr en el input de fecha
    let fechaSeleccionada = document.getElementById("fecha-seleccionada");
    flatpickr(fechaSeleccionada, {
        dateFormat: "d/m/Y",  // Formato de fecha
        defaultDate: new Date(),  // Fecha actual por defecto
        minDate: "today",  // No permite seleccionar fechas pasadas
        locale: "es",  // Idioma en español
        disableMobile: true,  // Forzar versión de escritorio en móviles
        monthSelectorType: "static",  // Mostrar selector de mes fijo
    });

    let btnGuardar = document.getElementById("guardar-fecha");
    let btnCerrar = document.getElementById("cerrar-fecha");
    let lastClickedButton = null;

    // 🔹 Evento para abrir el modal desde el botón "Seleccionar Fecha"
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("seleccionar-fecha")) {
            lastClickedButton = event.target;
            modalFecha.style.display = "flex"; // 🔥 Mostrar el modal en pantalla
        }
    });

    // 🔹 Evento para guardar la fecha seleccionada
    btnGuardar.addEventListener("click", function () {
        if (lastClickedButton) {
            let fecha = fechaSeleccionada.value;
            if (fecha) {
                // 🔥 Reemplaza el botón con la fecha seleccionada en formato legible
                lastClickedButton.parentElement.innerHTML = `
                    <span class="fecha-final">${fecha}</span>
                `;
            } else {
                alert("Por favor selecciona una fecha antes de finalizar el reporte."); // Validación
                return;
            }
            modalFecha.style.display = "none"; // 🔥 Cierra el modal
        }
    });

    // 🔹 Evento para cerrar el modal sin guardar
    btnCerrar.addEventListener("click", function () {
        modalFecha.style.display = "none";
    });

    // 🔹 Cerrar el modal haciendo clic fuera de él
    window.addEventListener("click", function (event) {
        if (event.target === modalFecha) {
            modalFecha.style.display = "none";
        }
    });
});
