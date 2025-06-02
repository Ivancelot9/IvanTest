document.addEventListener('DOMContentLoaded', () => {
    const form         = document.getElementById('search-form');
    const container    = document.getElementById('case-container');
    const modalOverlay = document.getElementById('case-modal');

    // Rutas absolutas a tus carpetas de imágenes
    const baseOk = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/ok/';
    const baseNo = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/no/';

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const folio = document.getElementById('case-number').value.trim();
        if (!folio) return;

        // Mostrar indicador de carga mientras llega la respuesta
        container.innerHTML = '<p style="text-align:center;">Cargando…</p>';

        try {
            const resp = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const data = await resp.json();
            if (!resp.ok || data.error) {
                throw new Error(data.error || 'Caso no encontrado');
            }

            // Inyecta un botón DENTRO del panel (en #case-container)
            container.innerHTML = `<button id="report-btn">${folio}</button>`;

            document
                .getElementById('report-btn')
                .addEventListener('click', () => showModal(data));

        } catch (err) {
            container.innerHTML = `
        <p style="color: var(--accent-no); text-align:center;">
          ${err.message}
        </p>`;
        }
    });

    // Función para montar y mostrar el modal usando tu vista reciclada
    function showModal(c) {
        modalOverlay.innerHTML = renderModal(c);
        modalOverlay.classList.add('active');

        // Cerrar con la X
        modalOverlay
            .querySelector('.modal-close')
            .addEventListener('click', hideModal);

        // Cerrar clic fuera del contenido
        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay) hideModal();
        });
    }

    function hideModal() {
        modalOverlay.classList.remove('active');
        modalOverlay.innerHTML = '';
    }

    // Genera la estructura HTML del modal conforme a tu CSS existente
    function renderModal(c) {
        const {
            folio, fecha,
            numeroParte, cantidad,
            descripcion, terciaria,
            proveedor, commodity,
            defectos, fotosOk = [],
            fotosNo = []
        } = c;

        const field = (label, value) => `
          <label class="field-label">${label}</label>
          <div class="field-value">${value}</div>
        `;

        const photosSection = (arr, tipo) => {
            const cls   = tipo === 'ok' ? 'ok-section' : 'no-section';
            const icon  = tipo === 'ok'
                ? '<i class="fas fa-check-circle"></i>'
                : '<i class="fas fa-times-circle"></i>';
            const base  = tipo === 'ok' ? baseOk : baseNo;
            if (!arr.length) {
                return `<div class="photo-section ${cls}">
                  <h3>${icon} Fotos ${tipo.toUpperCase()}</h3>
                  <p>(ninguna)</p>
                </div>`;
            }
            return `<div class="photo-section ${cls}">
              <h3>${icon} Fotos ${tipo.toUpperCase()}</h3>
              <div class="photos-grid ${tipo}">
                ${arr.map(file => {
                const url = base + encodeURIComponent(file);
                return `<img src="${url}" alt="Foto ${tipo}">`;
            }).join('')}
              </div>
            </div>`;
        };

        return `
          <div class="modal-content reporte">
            <div class="reporte-inner">
              <div class="reporte-header">
                <h2 class="modal-heading">
                  <i class="fas fa-folder-open"></i> Datos del Caso
                </h2>
                <button class="modal-close">&times;</button>
              </div>

              <div class="reporte-grid">
                ${field('Folio:', folio)}
                ${field('Fecha:', fecha)}
                ${field('No. Parte:', numeroParte)}
                ${field('Cantidad:', cantidad)}
                ${field('Terciaria:', terciaria)}
                ${field('Proveedor:', proveedor)}
                ${field('Commodity:', commodity)}
                ${field('Defectos:', defectos)}
                <label class="field-label">Descripción:</label>
                <div class="description-box">${descripcion}</div>
              </div>

              <div class="reporte-photos">
                ${photosSection(fotosOk, 'ok')}
                ${photosSection(fotosNo, 'no')}
              </div>
            </div>
          </div>
        `;
    }
});
