document.addEventListener("DOMContentLoaded", function () {
    let modal = document.createElement("div");
    modal.id = "estatus-modal";
    modal.style.display = "none";
    modal.innerHTML = `
    <div class="modal-content comic-bubble">
        <span class="close-modal">&times;</span>
        <h2 class="comic-title">CONFIGURAR ESTATUS DEL REPORTE</h2>

        <div id="pregunta-dias">
            <h3>¿Cuántos días crees tardar en evaluar el reporte?</h3>
            <input type="number" id="dias-evaluacion" min="1" max="10" placeholder="Ingresa días">
            <button id="continuar-btn" class="comic-button">Continuar</button>
        </div>

        <div id="configurar-estatus" style="display:none;">
            <div class="status-container">
                <div class="status-box">
                    <h3>Estatus Recomendado:</h3>
                    <div class="progress-circle auto" id="auto-circle">100%</div>
                    <p><strong><span id="color-recomendado">Green</span></strong></p>
                    <p><small>Tiempo para lograrlo: <span id="tiempo-recomendado">2 días</span></small></p>
                </div>

                <div class="status-box">
                    <h3>Tu Avance:</h3>
                    <div class="progress-circle manual" id="manual-circle">100%</div>
                    <div class="input-section">
                        <label for="input-manual">Ingresa "G/B/Y/R"</label>
                        <input type="text" id="input-manual" maxlength="1">
                    </div>
                </div>
            </div>

            <button id="guardar-estatus" class="comic-button">Guardar Estatus</button>
        </div>
    </div>`;

    document.body.appendChild(modal);

    let closeModal = modal.querySelector(".close-modal");
    let preguntaDias = modal.querySelector("#pregunta-dias");
    let configurarEstatus = modal.querySelector("#configurar-estatus");
    let diasEvaluacionInput = modal.querySelector("#dias-evaluacion");
    let continuarBtn = modal.querySelector("#continuar-btn");
    let autoCircle = modal.querySelector("#auto-circle");
    let manualCircle = modal.querySelector("#manual-circle");
    let inputManual = modal.querySelector("#input-manual");
    let guardarBtn = modal.querySelector("#guardar-estatus");
    let colorRecomendado = modal.querySelector("#color-recomendado");
    let tiempoRecomendado = modal.querySelector("#tiempo-recomendado");

    let progresoAutomatico = 100;
    let progresoManual = 100;

    // Verificar si ya se establecieron los días en localStorage
    let diasGuardados = localStorage.getItem("diasEvaluacion");

    if (diasGuardados) {
        calcularEstatusRecomendado(parseInt(diasGuardados));
    }

    continuarBtn.addEventListener("click", function () {
        let dias = parseInt(diasEvaluacionInput.value);
        if (!dias || dias < 1) {
            alert("Por favor, ingresa un número válido de días.");
            return;
        }

        // Guardar en localStorage para no volver a preguntar
        localStorage.setItem("diasEvaluacion", dias);
        calcularEstatusRecomendado(dias);

        preguntaDias.style.display = "none";
        configurarEstatus.style.display = "block";
    });

    function calcularEstatusRecomendado(dias) {
        if (dias <= 2) {
            progresoAutomatico = 100;
            autoCircle.style.backgroundColor = "green";
            colorRecomendado.textContent = "Green";
            tiempoRecomendado.textContent = "2 días";
        } else if (dias <= 4) {
            progresoAutomatico = 75;
            autoCircle.style.backgroundColor = "blue";
            colorRecomendado.textContent = "Blue";
            tiempoRecomendado.textContent = "4 días";
        } else if (dias <= 6) {
            progresoAutomatico = 50;
            autoCircle.style.backgroundColor = "yellow";
            colorRecomendado.textContent = "Yellow";
            tiempoRecomendado.textContent = "6 días";
        } else {
            progresoAutomatico = 25;
            autoCircle.style.backgroundColor = "red";
            colorRecomendado.textContent = "Red";
            tiempoRecomendado.textContent = "Más de 6 días";
        }

        autoCircle.textContent = `${progresoAutomatico}%`;
    }

    inputManual.addEventListener("input", function () {
        let valor = inputManual.value.toUpperCase();
        if (valor === "G") {
            progresoManual = 100;
            manualCircle.style.backgroundColor = "green";
        } else if (valor === "B") {
            progresoManual = 75;
            manualCircle.style.backgroundColor = "blue";
        } else if (valor === "Y") {
            progresoManual = 50;
            manualCircle.style.backgroundColor = "yellow";
        } else if (valor === "R") {
            progresoManual = 25;
            manualCircle.style.backgroundColor = "red";
        } else {
            progresoManual = progresoAutomatico;
        }
        manualCircle.textContent = `${progresoManual}%`;
    });

    guardarBtn.addEventListener("click", function () {
        alert(`Estatus guardado: ${progresoManual}%`);
        modal.style.display = "none";
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("ver-estatus-btn")) {
            modal.style.display = "flex";
            preguntaDias.style.display = diasGuardados ? "none" : "block";
            configurarEstatus.style.display = diasGuardados ? "block" : "none";
        }
    });
});
