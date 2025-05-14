document.addEventListener("DOMContentLoaded", () => {
    // 1. Inyectar el modal completo al final del body
    const modalHTML = `
    <div id="modal-fotos" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <h2>Agregar Evidencia</h2>

            <label>Foto OK:</label>
            <input type="file" id="foto-ok" accept="image/*" required />

            <label>Foto NO OK:</label>
            <input type="file" id="foto-no-ok" accept="image/*" required />

            <div id="fotos-adicionales-container">
                <h3>Fotos adicionales (opcional):</h3>
            </div>
            <button type="button" id="btn-agregar-foto-extra">+ Agregar otra foto</button>

            <div class="modal-buttons">
                <button type="button" id="btn-cancelar-fotos">Cancelar</button>
                <button type="button" id="btn-confirmar-fotos">Confirmar</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 2. Lógica del modal
    const modal = document.getElementById("modal-fotos");
    const btnAbrir = document.querySelector("button.form-button");
    const btnCancelar = document.getElementById("btn-cancelar-fotos");
    const btnAgregarExtra = document.getElementById("btn-agregar-foto-extra");
    const containerExtras = document.getElementById("fotos-adicionales-container");

    let contadorExtras = 0;

    btnAbrir.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    btnCancelar.addEventListener("click", () => {
        modal.style.display = "none";
    });

    btnAgregarExtra.addEventListener("click", () => {
        contadorExtras++;
        const div = document.createElement("div");
        div.innerHTML = `
            <label>Foto adicional ${contadorExtras}:</label>
            <input type="file" name="extra-foto-${contadorExtras}" accept="image/*" />
            <input type="text" placeholder="Comentario para esta foto" name="extra-comentario-${contadorExtras}" />
        `;
        containerExtras.appendChild(div);
    });

    document.getElementById("btn-confirmar-fotos").addEventListener("click", () => {
        modal.style.display = "none";
        // Aquí puedes hacer validaciones o enviar archivos
    });
});
