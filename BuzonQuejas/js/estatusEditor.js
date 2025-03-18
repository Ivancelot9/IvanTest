document.addEventListener("DOMContentLoaded", function () {
    let modal = document.createElement("div");
    modal.id = "estatus-modal";
    modal.style.display = "none";
    modal.innerHTML = `
    <div class="modal-content comic-bubble">
        <span class="close-modal">&times;</span>
        <div class="modal-inner">
            <div id="pregunta-dias">
                <h2>¿Cuántos días crees tardar en evaluar el reporte?</h2>
                <input type="number" id="dias-evaluacion" min="1" max="10" placeholder="Ingresa días">
                <button id="continuar-btn" class="comic-button">Continuar</button>
            </div>
            <div id="configurar-estatus" style="display:none;">
                <h2>CONFIGURAR ESTATUS DEL REPORTE</h2>
                <p><strong>DÍAS PARA EVALUAR:</strong> <span id="dias-seleccionados">0</span></p>
                
                <div class="progress-section">
                    <div>
                        <h3>PROGRESO AUTOMÁTICO</h3>
                        <div class="progress-circle auto" id="auto-circle">100%</div>
                    </div>
                    <div>
                        <h3>PROGRESO MANUAL</h3>
                        <input type="text" id="input-manual" maxlength="1" placeholder="G / B / Y / R">
                        <div class="progress-circle manual" id="manual-circle">100%</div>
                    </div>
                </div>

                <button id="guardar-estatus" class="comic-button">Guardar Estatus</button>
            </div>
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

    let progresoAutomatico = 100;
    let progresoManual = 100;

    continuarBtn.addEventListener("click", function () {
        let dias = parseInt(diasEvaluacionInput.value);
        if (!dias || dias < 1) {
            alert("Por favor, ingresa un número válido de días.");
            return;
        }

        diasSeleccionados.textContent = `${dias}`;

        if (dias <= 2) {
            progresoAutomatico = 100;
            autoCircle.style.backgroundColor = "green";
        } else if (dias <= 4) {
            progresoAutomatico = 75;
            autoCircle.style.backgroundColor = "blue";
        } else if (dias <= 6) {
            progresoAutomatico = 50;
            autoCircle.style.backgroundColor = "yellow";
        } else {
            progresoAutomatico = 25;
            autoCircle.style.backgroundColor = "red";
        }

        autoCircle.textContent = `${progresoAutomatico}%`;

        preguntaDias.style.display = "none";
        configurarEstatus.style.display = "flex";
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

    // ✅ **Delegación de eventos para abrir el modal**
    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("ver-estatus-btn")) {
            modal.style.display = "flex";
            preguntaDias.style.display = "flex";
            configurarEstatus.style.display = "none";
        }
    });
});
