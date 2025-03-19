document.addEventListener("DOMContentLoaded", function () {
    let modal = document.createElement("div");
    modal.id = "estatus-modal";
    modal.style.display = "none";
    modal.innerHTML = `
    <div class="modal-content comic-bubble">
        <span class="close-modal">&times;</span>
        <div id="pregunta-dias">
            <h2>¿Cuántos días crees tardar en evaluar el reporte?</h2>
            <input type="number" id="dias-evaluacion" min="1" max="10" placeholder="Ingresa días">
            <button id="continuar-btn" class="comic-button">Continuar</button>
        </div>
        <div id="configurar-estatus" style="display:none;">
            <h2>CONFIGURAR ESTATUS DEL REPORTE</h2>
            <p><strong>DÍAS PARA EVALUAR:</strong> <span id="dias-seleccionados">0</span></p>

            <div class="estatus-container">
                <div class="estatus-recomendado">
                    <h3>ESTATUS RECOMENDADO:</h3>
                    <div class="progress-circle auto" id="auto-circle">100%</div>
                    <p id="recomendado-text"></p>
                </div>
                <div class="estatus-manual">
                    <h3>Tu Avance:</h3>
                    <input type="text" id="input-manual" maxlength="1" placeholder="G / B / Y / R">
                    <div class="progress-circle manual" id="manual-circle">100%</div>
                </div>
            </div>

            <button id="guardar-estatus" class="comic-button">GUARDAR ESTATUS</button>
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
    let diasSeleccionados = modal.querySelector("#dias-seleccionados");
    let recomendadoText = modal.querySelector("#recomendado-text");

    let progresoAutomatico = 100;
    let progresoManual = 100;

    function calcularEstatusRecomendado(dias) {
        diasSeleccionados.textContent = `${dias}`;

        if (dias <= 2) {
            progresoAutomatico = 100;
            autoCircle.style.backgroundColor = "green";
            recomendadoText.innerHTML = `<strong>Green</strong><br><small>Tiempo para lograrlo: 2 días</small>`;
        } else if (dias <= 4) {
            progresoAutomatico = 75;
            autoCircle.style.backgroundColor = "blue";
            recomendadoText.innerHTML = `<strong>Blue</strong><br><small>Tiempo para lograrlo: 3-4 días</small>`;
        } else if (dias <= 6) {
            progresoAutomatico = 50;
            autoCircle.style.backgroundColor = "yellow";
            recomendadoText.innerHTML = `<strong>Yellow</strong><br><small>Tiempo para lograrlo: 5-6 días</small>`;
        } else {
            progresoAutomatico = 25;
            autoCircle.style.backgroundColor = "red";
            recomendadoText.innerHTML = `<strong>Red</strong><br><small>Tiempo para lograrlo: Más de 6 días</small>`;
        }

        autoCircle.textContent = `${progresoAutomatico}%`;
    }

    function abrirModal() {
        let diasGuardados = parseInt(localStorage.getItem("diasEvaluacion")) || 0;

        if (diasGuardados > 0) {
            calcularEstatusRecomendado(diasGuardados);
            preguntaDias.style.display = "none";
            configurarEstatus.style.display = "block";
        } else {
            preguntaDias.style.display = "block";
            configurarEstatus.style.display = "none";
        }

        modal.style.display = "flex";
    }

    continuarBtn.addEventListener("click", function () {
        let dias = parseInt(diasEvaluacionInput.value);
        if (!dias || dias < 1) {
            alert("Por favor, ingresa un número válido de días.");
            return;
        }

        localStorage.setItem("diasEvaluacion", String(dias)); // 🔹 Guarda siempre como string
        calcularEstatusRecomendado(dias);

        preguntaDias.style.display = "none";
        configurarEstatus.style.display = "block";
    });

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
            abrirModal();
        }
    });
});
