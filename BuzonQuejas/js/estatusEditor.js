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

    let guardarBtn = modal.querySelector("#guardar-estatus");

    guardarBtn.addEventListener("click", function () {
        let estatusReportes = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        let progresoManual = parseInt(document.querySelector("#manual-circle").textContent);

        if (estatusReportes[currentFolio]) {
            estatusReportes[currentFolio].progresoManual = progresoManual;
        }
        localStorage.setItem("estatusReportes", JSON.stringify(estatusReportes));

        let botonEstatus = document.querySelector(`button[data-folio="${currentFolio}"]`);
        if (botonEstatus) {
            botonEstatus.classList.remove("green", "blue", "yellow", "red");
            botonEstatus.classList.add(obtenerClaseEstado(progresoManual));
        }

        Swal.fire({
            icon: "success",
            title: "¡Estatus Guardado!",
            text: `El reporte ha sido actualizado a ${progresoManual}%`,
            confirmButtonText: "Entendido"
        }).then(() => {
            modal.style.display = "none";
        });
    });
});
