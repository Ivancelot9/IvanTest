document.addEventListener("DOMContentLoaded", () => {
    // 1) Inyectar HTML del modal con name para PHP
    const modalHTML = `
    <div id="modal-fotos" class="modal-overlay" style="display: none;">
      <div class="modal-content scrollable">
        <h2>Agregar Evidencia</h2>

        <div class="drop-zone" id="drop-ok">
          <label>Foto OK:</label>
          <div class="drop-area">Arrastra aquí o <button type="button" class="custom-file-btn" data-target="foto-ok">Elegir archivo</button></div>
          <input type="file" id="foto-ok" name="fotosOk[]" accept="image/*" hidden required />
        </div>

        <div class="drop-zone" id="drop-no-ok">
          <label>Foto NO OK:</label>
          <div class="drop-area">Arrastra aquí o <button type="button" class="custom-file-btn" data-target="foto-no-ok">Elegir archivo</button></div>
          <input type="file" id="foto-no-ok" name="fotosNo[]" accept="image/*" hidden required />
        </div>

        <div id="fotos-ok-extra-container">
          <h3>Fotos OK adicionales (máx. 4):</h3>
        </div>
        <button type="button" id="btn-agregar-ok">+ Foto OK adicional</button>

        <div id="fotos-no-extra-container">
          <h3>Fotos NO OK adicionales (máx. 4):</h3>
        </div>
        <button type="button" id="btn-agregar-no">+ Foto NO OK adicional</button>

        <div class="modal-buttons">
          <button type="button" id="btn-cancelar-fotos">Cancelar</button>
          <button type="button" id="btn-confirmar-fotos">Confirmar</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 2) Referencias
    const modal       = document.getElementById("modal-fotos");
    const btnAbrir    = document.querySelector("button.form-button");
    const btnCancelar = document.getElementById("btn-cancelar-fotos");
    const btnConfirm  = document.getElementById("btn-confirmar-fotos");
    const containerOk = document.getElementById("fotos-ok-extra-container");
    const containerNo = document.getElementById("fotos-no-extra-container");
    const btnOk       = document.getElementById("btn-agregar-ok");
    const btnNo       = document.getElementById("btn-agregar-no");

    let contadorOk = 0;
    let contadorNo = 0;

    // 3) Vista previa de imagen y nombre
    function manejarInputFile(inputEl, areaPreview) {
        inputEl.addEventListener("change", () => {
            if (!inputEl.files.length) return;
            const file = inputEl.files[0];
            areaPreview.innerHTML = `Archivo cargado: ${file.name}`;
            const reader = new FileReader();
            reader.onload = e => {
                areaPreview.innerHTML += `
          <img src="${e.target.result}"
               style="max-width:100%; max-height:100px; display:block; margin:8px auto 0;" />`;
            };
            reader.readAsDataURL(file);
        });
    }

    // 4) Asociar preview a inputs principales
    const dropOk  = document.getElementById("drop-ok");
    const inputOk = document.getElementById("foto-ok");
    manejarInputFile(inputOk, dropOk.querySelector(".drop-area"));

    const dropNo  = document.getElementById("drop-no-ok");
    const inputNo = document.getElementById("foto-no-ok");
    manejarInputFile(inputNo, dropNo.querySelector(".drop-area"));

    // 5) Abrir / cerrar modal
    btnAbrir.addEventListener("click",  () => modal.style.display = "flex");
    btnCancelar.addEventListener("click", () => modal.style.display = "none");
    btnConfirm.addEventListener("click",   () => modal.style.display = "none");

    // 6) Inputs extra con preview
    btnOk.addEventListener("click", () => {
        if (contadorOk >= 4) return;
        contadorOk++;
        const div = document.createElement("div");
        div.innerHTML = `
      <label>Foto OK adicional ${contadorOk}:</label>
      <input type="file" name="fotosOk[]" accept="image/*" />
      <div class="preview-ok-${contadorOk}"></div>`;
        containerOk.appendChild(div);
        manejarInputFile(div.querySelector('input[type="file"]'),
            div.querySelector(`.preview-ok-${contadorOk}`));
    });

    btnNo.addEventListener("click", () => {
        if (contadorNo >= 4) return;
        contadorNo++;
        const div = document.createElement("div");
        div.innerHTML = `
      <label>Foto NO OK adicional ${contadorNo}:</label>
      <input type="file" name="fotosNo[]" accept="image/*" />
      <div class="preview-no-${contadorNo}"></div>`;
        containerNo.appendChild(div);
        manejarInputFile(div.querySelector('input[type="file"]'),
            div.querySelector(`.preview-no-${contadorNo}`));
    });

    // 7) Botones “Elegir archivo”
    document.querySelectorAll(".custom-file-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById(btn.dataset.target).click();
        });
    });

    // 8) Drag & drop con preview
    ["drop-ok", "drop-no-ok"].forEach(zoneId => {
        const dropZone = document.getElementById(zoneId);
        const fileInput = dropZone.querySelector("input[type='file']");
        dropZone.addEventListener("dragover", e => {
            e.preventDefault(); dropZone.classList.add("dragging");
        });
        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("dragging");
        });
        dropZone.addEventListener("drop", e => {
            e.preventDefault(); dropZone.classList.remove("dragging");
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event("change"));
            }
        });
    });
});
