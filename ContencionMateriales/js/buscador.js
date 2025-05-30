document.addEventListener('DOMContentLoaded', () => {
    const form         = document.getElementById('search-form');
    const container    = document.getElementById('case-container');
    const modalOverlay = document.getElementById('case-modal');
    const modalBody    = document.getElementById('modal-body');
    const modalClose   = document.getElementById('modal-close');

    const baseOk = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/ok/';
    const baseNo = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/no/';

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const folio = document.getElementById('case-number').value.trim();
        if (!folio) return;

        container.innerHTML = '<p style="text-align:center;">Cargando…</p>';

        try {
            const resp = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const data = await resp.json();
            if (!resp.ok || data.error) {
                throw new Error(data.error || 'Caso no encontrado');
            }

            // Sólo inyectamos el número como botón
            container.innerHTML = `<button id="report-btn">${folio}</button>`;

            document.getElementById('report-btn').addEventListener('click', () => {
                modalBody.innerHTML = renderCase(data);
                modalOverlay.classList.add('active');
            });

        } catch (err) {
            container.innerHTML = `
        <p style="color: var(--accent-no); text-align:center;">
          ${err.message}
        </p>`;
        }
    });

    modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });

    function renderCase(c) {
        const {
            folio, fecha,
            numeroParte, cantidad,
            descripcion, terciaria,
            proveedor, commodity,
            defectos, fotosOk = [],
            fotosNo = []
        } = c;

        const gallery = (arr, tipo) => {
            const base = tipo === 'ok' ? baseOk : baseNo;
            if (!arr.length) {
                return `<p style="text-align:center; font-size:.9rem;">
                  No hay fotos ${tipo.toUpperCase()}
                </p>`;
            }
            return `
        <div class="photos-grid ${tipo}">
          ${arr.map(file => {
                const url = base + encodeURIComponent(file);
                return `<img src="${url}"
                         alt="Foto ${tipo}"
                         onclick="window.open('${url}','_blank')">`;
            }).join('')}
        </div>
      `;
        };

        return `
      <div class="report-card">
        <h3>Caso #${folio}</h3>
        <ul>
          <li><strong>Fecha:</strong> ${fecha}</li>
          <li><strong>No. Parte:</strong> ${numeroParte}</li>
          <li><strong>Cantidad:</strong> ${cantidad}</li>
          <li><strong>Terciaria:</strong> ${terciaria}</li>
          <li><strong>Proveedor:</strong> ${proveedor}</li>
          <li><strong>Commodity:</strong> ${commodity}</li>
          <li><strong>Defectos:</strong> ${defectos}</li>
        </ul>
        <div class="desc">
          <strong>Descripción:</strong>
          <p>${descripcion}</p>
        </div>
        <div>
          <strong>Fotos OK</strong>
          ${gallery(fotosOk, 'ok')}
        </div>
        <div>
          <strong>Fotos NO OK</strong>
          ${gallery(fotosNo, 'no')}
        </div>
      </div>
    `;
    }
});
