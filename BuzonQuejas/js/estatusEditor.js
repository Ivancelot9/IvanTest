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

    let progresoAutomatico = 100;
    let progresoManual = 100;
    let currentFolio = null;

    function calcularEstatusRecomendado(dias, fechaInicio) {
        let fechaAsignada = new Date(fechaInicio);
        let fechaActual = new Date();
        let diasTranscurridos = Math.floor((fechaActual - fechaAsignada) / (1000 * 60 * 60 * 24));

        let limiteVerde = 1;
        let limiteAzul = Math.ceil(dias * 0.5);
        let limiteAmarillo = Math.ceil(dias * 0.75);
        let diasRestantes = dias - diasTranscurridos;

        if (diasRestantes <= 0) {
            progresoAutomatico = 25;
            autoCircle.style.backgroundColor = "red";
            recomendadoText.innerHTML = `<strong>Red</strong><br><small>Tiempo agotado</small>`;
        } else if (diasTranscurridos < limiteVerde) {
            progresoAutomatico = 100;
            autoCircle.style.backgroundColor = "green";
            recomendadoText.innerHTML = `<strong>Green</strong><br><small>Si lo terminas en ${limiteVerde} día(s), mantendrás el estado óptimo.</small>`;
        } else if (diasTranscurridos < limiteAzul) {
            progresoAutomatico = 75;
            autoCircle.style.backgroundColor = "blue";
            recomendadoText.innerHTML = `<strong>Blue</strong><br><small>Debiste acabar en ${limiteVerde} día(s), pero aún estás a tiempo.</small>`;
        } else if (diasTranscurridos < limiteAmarillo) {
            progresoAutomatico = 50;
            autoCircle.style.backgroundColor = "yellow";
            recomendadoText.innerHTML = `<strong>Yellow</strong><br><small>El tiempo se está acabando. Apresúrate.</small>`;
        } else {
            progresoAutomatico = 25;
            autoCircle.style.backgroundColor = "red";
            recomendadoText.innerHTML = `<strong>Red</strong><br><small>Tiempo agotado. Urgente finalizar.</small>`;
        }

        autoCircle.textContent = `${progresoAutomatico}%`;
    }

    function abrirModal(folio) {
        currentFolio = folio;
        let estatusGuardados = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        let datosReporte = estatusGuardados[folio];

        let botonEstatus = document.querySelector(`[data-folio='${folio}']`);

        if (datosReporte) {
            let dias = datosReporte.dias;
            let fechaInicio = datosReporte.fechaInicio;
            diasSeleccionados.textContent = `${dias}`;
            calcularEstatusRecomendado(dias, fechaInicio);

            preguntaDias.style.display = "none";
            configurarEstatus.style.display = "block";

            // Aplicar color al botón si hay un estatus definido
            aplicarColorBoton(botonEstatus, progresoAutomatico);
        } else {
            // Si no hay datos, el botón debe mantenerse con su estilo original (neutro)
            preguntaDias.style.display = "block";
            configurarEstatus.style.display = "none";
            botonEstatus.style.backgroundColor = "white";
            botonEstatus.style.color = "black";
            botonEstatus.style.border = "2px solid black";
        }

        modal.style.display = "flex";
    }

    function aplicarColorBoton(boton, progreso) {
        if (progreso === 100) {
            boton.style.backgroundColor = "green";
        } else if (progreso === 75) {
            boton.style.backgroundColor = "blue";
        } else if (progreso === 50) {
            boton.style.backgroundColor = "yellow";
        } else if (progreso === 25) {
            boton.style.backgroundColor = "red";
        } else {
            // En caso de que no haya progreso definido, mantenerlo neutro
            boton.style.backgroundColor = "white";
            boton.style.color = "black";
            boton.style.border = "2px solid black";
        }
    }

    continuarBtn.addEventListener("click", function () {
        let dias = parseInt(diasEvaluacionInput.value);
        if (!dias || dias < 1) {
            Swal.fire("Error", "Por favor, ingresa un número válido de días.", "error");
            return;
        }

        let fechaInicio = new Date().toISOString();

        let estatusReportes = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        estatusReportes[currentFolio] = { dias: dias, fechaInicio: fechaInicio, progresoManual: progresoAutomatico };
        localStorage.setItem("estatusReportes", JSON.stringify(estatusReportes));

        calcularEstatusRecomendado(dias, fechaInicio);
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
        Swal.fire("¡Estatus Guardado!", `El reporte ha sido actualizado a ${progresoManual}%`, "success")
            .then(() => modal.style.display = "none");
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
