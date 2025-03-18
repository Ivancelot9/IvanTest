document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el modal de estatus
    let modalEstatus = document.createElement("div");
    modalEstatus.id = "estatus-modal";
    modalEstatus.style.display = "none"; // Oculto por defecto
    modalEstatus.innerHTML = `
    <div class="modal-content estatus-modal">
        <span class="close-modal">&times;</span>
        <h2>Configurar Estatus del Reporte</h2>
        
        <label for="diasEvaluacion">Días para evaluar:</label>
        <input type="number" id="diasEvaluacion" min="1" max="30" value="7">

        <div class="progress-container">
            <h3>Progreso Automático</h3>
            <div class="progress-circle" id="progresoAuto">100%</div>
        </div>

        <div class="progress-container">
            <h3>Progreso Manual</h3>
            <input type="range" id="progresoManual" min="0" max="100" value="100">
            <div class="progress-circle" id="progresoManualCircle">100%</div>
        </div>

        <button class="btn-guardar-estatus">Guardar Estatus</button>
    </div>
    `;

    // Agregar el modal al body
    document.body.appendChild(modalEstatus);

    let btnCerrar = modalEstatus.querySelector(".close-modal");
    let btnGuardar = modalEstatus.querySelector(".btn-guardar-estatus");
    let inputDias = modalEstatus.querySelector("#diasEvaluacion");
    let progresoAuto = modalEstatus.querySelector("#progresoAuto");
    let progresoManual = modalEstatus.querySelector("#progresoManual");
    let progresoManualCircle = modalEstatus.querySelector("#progresoManualCircle");

    let currentFolio; // Eliminamos `= null` para evitar la advertencia

    // 🔹 Función para abrir el modal
    function abrirModalEstatus(folio) {
        currentFolio = folio;
        modalEstatus.style.display = "flex";
        actualizarProgreso();
    }

    // 🔹 Función para cerrar el modal
    function cerrarModalEstatus() {
        modalEstatus.style.display = "none";
    }

    // 🔹 Evento para cerrar el modal
    btnCerrar.addEventListener("click", cerrarModalEstatus);

    // 🔹 Evento para cambiar el progreso manual
    progresoManual.addEventListener("input", function () {
        let porcentaje = progresoManual.value;
        progresoManualCircle.textContent = porcentaje + "%";
        actualizarColor(progresoManualCircle, porcentaje);
    });

    // 🔹 Evento para guardar estatus
    btnGuardar.addEventListener("click", function () {
        let diasAsignados = parseInt(inputDias.value);
        console.log(`📌 Reporte ${currentFolio} tiene ${diasAsignados} días para evaluación.`);
        cerrarModalEstatus();
    });

    // 🔹 Evento delegado para abrir el modal desde el botón "Ver Estatus"
    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("ver-estatus-btn")) {
            let folio = event.target.getAttribute("data-folio");
            abrirModalEstatus(folio);
        }
    });

    // 🔹 Función para actualizar el progreso automático basado en los días asignados
    function actualizarProgreso() {
        let dias = parseInt(inputDias.value);
        let porcentaje;

        if (dias <= 3) porcentaje = 25; // RED critical days
        else if (dias <= 7) porcentaje = 50; // YELLOW starting Days
        else if (dias <= 14) porcentaje = 75; // BLUE on time percentage
        else porcentaje = 100; // GREEN goal achieved

        progresoAuto.textContent = porcentaje + "%";
        actualizarColor(progresoAuto, porcentaje);
    }

    // 🔹 Función para cambiar color según porcentaje
    function actualizarColor(elemento, porcentaje) {
        if (porcentaje <= 25) elemento.style.backgroundColor = "red";
        else if (porcentaje <= 50) elemento.style.backgroundColor = "yellow";
        else if (porcentaje <= 75) elemento.style.backgroundColor = "blue";
        else elemento.style.backgroundColor = "green";
    }

    // 🔹 Evento para actualizar progreso automático cuando se cambian días
    inputDias.addEventListener("input", actualizarProgreso);
});
