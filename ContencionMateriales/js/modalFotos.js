document.addEventListener("DOMContentLoaded", () => {
    const modalHTML = `
    <div id="modal-fotos" class="modal-overlay" style="display: none;">
        <div class="modal-content scrollable">
            <h2>Agregar Evidencia</h2>

            <div class="drop-zone" id="drop-ok">
                <label><i class="fa-solid fa-circle-check" style="color: green;"></i> Foto OK:</label>
                <div class="drop-area">Arrastra aquí o <button type="button" class="custom-file-btn" data-target="foto-ok">Elegir archivo</button></div>
                <input type="file" id="foto-ok" accept="image/*" hidden required />
            </div>

            <div class="drop-zone" id="drop-no-ok">
                <label><i class="fa-solid fa-circle-xmark" style="color: red;"></i> Foto NO OK:</label>
                <div class="drop-area">Arrastra aquí o <button type="button" class="custom-file-btn" data-target="foto-no-ok">Elegir archivo</button></div>
                <input type="file" id="foto-no-ok" accept="image/*" hidden required />
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

    const modal = document.getElementById("modal-fotos");
    const btnAbrir = document.querySelector("button.form-button");
    const btnCancelar = document.getElementById("btn-cancelar-fotos");
    const containerOk = document.getElementById("fotos-ok-extra-container");
    const containerNo = document.getElementById("fotos-no-extra-container");
    const btnOk = document.getElementById("btn-agregar-ok");
    const btnNo = document.getElementById("btn-agregar-no");

    let contadorOk = 0;
    let contadorNo = 0;

    btnAbrir.addEventListener("click", () => modal.style.display = "flex");
    btnCancelar.addEventListener("click", () => modal.style.display = "none");

    document.getElementById("btn-confirmar-fotos").addEventListener("click", () => {
        modal.style.display = "none";
    });

    btnOk.addEventListener("click", () => {
        if (contadorOk >= 4) return;
        contadorOk++;
        const div = document.createElement("div");
        div.innerHTML = `
            <label>Foto OK adicional ${contadorOk}:</label>
            <input type="file" accept="image/*" />
        `;
        containerOk.appendChild(div);
    });

    btnNo.addEventListener("click", () => {
        if (contadorNo >= 4) return;
        contadorNo++;
        const div = document.createElement("div");
        div.innerHTML = `
            <label>Foto NO OK adicional ${contadorNo}:</label>
            <input type="file" accept="image/*" />
        `;
        containerNo.appendChild(div);
    });

    document.querySelectorAll(".custom-file-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            document.getElementById(target).click();
        });
    });

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
                area.innerText = `Archivo cargado: ${files[0].name}`;
            }
        });
    });
});
