// modalFotos.js
document.addEventListener("DOMContentLoaded", () => {
    // 1) Inyectar el HTML del modal
    const modalHTML = `
    <div id="modal-fotos" class="modal-overlay" style="display: none;">
      <div class="modal-content scrollable">
        <h2>Agregar Evidencia</h2>

        <div class="drop-zone" id="drop-ok">
          <label>Foto OK:</label>
          <div class="drop-area">
            Arrastra aquí o 
            <button type="button" class="custom-file-btn" data-target="foto-ok">Elegir archivo</button>
          </div>
          <input type="file" id="foto-ok" name="fotosOk[]" accept="image/*" hidden />
        </div>

        <div class="drop-zone" id="drop-no-ok">
          <label>Foto NO OK:</label>
          <div class="drop-area">
            Arrastra aquí o 
            <button type="button" class="custom-file-btn" data-target="foto-no-ok">Elegir archivo</button>
          </div>
          <input type="file" id="foto-no-ok" name="fotosNo[]" accept="image/*" hidden />
        </div>

        <div id="fotos-ok-extra-container"><h3>Fotos OK adicionales (máx. 4):</h3></div>
        <button type="button" id="btn-agregar-ok">+ Foto OK adicional</button>

        <div id="fotos-no-extra-container"><h3>Fotos NO OK adicionales (máx. 4):</h3></div>
        <button type="button" id="btn-agregar-no">+ Foto NO OK adicional</button>

        <div class="modal-buttons">
          <button type="button" id="btn-cancelar-fotos">Cancelar</button>
          <button type="button" id="btn-confirmar-fotos">Confirmar</button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // 2) Referencias y contadores
    const modal       = document.getElementById("modal-fotos");
    const btnAbrir    = document.querySelector("button.form-button");
    const btnCancelar = document.getElementById("btn-cancelar-fotos");
    const btnConfirm  = document.getElementById("btn-confirmar-fotos");
    const containerOk = document.getElementById("fotos-ok-extra-container");
    const containerNo = document.getElementById("fotos-no-extra-container");
    const btnOk       = document.getElementById("btn-agregar-ok");
    const btnNo       = document.getElementById("btn-agregar-no");
    const formPreview = document.getElementById("evidencia-preview"); // contenedor en el formulario
    let contadorOk = 0, contadorNo = 0;

    // 3) Acortar nombre de archivo
    function acortarNombre(name, max = 20) {
        if (name.length <= max) return name;
        const ext = name.slice(name.lastIndexOf('.')) || "";
        return name.slice(0, max - ext.length - 3) + "..." + ext;
    }

    // 4) Manejar inputs principales (preview + quitar + rebind)
    function manejarPrincipal(inputEl, areaEl, defaultHTML) {
        function bindChooseBtn() {
            const btn = areaEl.querySelector(".custom-file-btn");
            if (btn) btn.onclick = () => inputEl.click();
        }
        bindChooseBtn();

        function resetArea() {
            areaEl.innerHTML = defaultHTML;
            bindChooseBtn();
            inputEl.value = "";
        }

        inputEl.addEventListener("change", () => {
            if (!inputEl.files.length) return;
            areaEl.innerHTML = "";
            const file = inputEl.files[0];
            const nombre = acortarNombre(file.name);

            const span = document.createElement("span");
            span.textContent = nombre;
            const rm = document.createElement("button");
            rm.type = "button"; rm.className = "remove-file-btn"; rm.textContent = "✖";
            rm.addEventListener("click", resetArea);
            areaEl.append(span, rm);

            const reader = new FileReader();
            reader.onload = e => {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.style.maxWidth  = "100%";
                img.style.maxHeight = "100px";
                img.style.display   = "block";
                img.style.margin    = "8px auto 0";
                areaEl.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    // 5) Asociar principales
    const dropOk    = document.getElementById("drop-ok"),
        areaOk    = dropOk.querySelector(".drop-area"),
        defaultOk = areaOk.innerHTML;
    manejarPrincipal(document.getElementById("foto-ok"), areaOk, defaultOk);

    const dropNo    = document.getElementById("drop-no-ok"),
        areaNo    = dropNo.querySelector(".drop-area"),
        defaultNo = areaNo.innerHTML;
    manejarPrincipal(document.getElementById("foto-no-ok"), areaNo, defaultNo);

    // 6) Abrir / cerrar modal
    btnAbrir.onclick    = () => modal.style.display = "flex";
    btnCancelar.onclick = () => modal.style.display = "none";

    // 7) Crear inputs adicionales (solo nombre + quitar)
    function manejarExtra(inputEl, areaEl) {
        inputEl.addEventListener("change", () => {
            if (!inputEl.files.length) return;
            const nombre = acortarNombre(inputEl.files[0].name);
            areaEl.innerHTML = "";
            const span = document.createElement("span");
            span.textContent = nombre;
            const rm = document.createElement("button");
            rm.type = "button"; rm.className = "remove-file-btn"; rm.textContent = "✖";
            rm.onclick = () => { inputEl.value = ""; areaEl.innerHTML = ""; };
            areaEl.append(span, rm);
        });
    }

    btnOk.addEventListener("click", () => {
        if (contadorOk >= 4) return;
        contadorOk++;
        const div = document.createElement("div");
        div.innerHTML = `
      <label>Foto OK adicional ${contadorOk}:</label>
      <input type="file" name="fotosOk[]" accept="image/*" />
      <div class="preview-ok-${contadorOk}"></div>`;
        containerOk.appendChild(div);
        manejarExtra(div.querySelector("input[type=file]"),
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
        manejarExtra(div.querySelector("input[type=file]"),
            div.querySelector(`.preview-no-${contadorNo}`));
    });

    // 8) Botones “Elegir archivo”
    document.querySelectorAll(".custom-file-btn").forEach(btn =>
        btn.addEventListener("click", () =>
            document.getElementById(btn.dataset.target).click()
        )
    );

    // 9) Drag & drop con dispatch de change
    ["drop-ok", "drop-no-ok"].forEach(id => {
        const zone   = document.getElementById(id),
            inputE = zone.querySelector("input[type=file]");
        zone.addEventListener("dragover", e => {
            e.preventDefault(); zone.classList.add("dragging");
        });
        zone.addEventListener("dragleave", () => zone.classList.remove("dragging"));
        zone.addEventListener("drop", e => {
            e.preventDefault(); zone.classList.remove("dragging");
            if (e.dataTransfer.files.length) {
                inputE.files = e.dataTransfer.files;
                inputE.dispatchEvent(new Event("change"));
            }
        });
    });

    // 10) Confirmar: volcar previews al formulario y cerrar
    btnConfirm.addEventListener("click", () => {
        // Vaciar cualquier preview previo
        formPreview.innerHTML = "";

        // Recoger todos los file inputs del modal
        const inputs = [
            document.getElementById("foto-ok"),
            ...document.querySelectorAll("#fotos-ok-extra-container input[type=file]"),
            document.getElementById("foto-no-ok"),
            ...document.querySelectorAll("#fotos-no-extra-container input[type=file]")
        ];

        inputs.forEach(inputEl => {
            if (!inputEl.files.length) return;
            const file = inputEl.files[0];
            const reader = new FileReader();
            reader.onload = e => {
                // wrapper para miniatura + nombre
                const wrapper = document.createElement("div");
                wrapper.className = "evidencia-item";
                const img = document.createElement("img");
                img.src = e.target.result;
                img.alt = file.name;
                const caption = document.createElement("small");
                caption.textContent = acortarNombre(file.name, 25);
                wrapper.append(img, caption);
                formPreview.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });

        modal.style.display = "none";
    });
});
