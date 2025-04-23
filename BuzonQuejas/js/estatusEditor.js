// estatusEditor.js
document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Crear canal para notificar cambios de estatus
    const canalEstatus = new BroadcastChannel("canalEstatus");

    // 🔹 Crear el fondo oscuro (overlay)
    let modalOverlay = document.createElement("div");
    modalOverlay.id = "estatus-modal-overlay";
    document.body.appendChild(modalOverlay);

    // 🔹 Crear el modal
    let modal = document.createElement("div");
    modal.id = "estatus-modal";
    modal.style.display = "none";
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
                    <div class="progress-circle manual" id="manual-circle">?</div>
                </div>
            </div>
            <button id="guardar-estatus" class="comic-button">Guardar</button>
        </div>
    </div>`;
    document.body.appendChild(modal);

    // ─────────────────────────────────────────────────────
    // Elementos del modal
    // ─────────────────────────────────────────────────────
    let closeModal        = modal.querySelector(".close-modal");
    let preguntaDias      = modal.querySelector("#pregunta-dias");
    let configurarEstatus = modal.querySelector("#configurar-estatus");
    let diasEvaluacion    = modal.querySelector("#dias-evaluacion");
    let continuarBtn      = modal.querySelector("#continuar-btn");
    let autoCircle        = modal.querySelector("#auto-circle");
    let manualCircle      = modal.querySelector("#manual-circle");
    let inputManual       = modal.querySelector("#input-manual");
    let guardarBtn        = modal.querySelector("#guardar-estatus");
    let diasSeleccionados = modal.querySelector("#dias-seleccionados");
    let recomendadoText   = modal.querySelector("#recomendado-text");

    let progresoAutomatico = 100;
    let progresoManual    = null;
    let currentFolio      = null;

    // ─────────────────────────────────────────────────────
    // Calcula y despliega el estatus recomendado
    // ─────────────────────────────────────────────────────
    function calcularEstatusRecomendado(dias, fechaInicio) {
        const fechaAsignada = new Date(fechaInicio);
        const fechaActual   = new Date();
        const diasTrans     = Math.floor((fechaActual - fechaAsignada) / (1000*60*60*24));
        const diasRest      = dias - diasTrans;

        if (diasRest > 1) {
            diasSeleccionados.textContent = `Te quedan ${diasRest} de ${dias} días`;
        } else if (diasRest === 1) {
            diasSeleccionados.textContent = `Te queda menos de un día`;
        } else if (diasRest > 0) {
            const hrs = Math.ceil(diasRest * 24);
            diasSeleccionados.textContent = `Te quedan ${hrs} horas`;
        } else {
            diasSeleccionados.textContent = `Tiempo agotado`;
        }

        const limVerde    = Math.ceil(dias * 0.25);
        const limAzul     = Math.ceil(dias * 0.50);
        const limAmarillo = Math.ceil(dias * 0.75);

        if (diasTrans === 0 || diasRest > limAzul) {
            progresoAutomatico = 100;
            autoCircle.style.backgroundColor = "green";
            recomendadoText.innerHTML = `<strong>Green</strong><br><small>Tienes ${limVerde} días de margen.</small>`;
        } else if (diasRest > limAmarillo) {
            progresoAutomatico = 75;
            autoCircle.style.backgroundColor = "blue";
            recomendadoText.innerHTML = `<strong>Blue</strong><br><small>Aún estás a tiempo.</small>`;
        } else if (diasRest > 0) {
            progresoAutomatico = 50;
            autoCircle.style.backgroundColor = "yellow";
            recomendadoText.innerHTML = `<strong>Yellow</strong><br><small>Apresúrate.</small>`;
        } else {
            progresoAutomatico = 25;
            autoCircle.style.backgroundColor = "red";
            recomendadoText.innerHTML = `<strong>Red</strong><br><small>Urgente finalizar.</small>`;
        }

        autoCircle.textContent = `${progresoAutomatico}%`;
    }

    // ─────────────────────────────────────────────────────
    // Abre el modal, decide si mostrar días o editar
    // ─────────────────────────────────────────────────────
    function abrirModal(folio) {
        currentFolio = folio;
        progresoManual = null;
        inputManual.value        = "";
        manualCircle.style.backgroundColor = "#ccc";
        manualCircle.textContent = "?";

        const store = JSON.parse(localStorage.getItem("estatusReportes") || "{}");
        const datos = store[folio];
        if (datos && datos.dias && datos.fechaInicio) {
            calcularEstatusRecomendado(datos.dias, datos.fechaInicio);
            preguntaDias.style.display      = "none";
            configurarEstatus.style.display = "block";
        } else {
            preguntaDias.style.display      = "block";
            configurarEstatus.style.display = "none";
        }

        modal.style.display        = "flex";
        modalOverlay.style.display = "block";
    }

    // ─────────────────────────────────────────────────────
    // Al hacer clic en Continuar (guardar días)
    // ─────────────────────────────────────────────────────
    continuarBtn.addEventListener("click", function () {
        const dias = parseInt(diasEvaluacion.value, 10);
        if (!dias || dias < 1) {
            Swal.fire("Error", "Por favor, ingresa un número válido de días.", "error");
            return;
        }
        const fechaInicio = new Date().toISOString();
        const store = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        store[currentFolio] = { dias, fechaInicio };
        localStorage.setItem("estatusReportes", JSON.stringify(store));

        calcularEstatusRecomendado(dias, fechaInicio);
        preguntaDias.style.display      = "none";
        configurarEstatus.style.display = "block";
    });

    // ─────────────────────────────────────────────────────
    // Al modificar manualmente el avance (G/B/Y/R)
    // ─────────────────────────────────────────────────────
    inputManual.addEventListener("input", function () {
        const val = inputManual.value.trim().toUpperCase();
        const mapa   = { G:100, B:75, Y:50, R:25 };
        const colores= { G:"green", B:"blue", Y:"yellow", R:"red" };
        if (mapa[val]) {
            progresoManual = mapa[val];
            manualCircle.style.backgroundColor = colores[val];
            manualCircle.textContent = `${progresoManual}%`;
        } else {
            progresoManual = null;
            manualCircle.style.backgroundColor = "#ccc";
            manualCircle.textContent = "?";
        }
    });

    // ─────────────────────────────────────────────────────
    // Al pulsar Guardar (emite al canal y cierra)
    // ─────────────────────────────────────────────────────
    guardarBtn.addEventListener("click", function () {
        const letraManual = inputManual.value.trim().toUpperCase();
        if (progresoManual === null || !["G","B","Y","R"].includes(letraManual)) {
            Swal.fire("Atención", "Debes ingresar un estatus válido (G/B/Y/R).", "warning");
            return;
        }

        const store = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        if (!store[currentFolio]) store[currentFolio] = {};
        store[currentFolio].progresoManual = progresoManual;
        store[currentFolio].colorManual    = letraManual;
        localStorage.setItem("estatusReportes", JSON.stringify(store));

        // ── Emitir cambio de estatus al canal ───────────
        canalEstatus.postMessage({
            tipo:     "estatus-cambiado",
            folio:    currentFolio,
            progreso: progresoManual,
            color:    letraManual
        });

        // Actualizar botón localmente (opcional si tabla no está visible)
        const btn = document.querySelector(`.ver-estatus-btn[data-folio="${currentFolio}"]`);
        if (btn) {
            btn.className = `ver-estatus-btn ${letraManual.toLowerCase()}`;
            btn.textContent = `${progresoManual}%`;
            btn.style.backgroundColor = letraManual.toLowerCase();
            btn.style.color = "white";
        }

        Swal.fire("¡Estatus Guardado!", `El reporte fue actualizado a ${progresoManual}%`, "success");
        modal.style.display        = "none";
        modalOverlay.style.display = "none";
    });

    // ─────────────────────────────────────────────────────
    // Cerrar modal al hacer clic fuera o en la X
    // ─────────────────────────────────────────────────────
    closeModal.addEventListener("click", function () {
        modal.style.display        = "none";
        modalOverlay.style.display = "none";
    });
    document.body.addEventListener("click", function (e) {
        if (e.target.classList.contains("ver-estatus-btn")) {
            abrirModal(e.target.getAttribute("data-folio"));
        }
    });
});
