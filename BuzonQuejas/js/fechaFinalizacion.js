document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de fecha de finalización
    let modalFecha = document.createElement("div");
    modalFecha.id = "modal-fecha";
    modalFecha.style.display = "none";
    modalFecha.innerHTML = `
    <div class="modal-fecha">
        <h2>Seleccionar Fecha de Finalización</h2>
        <input type="date" id="fecha-seleccionada">
        <button id="guardar-fecha">Guardar</button>
        <button id="cerrar-fecha">Cancelar</button>
    </div>
    `;

    // 🔹 Agregar el modal al body
    document.body.appendChild(modalFecha);

    let fechaSeleccionada = document.getElementById("fecha-seleccionada");
    let btnGuardar = document.getElementById("guardar-fecha");
    let btnCerrar = document.getElementById("cerrar-fecha");
    let lastClickedButton = null;

    // 🔹 Evento para abrir el modal desde el botón "Seleccionar Fecha"
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("seleccionar-fecha")) {
            lastClickedButton = event.target;
            modalFecha.style.display = "flex"; // 🔥 Se muestra el modal en pantalla
        }
    });

    // 🔹 Evento para guardar la fecha seleccionada
    btnGuardar.addEventListener("click", function () {
        if (lastClickedButton) {
            let fecha = fechaSeleccionada.value;
            if (fecha) {
                lastClickedButton.parentElement.innerHTML = fecha; // 🔥 Reemplaza el botón con la fecha seleccionada
            }
            modalFecha.style.display = "none";
        }
    });

    // 🔹 Evento para cerrar el modal sin guardar
    btnCerrar.addEventListener("click", function () {
        modalFecha.style.display = "none";
    });
});
