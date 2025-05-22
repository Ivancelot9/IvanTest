document.addEventListener("DOMContentLoaded", () => {
    // 1) Inyectar el HTML del modal con los name adecuados
    const modalHTML = `
    <div id="modal-fotos" class="modal-overlay" style="display: none;">
      <div class="modal-content scrollable">
        <h2>Agregar Evidencia</h2>

        <div class="drop-zone" id="drop-ok">
          <label><i class="fa-solid fa-circle-check" style="color: green;"></i> Foto OK:</label>
          <div class="drop-area">Arrastra aquí o <button type="button" class="custom-file-btn" data-target="foto-ok">Elegir archivo</button></div>
          <input type="file" id="foto-ok" name="fotosOk[]" accept="image/*" hidden required />
        </div>

        <div class="drop-zone" id="drop-no-ok">
          <label><i class="fa-solid fa-circle-xmark" style="color: red;"></i> Foto NO OK:</label>
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

    // 2) Referencias a elementos
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

    // 3) Función para mostrar nombre y mini‑preview
    function manejarInputFile(inputEl, areaPreview) {
        inputEl.addEventListener("change", () => {
            if (!inputEl.files.length) return;
            const file = inputEl.files[0];
            // Muestra el nombre
            areaPreview.innerHTML = `Archivo cargado: ${file.name}`;
            // Genera y muestra mini‑preview
            const reader = new FileReader();
            reader.onload = e => {
                areaPreview.innerHTML += `<img src="${e.target.result}" style="max-width:100%; max-height:100px; display:block; margin-top:6px;" />`;
            };
            reader.readAsDataURL(file);
        });
    }

    // 4) Manejar principales OK/NO OK
    const dropOk  = document.getElementById("drop-ok");
    const inputOk = document.getElementById("foto-ok");
    const areaOk  = dropOk.querySelector(".drop-area");
    manejarInputFile(inputOk, areaOk);

    const dropNo  = document.getElementById("drop-no-ok");
    const inputNo = document.getElementById("foto-no-ok");
    const areaNo  = dropNo.querySelector(".drop-area");
    manejarInputFile(inputNo, areaNo);

    // 5) Abrir y cerrar modal
    btnAbrir.addEventListener("click",  () => modal.style.display = "flex");
    btnCancelar.addEventListener("click", () => modal.style.display = "none");
    btnConfirm.addEventListener("click",   () => modal.style.display = "none");

    // 6) Crear inputs extras y aplicar preview también
    btnOk.addEventListener("click", () => {
        if (contadorOk >= 4) return;
        contadorOk++;
        const div = document.createElement("div");
        div.innerHTML = `
      <label>Foto OK adicional ${contadorOk}:</label>
      <input type="file" name="fotosOk[]" accept="image/*" />
      <div class="preview-ok-${contadorOk}"></div>
    `;
        containerOk.appendChild(div);
        const nuevoInput = div.querySelector('input[type="file"]');
        const nuevaArea  = div.querySelector(`.preview-ok-${contadorOk}`);
        manejarInputFile(nuevoInput, nuevaArea);
    });

    btnNo.addEventListener("click", () => {
        if (contadorNo >= 4) return;
        contadorNo++;
        const div = document.createElement("div");
        div.innerHTML = `
      <label>Foto NO OK adicional ${contadorNo}:</label>
      <input type="file" name="fotosNo[]" accept="image/*" />
      <div class="preview-no-${contadorNo}"></div>
    `;
        containerNo.appendChild(div);
        const nuevoInput = div.querySelector('input[type="file"]');
        const nuevaArea  = div.querySelector(`.preview-no-${contadorNo}`);
        manejarInputFile(nuevoInput, nuevaArea);
    });

    // 7) Botones personalizados para elegir archivo
    document.querySelectorAll(".custom-file-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            document.getElementById(target).click();
        });
    });

    // 8) Drag & drop con preview tras drop
    ["drop-ok", "drop-no-ok"].forEach(zoneId => {
        const dropZone = document.getElementById(zoneId);
        const fileInput = dropZone.querySelector("input[type='file']");
        const area = dropZone.querySelector(".drop-area");

        dropZone.addEventListener("dragover", e => {
            e.preventDefault();
            dropZone.classList.add("dragging");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("dragging");
        });

        dropZone.addEventListener("drop", e => {
            e.preventDefault();
            dropZone.classList.remove("dragging");
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                // disparar change para preview
                fileInput.dispatchEvent(new Event("change"));
            }
        });
    });
});
