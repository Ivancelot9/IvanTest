document.addEventListener('DOMContentLoaded', () => {
    const form      = document.getElementById('search-form');
    const container = document.getElementById('case-container');

    // Rutas absolutas hasta tu carpeta de uploads
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
            container.innerHTML = renderCase(data);
        } catch (err) {
            container.innerHTML = `
        <p style="color: var(--accent-no); text-align:center;">
          ${err.message}
        </p>`;
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

        // Monta una galería según tipo
        const gallery = (arr, tipo) => {
            const base = tipo === 'ok' ? baseOk : baseNo;
            if (!arr.length) {
                return `<p style="text-align:center; font-size:.9rem;">
                  No hay fotos ${tipo.toUpperCase()}
                </p>`;
            }
            return `
        <div class="photos-grid ${tipo}" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:0.5rem;">
          ${arr.map(filename => {
                const url = base + encodeURIComponent(filename);
                console.log('Cargando imagen:', url);  // para depurar
                return `<img src="${url}"
                         alt="Foto ${tipo}"
                         style="width:100%;height:80px;object-fit:cover;border-radius:4px;cursor:pointer;">`;
            }).join('')}
        </div>
      `;
        };

        return `
      <div style="
        background:#fff;
        border-radius:12px;
        padding:1rem;
        color:#000;
        box-shadow:0 2px 6px rgba(0,0,0,0.1);
      ">
        <h3 style="
          margin-bottom:.75rem;
          text-align:center;
          color:var(--text-dark);
        ">Caso #${folio}</h3>

        <ul style="
          list-style:none;
          padding:0;
          font-size:.9rem;
          line-height:1.4;
          color:var(--text-dark);
        ">
          <li><strong>Fecha:</strong> ${fecha}</li>
          <li><strong>No. Parte:</strong> ${numeroParte}</li>
          <li><strong>Cantidad:</strong> ${cantidad}</li>
          <li><strong>Terciaria:</strong> ${terciaria}</li>
          <li><strong>Proveedor:</strong> ${proveedor}</li>
          <li><strong>Commodity:</strong> ${commodity}</li>
          <li><strong>Defectos:</strong> ${defectos}</li>
        </ul>

        <div style="margin:1rem 0;">
          <strong>Descripción:</strong>
          <p style="
            margin:.5rem 0;
            background:var(--gray-border);
            padding:.5rem;
            border-radius:8px;
          ">${descripcion}</p>
        </div>

        <div style="font-size:.9rem; color:var(--text-dark);">
          <strong>Fotos OK</strong>
          ${gallery(fotosOk, 'ok')}
        </div>

        <div style="margin-top:1rem; font-size:.9rem; color:var(--text-dark);">
          <strong>Fotos NO OK</strong>
          ${gallery(fotosNo, 'no')}
        </div>
      </div>
    `;
    }
});
