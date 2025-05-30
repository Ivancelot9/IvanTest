document.addEventListener('DOMContentLoaded', () => {
    const form        = document.getElementById('search-form');
    const container   = document.getElementById('case-container');
    const modalOverlay= document.getElementById('case-modal');
    const modalBody   = document.getElementById('modal-body');
    const modalClose  = document.getElementById('modal-close');

    // Bases absolutas para las miniaturas
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

            // Si existe, mostramos un botón para abrir el modal
            container.innerHTML = `
        <button id="report-btn" style="
          display:block;
          margin: 0.5rem auto;
          padding: 0.75rem 1.5rem;
          border:none;
          border-radius:4px;
          background: var(--blue-primary);
          color:#fff;
          font-size:1rem;
          cursor:pointer;
        ">
          Ver Reporte #${folio}
        </button>
      `;

            // Al hacer clic en ese botón, abrimos el modal con el contenido
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

    // Cerrar el modal
    modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });
    // También cerrar si hacen clic fuera del contenido
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });

    // Reutilizamos tu renderCase para generar el HTML del reporte
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
        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(80px,1fr));
          gap:.5rem;
          margin-top:.5rem;
        ">
          ${arr.map(file => {
                const url = base + encodeURIComponent(file);
                return `<img
              src="${url}"
              alt="Foto ${tipo}"
              style="
                width:100%;
                height:80px;
                object-fit:cover;
                border-radius:4px;
                cursor:pointer;
              "
              onclick="window.open('${url}','_blank')"
            >`;
            }).join('')}
        </div>
      `;
        };

        return `
      <div style="
        color: var(--text-dark);
      ">
        <h3 style="text-align:center; margin-bottom:1rem;">
          Caso #${folio}
        </h3>
        <ul style="
          list-style:none;
          padding:0;
          font-size:.9rem;
          line-height:1.4;
        ">
          <li><strong>Fecha:</strong> ${fecha}</li>
          <li><strong>No. Parte:</strong> ${numeroParte}</li>
          <li><strong>Cantidad:</strong> ${cantidad}</li>
          <li><strong>Terciaria:</strong> ${terciaria}</li>
          <li><strong>Proveedor:</strong> ${proveedor}</li>
          <li><strong>Commodity:</strong> ${commodity}</li>
          <li><strong>Defectos:</strong> ${defectos}</li>
        </ul>
        <div style="margin:1rem 0; font-size:.9rem;">
          <strong>Descripción:</strong>
          <p style="
            margin:.5rem 0;
            padding:.5rem;
            background: var(--gray-border);
            border-radius:6px;
          ">${descripcion}</p>
        </div>
        <div style="font-size:.9rem;">
          <strong>Fotos OK</strong>
          ${gallery(fotosOk, 'ok')}
        </div>
        <div style="margin-top:1rem; font-size:.9rem;">
          <strong>Fotos NO OK</strong>
          ${gallery(fotosNo, 'no')}
        </div>
      </div>
    `;
    }
});
