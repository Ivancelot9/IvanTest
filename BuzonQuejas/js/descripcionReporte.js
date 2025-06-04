/* --- JS: js/descripcionReporte.js --- */
/**
 * @file descripcionReporte.js
 * @description
 * Inserta dinámicamente un modal para mostrar y editar la descripción de un reporte.
 * Al hacer clic en cualquier botón “mostrar-descripcion” con atributos:
 *   • data-folioreportes="123"
 *   • data-descripcion="…texto completo escapado…"
 * mostrará ese texto íntegro en un modal con animación de escala. Luego permite
 * activar el modo edición y guardar la descripción (POST JSON a actualizarDescripcion.php).
 *
 * Requiere:
 *  - Botones con clase "mostrar-descripcion" y atributos:
 *      • data-folioreportes (folio del reporte)
 *      • data-descripcion (texto de la descripción, HTML-escapado)
 *  - Endpoint PHP "actualizarDescripcion.php" que reciba JSON:
 *      { FolioReportes: int, Descripcion: string }
 */

document.addEventListener("DOMContentLoaded", function () {

    /* ─────────────────────────────────────────
       1. Crear y configurar el modal
    ───────────────────────────────────────── */
    let descripcionModal = document.createElement("div");
    descripcionModal.id = "descripcion-modal";
    descripcionModal.style.display = "none";
    descripcionModal.style.position = "fixed";
    descripcionModal.style.top = "0";
    descripcionModal.style.left = "0";
    descripcionModal.style.width = "100%";
    descripcionModal.style.height = "100%";
    descripcionModal.style.justifyContent = "center";
    descripcionModal.style.alignItems = "center";
    descripcionModal.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    descripcionModal.style.zIndex = "1000";

    descripcionModal.innerHTML = `
      <div class="modal-content descripcion-modal" style="
          background-color: #222; 
          color: #fff; 
          border-radius: 8px; 
          max-width: 600px; 
          width: 90%; 
          padding: 20px; 
          transform: scale(0); 
          opacity: 0; 
          transition: transform 0.3s ease, opacity 0.3s ease;
        ">
        <span class="close-modal" style="
            float: right; 
            font-size: 24px; 
            font-weight: bold; 
            cursor: pointer; 
            color: #fff;
          ">&times;</span>
        <div class="modal-icon-header" style="
            display: flex; 
            align-items: center; 
            margin-bottom: 15px;
          ">
          <i class="fas fa-file-alt" style="margin-right: 8px; font-size: 20px;"></i>
          <span style="font-size: 18px; font-weight: bold;">Descripción del Reporte</span>
        </div>
        <div class="descripcion-container" style="
            margin-bottom: 15px;
          ">
          <p id="descripcion-texto" style="
              background-color: #333; 
              padding: 12px; 
              border-radius: 4px; 
              min-height: 100px; 
              white-space: pre-wrap; 
              margin: 0;
            ">Sin descripción disponible.</p>
          <textarea id="descripcion-editor" style="
              display: none; 
              width: 100%; 
              height: 150px; 
              background-color: #333; 
              color: #fff; 
              border: none; 
              border-radius: 4px; 
              padding: 12px; 
              resize: vertical; 
              font-family: inherit; 
              font-size: 14px;
            "></textarea>
        </div>
        <button id="editar-descripcion-btn" class="btn-editar" style="
            background-color: #007bff; 
            color: #fff; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 4px; 
            cursor: pointer; 
            font-size: 14px;
          ">Editar</button>
      </div>
    `;

    document.body.appendChild(descripcionModal);

    /* ─────────────────────────────────────────
       2. Referencias y estado global
    ───────────────────────────────────────── */
    const modalContent      = descripcionModal.querySelector(".modal-content");
    const closeModalBtn     = descripcionModal.querySelector(".close-modal");
    const btnEditar         = document.getElementById("editar-descripcion-btn");
    const textoElemento     = document.getElementById("descripcion-texto");
    const editorElemento    = document.getElementById("descripcion-editor");
    let lastClickedButton   = null;   // botón “mostrar-descripcion” pulsado
    let folioActual         = null;   // folio de ese botón

    /* ─────────────────────────────────────────
       3. Animación apertura / cierre del modal
    ───────────────────────────────────────── */
    function abrirModal() {
        if (!lastClickedButton) return;
        const rect = lastClickedButton.getBoundingClientRect();
        const originX = rect.left + rect.width/2;
        const originY = rect.top + rect.height/2;
        modalContent.style.transformOrigin = `${originX}px ${originY}px`;

        descripcionModal.style.display = "flex";
        setTimeout(() => {
            modalContent.style.transform = "scale(1)";
            modalContent.style.opacity   = "1";
        }, 10);
    }

    function cerrarModal() {
        modalContent.style.transform = "scale(0)";
        modalContent.style.opacity   = "0";
        setTimeout(() => {
            descripcionModal.style.display = "none";
            // Al cerrar, volvemos a modo “ver”
            textoElemento.style.display   = "block";
            editorElemento.style.display  = "none";
            btnEditar.textContent         = "Editar";
        }, 300);
    }

    /* ─────────────────────────────────────────
       4. Cerrar modal: “X” o clic fuera del contenido
    ───────────────────────────────────────── */
    closeModalBtn.addEventListener("click", cerrarModal);
    descripcionModal.addEventListener("click", function(event) {
        if (event.target === descripcionModal) {
            cerrarModal();
        }
    });

    /* ─────────────────────────────────────────
       5. Abrir modal desde botón “mostrar-descripcion”
    ───────────────────────────────────────── */
    document.addEventListener("click", function (event) {
        if (!event.target.classList.contains("mostrar-descripcion")) return;

        lastClickedButton = event.target;
        folioActual       = lastClickedButton.getAttribute("data-folioreportes");

        // 5.1 Recuperar data-descripción (texto escapado en HTML)
        const rawEscaped = lastClickedButton.getAttribute("data-descripcion") || "Sin descripción disponible.";
        // 5.2 Decodificar entidades HTML para obtener el texto original
        const txtDecoder = document.createElement("textarea");
        txtDecoder.innerHTML = rawEscaped;
        const descripcion = txtDecoder.value;

        // 5.3 Mostrar en el <p id="descripcion-texto">
        textoElemento.textContent    = descripcion;
        editorElemento.value         = descripcion;

        // Configurar modo ver (no editor)
        textoElemento.style.display   = "block";
        editorElemento.style.display  = "none";
        btnEditar.textContent         = "Editar";

        // Abrir el modal con animación
        abrirModal();
    });

    /* ─────────────────────────────────────────
       6. Botón “Editar” / “Guardar”
    ───────────────────────────────────────── */
    btnEditar.addEventListener("click", async () => {
        if (btnEditar.textContent === "Editar") {
            // Modo edición
            const actualTexto = textoElemento.textContent.trim();
            editorElemento.value    = (actualTexto === "Sin descripción disponible.")
                ? ""
                : actualTexto;
            textoElemento.style.display   = "none";
            editorElemento.style.display  = "block";
            btnEditar.textContent         = "Guardar";
            editorElemento.focus();
        } else {
            // Modo guardar: tomar texto del textarea
            const nuevoTexto = editorElemento.value.trim();
            textoElemento.textContent = (nuevoTexto === "")
                ? "Sin descripción disponible."
                : nuevoTexto;
            textoElemento.style.display   = "block";
            editorElemento.style.display  = "none";
            btnEditar.textContent         = "Editar";

            // 6.1 Escapar nuevoTexto para HTML y actualizar data-descripción
            const escaped = nuevoTexto
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            if (lastClickedButton) {
                lastClickedButton.setAttribute("data-descripcion", escaped);
            }

            // 6.2 Enviar al servidor para persistir el cambio
            try {
                const resp = await fetch('actualizarDescripcion.php', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        FolioReportes: parseInt(folioActual),
                        Descripcion:   nuevoTexto
                    })
                });
                if (!resp.ok) {
                    throw new Error("Error en la petición: " + resp.status);
                }
                const json = await resp.json();
                if (json.status === 'success') {
                    console.log('✅ Descripción actualizada en BD');
                } else {
                    alert('❌ Error al actualizar: ' + json.message);
                }
            } catch (err) {
                console.error("Error al conectar a actualizarDescripcion.php:", err);
                alert('❌ No se pudo conectar al servidor: ' + err.message);
            }
        }
    });
});
