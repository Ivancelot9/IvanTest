/* --- JS: js/estatusEditor.js --- */
/**
 * @file estatusEditor.js
 * @description
 * Controla el modal de configuración de estatus de un reporte:
 *  1. Pregunta al usuario cuántos días tardará en evaluar el reporte (solo para mostrar recomendado).
 *  2. Calcula y muestra el estatus automático en función del tiempo restante (visual).
 *  3. Permite ingresar un estatus manual (G, B, Y, R).
 *  4. Guarda en localStorage únicamente cuando el usuario selecciona un color manual y pulsa “Guardar”.
 *  5. Notifica cambios mediante BroadcastChannel para actualización en tiempo real.
 *
 * Requiere:
 *  - SweetAlert2 (Swal) cargado globalmente.
 *  - Botones con clase "ver-estatus-btn" y atributo data-folio para abrir el modal.
 *  - Estilos CSS para .comic-bubble, .comic-button, .progress-circle, etc.
 */

document.addEventListener("DOMContentLoaded", function () {
    /* ─────────────────────────────────────────
       1. Creación de overlay y modal
    ───────────────────────────────────────── */
    // 🔹 Crear el fondo oscuro (overlay) que cubre toda la pantalla
    let modalOverlay = document.createElement("div");
    modalOverlay.id  = "estatus-modal-overlay";
    document.body.appendChild(modalOverlay);

    // 🔹 Crear el contenedor principal del modal y ocultarlo inicialmente
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

    // 🔹 Agregar el modal al final del <body>
    document.body.appendChild(modal);

    /* ─────────────────────────────────────────
       2. Referencias a elementos internos y estado global
    ───────────────────────────────────────── */
    let closeModal          = modal.querySelector(".close-modal");        // Icono de cierre
    let preguntaDias        = modal.querySelector("#pregunta-dias");      // Paso de ingresar días
    let configurarEstatus   = modal.querySelector("#configurar-estatus"); // Paso de configurar estatus
    let diasEvaluacionInput = modal.querySelector("#dias-evaluacion");    // Input de días
    let continuarBtn        = modal.querySelector("#continuar-btn");      // Botón continuar
    let autoCircle          = modal.querySelector("#auto-circle");        // Círculo estatus automático
    let manualCircle        = modal.querySelector("#manual-circle");      // Círculo estatus manual
    let inputManual         = modal.querySelector("#input-manual");       // Input manual
    let guardarBtn          = modal.querySelector("#guardar-estatus");    // Botón guardar
    let diasSeleccionados   = modal.querySelector("#dias-seleccionados"); // Texto días restantes
    let recomendadoText     = modal.querySelector("#recomendado-text");   // Descripción recomendada

    // Variables para almacenar los porcentajes y folio actual
    let progresoAutomatico  = 100; // % calculado automáticamente
    let progresoManual      = 100; // % definido por el usuario
    let currentFolio        = null; // Folio del reporte que se está editando

    /* ─────────────────────────────────────────
       3. Funciones utilitarias
    ───────────────────────────────────────── */
    /**
     * Calcula y muestra el estatus recomendado según días asignados y tiempo transcurrido.
     * @param {number} dias         - Cantidad de días para evaluar.
     * @param {string} fechaInicio  - Fecha ISO de inicio de la evaluación.
     */
    function calcularEstatusRecomendado(dias, fechaInicio) {
        let fechaAsignada     = new Date(fechaInicio);
        let fechaActual       = new Date();
        // Días completos transcurridos
        let diasTranscurridos = Math.floor((fechaActual - fechaAsignada) / (1000 * 60 * 60 * 24));
        let diasRestantes     = dias - diasTranscurridos;

        // 🔹 Mostrar texto de días restantes u horas
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

        // 🔹 Definir límites porcentuales para colores
        let limiteVerde    = Math.ceil(dias * 0.25);
        let limiteAzul     = Math.ceil(dias * 0.50);
        let limiteAmarillo = Math.ceil(dias * 0.75);

        // 🔹 Asignar porcentaje y color según tiempo restante
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

        // 🔹 Actualizar texto del círculo automático
        autoCircle.textContent = `${progresoAutomatico}%`;
    }

    /**
     * Abre el modal y determina si mostrar paso de días o configuración.
     * @param {string} folio - Folio del reporte a configurar.
     */
    function abrirModal(folio) {
        currentFolio = folio;

        // 🔹 Revisar si ya hay datos guardados para este folio (solo colorManual interesa)
        let estatusGuardados = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        let datosReporte     = estatusGuardados[currentFolio];

        if (datosReporte && datosReporte.colorManual) {
            // Si ya existe configuración previa con colorManual, mostrar configuración directa
            preguntaDias.style.display      = "none";
            configurarEstatus.style.display = "block";
            // Prellenar el círculo con el color y porcentaje guardados
            manualCircle.style.backgroundColor = datosReporte.colorHex;
            manualCircle.textContent           = `${datosReporte.progresoManual}%`;
        } else {
            // Si no hay color guardado, iniciar con pregunta de días
            preguntaDias.style.display      = "block";
            configurarEstatus.style.display = "none";
            // Resetear valores visuales del modal
            diasEvaluacionInput.value = "";
            diasSeleccionados.textContent = "0";
            autoCircle.style.backgroundColor = "green";
            autoCircle.textContent = "100%";
            recomendadoText.textContent = "";
            inputManual.value = "";
            manualCircle.style.backgroundColor = "green";
            manualCircle.textContent = "100%";
        }

        modal.style.display        = "flex";
        modalOverlay.style.display = "block"; // Mostrar overlay
    }

    /* ─────────────────────────────────────────
       4. Manejo de eventos de usuario
    ───────────────────────────────────────── */
    // Cerrar modal al pulsar icono de cierre
    closeModal.addEventListener("click", function () {
        modal.style.display        = "none";
        modalOverlay.style.display = "none";
    });

    // Continuar desde pregunta de días a configuración
    continuarBtn.addEventListener("click", function () {
        let dias = parseInt(diasEvaluacionInput.value, 10);
        if (!dias || dias < 1) {
            Swal.fire("Error", "Por favor, ingresa un número válido de días.", "error");
            return;
        }

        // No guardamos nada en localStorage en este paso.
        // Solo calculamos y mostramos el estatus recomendado, pero no se persiste.
        let fechaInicio = new Date().toISOString();
        calcularEstatusRecomendado(dias, fechaInicio);
        preguntaDias.style.display      = "none";
        configurarEstatus.style.display = "block";
    });

    // Capturar entrada manual de estatus (G, B, Y, R)
    inputManual.addEventListener("input", function () {
        let valor   = inputManual.value.toUpperCase();
        let colores = { G: "green", B: "blue", Y: "yellow", R: "red" };
        // 🔹 Mapear letra a porcentaje o usar automático si inválido
        progresoManual = { G: 100, B: 75, Y: 50, R: 25 }[valor] || progresoAutomatico;
        manualCircle.style.backgroundColor = colores[valor] || autoCircle.style.backgroundColor;
        manualCircle.textContent = `${progresoManual}%`;
    });

    // Guardar configuración manual y notificar via BroadcastChannel
    guardarBtn.addEventListener("click", function () {
        let botonEstatus     = document.querySelector(`.ver-estatus-btn[data-folio='${currentFolio}']`);
        let letraManual      = inputManual.value.toUpperCase();
        const letrasValidas  = ["G", "B", "Y", "R"];

        if (!letrasValidas.includes(letraManual)) {
            // 🔹 Validación de letra manual válida
            inputManual.value = "";
            manualCircle.style.backgroundColor = "#ccc";
            manualCircle.textContent = "?";
            Swal.fire({
                icon: "warning",
                title: "Valor inválido",
                html: `Solo puedes ingresar una letra válida para el estatus manual:<br><br>
                       <strong>G</strong> = 100% (Verde)<br>
                       <strong>B</strong> = 75% (Azul)<br>
                       <strong>Y</strong> = 50% (Amarillo)<br>
                       <strong>R</strong> = 25% (Rojo)`,
                confirmButtonText: "Entendido"
            });
            return;
        }

        // 🔹 Guardamos SÓLO el color y porcentaje manual en localStorage
        let estatusReportes                  = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        estatusReportes[currentFolio]        = {};
        estatusReportes[currentFolio].colorManual    = letraManual;
        estatusReportes[currentFolio].progresoManual = progresoManual;
        estatusReportes[currentFolio].colorHex       = manualCircle.style.backgroundColor;
        localStorage.setItem("estatusReportes", JSON.stringify(estatusReportes));

        // 🔹 Enviar actualización via BroadcastChannel
        const canalStatus = new BroadcastChannel("canalStatus");
        canalStatus.postMessage({
            folio:    currentFolio,
            progreso: progresoManual,
            color:    manualCircle.style.backgroundColor
        });

        // 🔹 Actualizar estilos y texto del botón de estatus
        if (botonEstatus) {
            botonEstatus.classList.add("ver-estatus-circulo");
            botonEstatus.style.backgroundColor = manualCircle.style.backgroundColor;
            botonEstatus.style.color           = "white";
            botonEstatus.style.textShadow      = `-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black`;
            botonEstatus.style.fontWeight      = "bold";
            botonEstatus.style.fontSize        = "14px";
            botonEstatus.style.textAlign       = "center";
            botonEstatus.textContent           = `${progresoManual}%`;
        }

        Swal.fire("¡Estatus Guardado!", `El reporte ha sido actualizado a ${progresoManual}%`, "success");
        modal.style.display        = "none";
        modalOverlay.style.display = "none";
    });

    /* ─────────────────────────────────────────
       5. Delegación para abrir el modal desde botones de estatus
    ───────────────────────────────────────── */
    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("ver-estatus-btn")) {
            abrirModal(event.target.getAttribute("data-folio"));
        }
    });

    // ─── Inicializa todos los botones sin estado previo ───
    (function inicializarBotonesDefault() {
        const estatusGuardados = JSON.parse(localStorage.getItem('estatusReportes')) || {};
        document.querySelectorAll('.ver-estatus-btn').forEach(btn => {
            const folio = btn.getAttribute('data-folio');
            if (!estatusGuardados[folio] || !estatusGuardados[folio].colorManual) {
                // Quita la clase de “configurado” si la tuviera
                btn.classList.remove('ver-estatus-circulo');
                // Asegura que no queden estilos inline de ejecuciones previas
                btn.style.backgroundColor = '';
                btn.style.color           = '';
                btn.style.textShadow      = '';
                btn.textContent           = '';
            }
        });
    })();
});
