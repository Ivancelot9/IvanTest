document.addEventListener('DOMContentLoaded', () => {
    const form      = document.getElementById('search-form');
    const container = document.getElementById('case-container');

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const folio = document.getElementById('case-number').value.trim();
        if (!folio) return;

        container.innerHTML = '<p>Cargando caso…</p>';
        try {
            const resp = await fetch(`obtenerCaso.php?folio=${folio}`);
            const data = await resp.json();
            if (!resp.ok || data.error) {
                throw new Error(data.error || 'Error al obtener el caso');
            }
            container.innerHTML = renderCase(data);
        } catch (err) {
            container.innerHTML = `<p class="error">${err.message}</p>`;
        }
    });

    function renderCase(c) {
        const {
            folio,
            fecha,
            numeroParte,
            cantidad,
            descripcion,
            terciaria,
            proveedor,
            commodity,
            defectos,
            fotosOk = [],
            fotosNo = []
        } = c;

        const gallery = (arr, tipo) => arr.length
            ? `<div class="photos-grid ${tipo}">
           ${arr.map(src => `<img src="${src}" alt="Foto ${tipo}">`).join('')}
         </div>`
            : `<p>No hay fotos ${tipo === 'ok' ? 'OK' : 'NO OK'}</p>`;

        return `
      <div class="modal-content reporte">
        <div class="reporte-inner">
          <div class="reporte-header">
            <h2 class="modal-heading">Caso #${folio}</h2>
          </div>

          <div class="reporte-grid">
            <label class="field-label">Folio:</label>
            <div class="field-value">${folio}</div>

            <label class="field-label">Fecha:</label>
            <div class="field-value">${fecha}</div>

            <label class="field-label">No. Parte:</label>
            <div class="field-value">${numeroParte}</div>

            <label class="field-label">Cantidad:</label>
            <div class="field-value">${cantidad}</div>

            <label class="field-label">Terciaria:</label>
            <div class="field-value">${terciaria}</div>

            <label class="field-label">Proveedor:</label>
            <div class="field-value">${proveedor}</div>

            <label class="field-label">Commodity:</label>
            <div class="field-value">${commodity}</div>

            <label class="field-label">Defectos:</label>
            <div class="field-value">${defectos}</div>

            <label class="field-label">Descripción:</label>
            <div class="description-box">${descripcion}</div>
          </div>

          <div class="reporte-photos">
            <div class="photo-section ok-section">
              <h3><i class="fas fa-check-circle"></i> Fotos OK</h3>
              ${gallery(fotosOk, 'ok')}
            </div>
            <div class="photo-section no-section">
              <h3><i class="fas fa-times-circle"></i> Fotos NO OK</h3>
              ${gallery(fotosNo, 'no')}
            </div>
          </div>
        </div>
      </div>
    `;
    }
});
