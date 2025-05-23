// modalFotos.js
document.addEventListener("DOMContentLoaded", () => {
    // 1) Referencias y contadores
    const form        = document.querySelector("form.data-form");
    const modal       = document.getElementById("modal-fotos");
    const btnAbrir    = document.querySelector("button.form-button");
    const btnCancelar = document.getElementById("btn-cancelar-fotos");
    const btnConfirm  = document.getElementById("btn-confirmar-fotos");
    const containerOk = document.getElementById("fotos-ok-extra-container");
    const containerNo = document.getElementById("fotos-no-extra-container");
    const btnOk       = document.getElementById("btn-agregar-ok");
    const btnNo       = document.getElementById("btn-agregar-no");
    const formPreview = document.getElementById("evidencia-preview");
    let contadorOk = 0, contadorNo = 0;

    // 2) Función para acortar nombre de archivo
    function acortarNombre(name, max = 20) {
        if (name.length <= max) return name;
        const ext = name.slice(name.lastIndexOf('.')) || "";
        return name.slice(0, max - ext.length - 3) + "..." + ext;
    }

    // 3) Manejo de inputs principales (OK / NO OK)
    //    Guardamos referencias para reset posterior
    const dropOk     = document.getElementById("drop-ok");
    const areaOk     = dropOk.querySelector(".drop-area");
    const defaultOk  = areaOk.innerHTML;
    const inputOk    = document.getElementById("foto-ok");

    const dropNo     = document.getElementById("drop-no-ok");
    const areaNo     = dropNo.querySelector(".drop-area");
    const defaultNo  = areaNo.innerHTML;
    const inputNo    = document.getElementById("foto-no-ok");

    function bindChooseBtn(areaEl, inputEl) {
        const btn = areaEl.querySelector(".custom-file-btn");
        if (btn) btn.onclick = () => inputEl.click();
    }

    function resetArea(areaEl, defaultHTML, inputEl) {
        areaEl.innerHTML = defaultHTML;
        bindChooseBtn(areaEl, inputEl);
        inputEl.value = "";
    }

    function manejarPrincipal(inputEl, areaEl, defaultHTML) {
        bindChooseBtn(areaEl, inputEl);

        inputEl.addEventListener("change", () => {
            if (!inputEl.files.length) return;
            areaEl.innerHTML = "";
            const file = inputEl.files[0];
            const nombre = acortarNombre(file.name);

            // Nombre + botón de quitar
            const span = document.createElement("span");
            span.textContent = nombre;
            const rm = document.createElement("button");
            rm.type = "button";
            rm.className = "remove-file-btn";
            rm.textContent = "✖";
            rm.addEventListener("click", () => resetArea(areaEl, defaultHTML, inputEl));
            areaEl.append(span, rm);

            // Preview
            const reader = new FileReader();
            reader.onload = e => {
                const result = e.target && e.target.result;
                if (typeof result === 'string') {
                    const img = document.createElement("img");
                    img.src = result;
                    img.style.maxWidth  = "100%";
                    img.style.maxHeight = "100px";
                    img.style.display   = "block";
                    img.style.margin    = "8px auto 0";
                    areaEl.appendChild(img);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    manejarPrincipal(inputOk, areaOk, defaultOk);
    manejarPrincipal(inputNo, areaNo, defaultNo);

    // 4) Abrir / cerrar modal
    btnAbrir.onclick    = () => modal.style.display = "flex";
    btnCancelar.onclick = () => modal.style.display = "none";

    // 5) Crear inputs adicionales
    function manejarExtra(inputEl, areaEl) {
        inputEl.addEventListener("change", () => {
            if (!inputEl.files.length) return;
            const nombre = acortarNombre(inputEl.files[0].name);
            areaEl.innerHTML = "";
            const span = document.createElement("span");
            span.textContent = nombre;
            const rm = document.createElement("button");
            rm.type = "button"; rm.className = "remove-file-btn"; rm.textContent = "✖";
            rm.onclick = () => {
                inputEl.value = "";
                areaEl.innerHTML = "";
            };
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
        manejarExtra(div.querySelector("input[type=file]"), div.querySelector(`.preview-ok-${contadorOk}`));
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
        manejarExtra(div.querySelector("input[type=file]"), div.querySelector(`.preview-no-${contadorNo}`));
    });

    // 6) Drag & drop
    ["drop-ok","drop-no-ok"].forEach(id => {
        const zone   = document.getElementById(id),
            inputE = zone.querySelector("input[type=file]");
        zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("dragging"); });
        zone.addEventListener("dragleave", () => zone.classList.remove("dragging"));
        zone.addEventListener("drop", e => {
            e.preventDefault(); zone.classList.remove("dragging");
            if (e.dataTransfer.files.length) {
                inputE.files = e.dataTransfer.files;
                inputE.dispatchEvent(new Event("change"));
            }
        });
    });

    // 7) Confirmar: mover inputs fuera del modal y cerrar
    btnConfirm.addEventListener("click", () => {
        formPreview.innerHTML = "";

        const inputs = [
            inputOk,
            ...document.querySelectorAll("#fotos-ok-extra-container input[type=file]"),
            inputNo,
            ...document.querySelectorAll("#fotos-no-extra-container input[type=file]")
        ];

        inputs.forEach(inputEl => {
            if (!inputEl.files.length) return;
            form.appendChild(inputEl);

            const reader = new FileReader();
            reader.onload = e => {
                const result = e.target && e.target.result;
                if (typeof result === 'string') {
                    const wrapper = document.createElement("div");
                    wrapper.className = "evidencia-item";
                    const img = document.createElement("img");
                    img.src = result;
                    img.alt = inputEl.files[0].name;
                    const caption = document.createElement("small");
                    caption.textContent = acortarNombre(inputEl.files[0].name, 25);
                    wrapper.append(img, caption);
                    formPreview.appendChild(wrapper);
                }
            };
            reader.readAsDataURL(inputEl.files[0]);
        });

        modal.style.display = "none";
    });

    // 8) RESET general tras enviar/limpiar formulario
    form.addEventListener('reset', () => {
        // Reset previews
        formPreview.innerHTML = '';

        // Reset inputs principales
        resetArea(areaOk, defaultOk, inputOk);
        resetArea(areaNo, defaultNo, inputNo);

        // Reset extras
        contadorOk = 0;
        contadorNo = 0;
        containerOk.innerHTML = `<h3>Fotos OK adicionales (máx. 4):</h3>`;
        containerNo.innerHTML = `<h3>Fotos NO OK adicionales (máx. 4):</h3>`;
    });
});
