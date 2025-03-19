document.addEventListener("DOMContentLoaded", function () {
    let modal = document.createElement("div");
    modal.id = "estatus-modal";
    modal.style.display = "none";
    modal.innerHTML = `
    <div class="modal-content comic-bubble">
        <span class="close-modal">&times;</span>
        <h2>CONFIGURAR ESTATUS DEL REPORTE</h2>
        <div id="pregunta-dias">
            <p>¿Cuántos días crees tardar en evaluar el reporte?</p>
            <input type="number" id="dias-evaluacion" min="1" max="10" placeholder="Ingresa días">
            <button id="continuar-btn" class="comic-button">Continuar</button>
        </div>
        <div id="configurar-estatus" style="display:none;">
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

    let progresoManual = 100;
    let currentFolio = null;

    function abrirModal(folio) {
        currentFolio = folio;
        let estatusGuardados = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        let datosReporte = estatusGuardados[folio];

        if (datosReporte) {
            let dias = datosReporte.dias;
            diasSeleccionados.textContent = `${dias}`;

            preguntaDias.style.display = "none";
            configurarEstatus.style.display = "block";
        } else {
            preguntaDias.style.display = "block";
            configurarEstatus.style.display = "none";
        }

        modal.style.display = "flex";
    }

    function aplicarColorBoton(boton, progreso) {
        if (!boton) return; // Evita errores si el botón no existe

        if (progreso === 100) {
            boton.style.backgroundColor = "green";
        } else if (progreso === 75) {
            boton.style.backgroundColor = "blue";
        } else if (progreso === 50) {
            boton.style.backgroundColor = "yellow";
        } else if (progreso === 25) {
            boton.style.backgroundColor = "red";
        } else {
            boton.style.backgroundColor = "white";
            boton.style.color = "black";
            boton.style.border = "2px solid black";
        }
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
            progresoManual = 100; // Valor por defecto
        }
        manualCircle.textContent = `${progresoManual}%`;
    });

    guardarBtn.addEventListener("click", function () {
        let botonEstatus = document.querySelector(`.ver-estatus-btn[data-folio='${currentFolio}']`);

        let estatusReportes = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        estatusReportes[currentFolio] = { progresoManual: progresoManual };
        localStorage.setItem("estatusReportes", JSON.stringify(estatusReportes));

        // Solo aquí aplicamos el color
        aplicarColorBoton(botonEstatus, progresoManual);

        Swal.fire({
            icon: "success",
            title: "¡Estatus Guardado!",
            text: `El reporte ha sido actualizado a ${progresoManual}%`,
            confirmButtonText: "Entendido",
            customClass: {
                popup: "comic-bubble",
            }
        }).then(() => {
            modal.style.display = "none";
        });
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("ver-estatus-btn")) {
            abrirModal(event.target.getAttribute("data-folio"));
        }
    });
});
