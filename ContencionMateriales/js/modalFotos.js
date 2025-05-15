document.addEventListener("DOMContentLoaded", () => {
    const modalHTML = `
    <div id="modal-fotos" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <h2>Agregar Evidencia</h2>

        <label><i class="fa-solid fa-circle-check" style="color: green;"></i> Foto OK:</label>
        <div class="dropzone" id="drop-ok">Arrastra aquí o haz clic para subir (1 foto OK)</div>
        <input type="file" id="foto-ok" accept="image/*" style="display: none;" />

        <div id="extras-ok">
            <p><strong>Fotos OK adicionales (máx. 4):</strong></p>
        </div>
        <button type="button" id="btn-ok-extra">+ Foto OK adicional</button>

        <hr style="margin: 20px 0;">

        <label><i class="fa-solid fa-circle-xmark" style="color: red;"></i> Foto NO OK:</label>
        <div class="dropzone" id="drop-nook">Arrastra aquí o haz clic para subir (1 foto NO OK)</div>
        <input type="file" id="foto-no-ok" accept="image/*" style="display: none;" />

        <div id="extras-nook">
            <p><strong>Fotos NO OK adicionales (máx. 4):</strong></p>
        </div>
        <button type="button" id="btn-nook-extra">+ Foto NO OK adicional</button>

        <div class="modal-buttons">
          <button type="button" id="btn-cancelar-fotos">Cancelar</button>
          <button type="button" id="btn-confirmar-fotos">Confirmar</button>
        </div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("modal-fotos");
    const btnAbrir = document.querySelector("button.form-button");
    const btnCancelar = document.getElementById("btn-cancelar-fotos");
    const dropOK = document.getElementById("drop-ok");
    const dropNOOK = document.getElementById("drop-nook");
    const inputOK = document.getElementById("foto-ok");
    const inputNOOK = document.getElementById("foto-no-ok");
    const extrasOK = document.getElementById("extras-ok");
    const extrasNOOK = document.getElementById("extras-nook");

    let countOK = 0;
    let countNOOK = 0;

    // Abrir y cerrar modal
    btnAbrir.addEventListener("click", () => modal.style.display = "flex");
    btnCancelar.addEventListener("click", () => modal.style.display = "none");

    // Drag and drop para zona OK
    dropOK.addEventListener("click", () => inputOK.click());
    dropNOOK.addEventListener("click", () => inputNOOK.click());

    function setupDrop(drop, input) {
        drop.addEventListener("dragover", e => {
            e.preventDefault();
            drop.classList.add("dragover");
        });
        drop.addEventListener("dragleave", () => drop.classList.remove("dragover"));
        drop.addEventListener("drop", e => {
            e.preventDefault();
            drop.classList.remove("dragover");
            const files = e.dataTransfer.files;
            if (files.length) input.files = files;
        });
    }

    setupDrop(dropOK, inputOK);
    setupDrop(dropNOOK, inputNOOK);

    // Agregar fotos adicionales OK y NO OK
    document.getElementById("btn-ok-extra").addEventListener("click", () => {
        if (countOK >= 4) return;
        countOK++;
        const div = document.createElement("div");
        div.innerHTML = `
            <label>Foto OK adicional ${countOK}:</label>
            <input type="file" name="extra-ok-${countOK}" accept="image/*" />
        `;
        extrasOK.appendChild(div);
    });

    document.getElementById("btn-nook-extra").addEventListener("click", () => {
        if (countNOOK >= 4) return;
        countNOOK++;
        const div = document.createElement("div");
        div.innerHTML = `
            <label>Foto NO OK adicional ${countNOOK}:</label>
            <input type="file" name="extra-nook-${countNOOK}" accept="image/*" />
        `;
        extrasNOOK.appendChild(div);
    });

    // Confirmar
    document.getElementById("btn-confirmar-fotos").addEventListener("click", () => {
        modal.style.display = "none";
        // Puedes guardar los archivos o validarlos aquí
    });
});
