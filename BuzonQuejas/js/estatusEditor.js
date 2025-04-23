document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear el fondo oscuro (overlay)
    let modalOverlay = document.createElement("div");
    modalOverlay.id = "estatus-modal-overlay";
    document.body.appendChild(modalOverlay);

    let modal = document.createElement("div");
    modal.id = "estatus-modal";
    modal.style.display = "none";  // Inicialmente oculto
    modal.innerHTML = `
    <div class="modal-content comic-bubble">
        <span class="close-modal">&times;</span>
        <h2>CONFIGURAR ESTATUS DEL REPORTE</h2>
        <div id="pregunta-dias">
            <p>¿Cuántos días crees tardar en evaluar el reporte?</p>
            <input type="number" id="dias-evaluacion" min="1" max="30" placeholder="Ingresa días">
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

            <button id="guardar-estatus" class="comic-button">Guardar</button>
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
        let diasRestantes = dias - diasTranscurridos;

        if (diasRestantes > 1) {
            diasSeleccionados.textContent = `Te quedan ${diasRestantes} de ${dias} días`;
        } else if (diasRestantes === 1) {
            diasSeleccionados.textContent = `Te queda menos de un día`;
        } else if (diasRestantes < 1 && diasRestantes > 0) {
            let horasRestantes = Math.ceil(diasRestantes * 24);
            diasSeleccionados.textContent = `Te quedan ${horasRestantes} horas`;
        } else {
            diasSeleccionados.textContent = `Tiempo agotado`;
        }

        let limiteVerde = Math.ceil(dias * 0.25);
        let limiteAzul = Math.ceil(dias * 0.50);
        let limiteAmarillo = Math.ceil(dias * 0.75);

        if (diasTranscurridos === 0) {
            progresoAutomatico = 100;
            autoCircle.style.backgroundColor = "green";
            recomendadoText.innerHTML = `<strong>Green</strong><br><small>Acabas de iniciar. Tienes ${limiteVerde} días para mantener este estado óptimo.</small>`;
        } else if (diasRestantes > limiteVerde) {
            progresoAutomatico = 100;
            autoCircle.style.backgroundColor = "green";
            recomendadoText.innerHTML = `<strong>Green</strong><br><small>Si lo terminas en ${limiteVerde} días, mantendrás el estado óptimo.</small>`;
        } else if (diasRestantes > limiteAzul) {
            progresoAutomatico = 75;
            autoCircle.style.backgroundColor = "blue";
            recomendadoText.innerHTML = `<strong>Blue</strong><br><small>Debiste acabar en ${limiteVerde} días, pero aún estás a tiempo.</small>`;
        } else if (diasRestantes > limiteAmarillo) {
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

        if (datosReporte) {
            let dias = datosReporte.dias;
            let fechaInicio = datosReporte.fechaInicio;
            calcularEstatusRecomendado(dias, fechaInicio);

            preguntaDias.style.display = "none";
            configurarEstatus.style.display = "block";
        } else {
            preguntaDias.style.display = "block";
            configurarEstatus.style.display = "none";
        }

        modal.style.display = "flex";
        modalOverlay.style.display = "block"; // Mostrar el overlay
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
        let colores = { G: "green", B: "blue", Y: "yellow", R: "red" };
        progresoManual = { G: 100, B: 75, Y: 50, R: 25 }[valor] || progresoAutomatico;
        manualCircle.style.backgroundColor = colores[valor] || autoCircle.style.backgroundColor;
        manualCircle.textContent = `${progresoManual}%`;
    });

    guardarBtn.addEventListener("click", function () {
        let botonEstatus = document.querySelector(`.ver-estatus-btn[data-folio='${currentFolio}']`);

        let estatusReportes = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        let letraManual = inputManual.value.toUpperCase();
        const letrasValidas = ["G", "B", "Y", "R"];

        if (!letrasValidas.includes(letraManual)) {
            inputManual.value = ""; // Limpiar el campo inválido
            manualCircle.style.backgroundColor = "#ccc"; // Opcional: reset visual
            manualCircle.textContent = "?";
            Swal.fire({
                icon: "warning",
                title: "Valor inválido",
                html: `
                Solo puedes ingresar una letra válida para el estatus manual:<br><br>
                <strong>G</strong> = 100% (Verde)<br>
                <strong>B</strong> = 75% (Azul)<br>
                <strong>Y</strong> = 50% (Amarillo)<br>
                <strong>R</strong> = 25% (Rojo)<br>
            `,
                confirmButtonText: "Entendido"
            });
            return;
        }

        if (!estatusReportes[currentFolio]) estatusReportes[currentFolio] = {};

        estatusReportes[currentFolio].progresoManual = progresoManual;
        estatusReportes[currentFolio].colorManual = letraManual;
        localStorage.setItem("estatusReportes", JSON.stringify(estatusReportes));

        if (botonEstatus) {
            botonEstatus.classList.add("ver-estatus-circulo");
            botonEstatus.classList.add("ver-estatus-btn");
            botonEstatus.style.backgroundColor = manualCircle.style.backgroundColor;
            botonEstatus.style.color = "white";
            botonEstatus.style.textShadow = `-1px -1px 0 black, 1px -1px 0 black, -1px  1px 0 black, 1px  1px 0 black`;
            botonEstatus.style.fontWeight = "bold";
            botonEstatus.style.fontSize = "14px";
            botonEstatus.style.textAlign = "center";
            botonEstatus.textContent = `${progresoManual}%`;
        }

        Swal.fire("¡Estatus Guardado!", `El reporte ha sido actualizado a ${progresoManual}%`, "success");
        modal.style.display = "none";
        modalOverlay.style.display = "none"; // Ocultar el overlay
    });

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
        modalOverlay.style.display = "none"; // Ocultar el overlay
    });

    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("ver-estatus-btn")) {
            abrirModal(event.target.getAttribute("data-folio"));
        }
    });
});
