document.addEventListener("DOMContentLoaded", () => {
    const modalHTML = `
    <div id="modal-fotos" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <h2>📎 Agregar Evidencia</h2>

            <label><i class="fa-solid fa-circle-check" style="color: green;"></i> Foto OK:</label>
            <input type="file" id="foto-ok" accept="image/*" required />

            <div id="ok-adicionales-container">
                <h4>Fotos OK adicionales (máx. 4):</h4>
            </div>

            <button type="button" class="btn-mini" id="btn-ok-extra">+ Foto OK adicional</button>

            <label style="margin-top: 20px;"><i class="fa-solid fa-circle-xmark" style="color: red;"></i> Foto NO OK:</label>
            <input type="file" id="foto-no-ok" accept="image/*" required />

            <div id="no-ok-adicionales-container">
                <h4>Fotos NO OK adicionales (máx. 4):</h4>
            </div>

            <button type="button" class="btn-mini" id="btn-no-ok-extra">+ Foto NO OK adicional</button>

            <div class="modal-buttons">
                <button type="button" id="btn-cancelar-fotos">Cancelar</button>
                <button type="button" id="btn-confirmar-fotos">Confirmar</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("modal-fotos");
    const btnAbrir = document.querySelector("button.form-button");
    const btnCancelar = document.getElementById("btn-cancelar-fotos");
    const btnConfirmar = document.getElementById("btn-confirmar-fotos");
    const btnExtraOK = document.getElementById("btn-ok-extra");
    const btnExtraNO = document.getElementById("btn-no-ok-extra");
    const contenedorOK = document.getElementById("ok-adicionales-container");
    const contenedorNO = document.getElementById("no-ok-adicionales-container");

    let okCounter = 0;
    let noOkCounter = 0;

    btnAbrir.addEventListener("click", () => modal.style.display = "flex");
    btnCancelar.addEventListener("click", () => modal.style.display = "none");
    btnConfirmar.addEventListener("click", () => {
        modal.style.display = "none";
        // Validación o envío
    });

    btnExtraOK.addEventListener("click", () => {
        if (okCounter >= 4) {
            alert("Solo puedes agregar hasta 5 fotos OK en total.");
            return;
        }
        okCounter++;
        const div = document.createElement("div");
        div.innerHTML = `
            <label>Foto OK adicional ${okCounter}:</label>
            <input type="file" name="foto-ok-extra-${okCounter}" accept="image/*">
        `;
        contenedorOK.appendChild(div);
    });

    btnExtraNO.addEventListener("click", () => {
        if (noOkCounter >= 4) {
            alert("Solo puedes agregar hasta 5 fotos NO OK en total.");
            return;
        }
        noOkCounter++;
        const div = document.createElement("div");
        div.innerHTML = `
            <label>Foto NO OK adicional ${noOkCounter}:</label>
            <input type="file" name="foto-no-ok-extra-${noOkCounter}" accept="image/*">
        `;
        contenedorNO.appendChild(div);
    });
});
