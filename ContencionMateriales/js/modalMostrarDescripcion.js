/**
 * @file modalMostrarDescripcion.js
 * @project Contención de Materiales
 * @module modalMostrarDescripcion
 * @purpose Mostrar el modal de detalles de un caso (folio)
 * @description
 * Este script controla la visualización de un modal que muestra todos los detalles
 * de un caso previamente registrado: datos generales, defectos, fotos y el PDF del método de trabajo.
 * También implementa una vista tipo lightbox para ampliar imágenes al hacer clic.
 * ⚠️ Este módulo depende del endpoint:
 *  * - `dao/obtenerCaso.php` → Devuelve un objeto JSON con toda la información del caso.
 *
 * Este archivo es utilizado directamente en el dashboard, con los elementos del modal
 * declarados en el HTML (IDs como `modal-descripcion`, `r-folio`, `r-defectos-container`, etc.).
 *
 * Depende de `Swal.fire` (SweetAlert2) para mostrar errores y del archivo `obtenerCaso.php`
 * para obtener los datos por AJAX vía `fetch`.
 *
 * @author Ivan Medina / Hadbet Altamirano
 * @created Junio 2025
 * @updated [¿?]
 */

(function () {
    // Elementos del modal principal
    const modal = document.getElementById('modal-descripcion');
    const btnClose = modal.querySelector('#modal-cerrar');

    // Elementos del lightbox para imágenes
    const lb = document.getElementById('modal-image');
    const lbImg = lb.querySelector('img');
    const lbClose = lb.querySelector('.close-img');

    // Campos a rellenar con datos del caso
    const campos = {
        folio: document.getElementById('r-folio'),
        fecha: document.getElementById('r-fecha'),
        numeroParte: document.getElementById('r-parte'),
        cantidad: document.getElementById('r-cantidad'),
        descripcion: document.getElementById('r-descripcion'),
        terciaria: document.getElementById('r-terciaria'),
        proveedor: document.getElementById('r-proveedor'),
        commodity: document.getElementById('r-commodity')
    };

    // Contenedores de defectos y método de trabajo
    const contDefectos = document.getElementById('r-defectos-container');
    const metodoTrabajoEl = document.getElementById('r-metodo-trabajo');

    // Oculta modal y lightbox al iniciar
    modal.style.display = 'none';
    lb.style.display = 'none';

    // Cerrar modal general
    btnClose.onclick = () => modal.style.display = 'none';

    // Cerrar lightbox
    lbClose.onclick = () => lb.style.display = 'none';
    lb.addEventListener('click', e => {
        if (e.target === lb) lb.style.display = 'none';
    });

    /**
     * Función global para mostrar el modal con todos los datos del caso
     * @param {string|number} folio - Folio del caso a consultar
     */
    window.mostrarModalDescripcion = async folio => {
        // Limpia los campos antes de cargar
        Object.values(campos).forEach(el => el.textContent = '');
        contDefectos.innerHTML = '';
        metodoTrabajoEl.textContent = '(Cargando...)';
        modal.style.display = 'flex';

        try {
            const res = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.error || data.status === 'error') {
                throw new Error(data.error || data.message);
            }

            // Rellena los campos con la respuesta
            campos.folio.textContent        = data.folio;
            campos.fecha.textContent        = data.fecha.split('-').reverse().join('-');
            campos.numeroParte.textContent  = data.numeroParte;
            campos.cantidad.textContent     = data.cantidad;
            campos.terciaria.textContent    = data.terciaria;
            campos.proveedor.textContent    = data.proveedor;
            campos.commodity.textContent    = data.commodity;
            campos.descripcion.textContent  = data.descripcion || '(sin descripción)';

            // Muestra el PDF del método de trabajo si existe
            if (data.metodoTrabajo) {
                metodoTrabajoEl.innerHTML = `
        <iframe src="dao/uploads/pdf/${encodeURIComponent(data.metodoTrabajo)}"
                width="100%" height="500px"
                style="border:1px solid var(--card-border); border-radius: 6px;"></iframe>
    `;
            } else {
                metodoTrabajoEl.innerHTML = '(No disponible)';
            }

            // Renderiza los defectos con fotos
            const html = data.defectos.map(def => `
                <div class="defect-block">
                    <h3 class="defect-title">${def.nombre}</h3>
                    <div class="photos-row">
                        <div class="photos-group ok">
                            <div class="group-title">OK</div>
                            <div class="thumbs">
                                ${def.fotosOk.map(r => `<img src="dao/uploads/ok/${r}" alt="OK">`).join('')}
                            </div>
                        </div>
                        <div class="photos-group no">
                            <div class="group-title">NO OK</div>
                            <div class="thumbs">
                                ${def.fotosNo.map(r => `<img src="dao/uploads/no/${r}" alt="NO OK">`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            contDefectos.innerHTML = html;

            // Agrega funcionalidad lightbox a todas las imágenes
            contDefectos.querySelectorAll('img').forEach(img => {
                img.onclick = () => {
                    lbImg.src = img.src;
                    lb.style.display = 'flex';
                };
            });

        } catch (err) {
            console.error(err);
            campos.descripcion.textContent = 'Error al cargar datos.';
            metodoTrabajoEl.textContent = '(Error al cargar PDF)';
            Swal.fire('Error', err.message, 'error');
        }
    };
})();

// ───────────── Escucha a botones que abren el modal ─────────────
document.addEventListener('click', e => {
    const btn = e.target.closest('.show-desc');
    if (!btn) return;
    const folio = btn.dataset.folio;
    console.log('[DEBUG] Folio capturado:', folio);
    if (folio) window.mostrarModalDescripcion(folio);
});
