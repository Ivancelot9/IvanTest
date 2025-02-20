document.addEventListener("DOMContentLoaded", function () {
    // Crear el modal de fecha
    let modalFecha = document.createElement("div");
    modalFecha.id = "modal-fecha";
    modalFecha.style.display = "none";
    modalFecha.innerHTML = `
    <div class="modal-content">
        <h2>Seleccionar Fecha de Finalización</h2>
        <input type="date" id="fecha-seleccionada">
        <button id="guardar-fecha">Guardar</button>
        <button id="cerrar-fecha">Cancelar</button>
    </div>
    `;

    document.body.appendChild(modalFecha);

    let fechaSeleccionada = document.getElementById("fecha-seleccionada");
    let btnGuardar = document.getElementById("guardar-fecha");
    let btnCerrar = document.getElementById("cerrar-fecha");
    let lastClickedButton = null; // Guarda el botón que abrió el modal

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("seleccionar-fecha")) {
            lastClickedButton = event.target;
            modalFecha.style.display = "flex";
        }
    });

    btnGuardar.addEventListener("click", function () {
        if (lastClickedButton) {
            let fecha = fechaSeleccionada.value;
            if (fecha) {
                lastClickedButton.parentElement.innerHTML = fecha; // Reemplaza el botón con la fecha seleccionada
            }
            modalFecha.style.display = "none";
        }
    });

    btnCerrar.addEventListener("click", function () {
        modalFecha.style.display = "none";
    });
});
