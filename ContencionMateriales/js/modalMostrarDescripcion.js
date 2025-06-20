(function() {
    const modal    = document.getElementById('modal-descripcion');
    const btnClose = modal.querySelector('#modal-cerrar');
    const lb       = document.getElementById('modal-image');
    const lbImg    = lb.querySelector('img');
    const lbClose  = lb.querySelector('.close-img');

    const campos = {
        folio:       document.getElementById('r-folio'),
        fecha:       document.getElementById('r-fecha'),
        numeroParte: document.getElementById('r-parte'),
        cantidad:    document.getElementById('r-cantidad'),
        descripcion: document.getElementById('r-descripcion'),
        terciaria:   document.getElementById('r-terciaria'),
        proveedor:   document.getElementById('r-proveedor'),
        commodity:   document.getElementById('r-commodity')
    };

    const contDefectos = document.getElementById('r-defectos-container');

    modal.style.display = lb.style.display = 'none';

    btnClose.onclick = () => modal.style.display = 'none';
    lbClose.onclick  = () => lb.style.display = 'none';
    lb.addEventListener('click', e => { if (e.target === lb) lb.style.display = 'none'; });

    window.mostrarModalDescripcion = async folio => {
        Object.values(campos).forEach(el => el.textContent = '');
        contDefectos.innerHTML = '';
        modal.style.display = 'flex';

        try {
            const res  = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.error || data.status === 'error') {
                throw new Error(data.error || data.message);
            }

            campos.folio.textContent       = data.folio;
            campos.fecha.textContent       = data.fecha.split('-').reverse().join('-');
            campos.numeroParte.textContent = data.numeroParte;
            campos.cantidad.textContent    = data.cantidad;
            campos.terciaria.textContent   = data.terciaria;
            campos.proveedor.textContent   = data.proveedor;
            campos.commodity.textContent   = data.commodity;
            campos.descripcion.textContent = data.descripcion || '(sin descripción)';

            const html = data.defectos.map(def => `
        <div class="defect-block">
          <h4>${def.nombre}</h4>
          <div class="defect-photos">
            <div class="photo-section ok-section">
              <h3><i class="fa fa-check-circle"></i> Fotos OK</h3>
              <div class="photos-grid ok">
                ${ def.fotosOk.length
                ? def.fotosOk.map(r => `<img src="dao/uploads/ok/${r}" alt="${def.nombre}">`).join('')
                : '<small>(ninguna)</small>' }
              </div>
            </div>
            <div class="photo-section no-section">
              <h3><i class="fa fa-times-circle"></i> Fotos NO OK</h3>
              <div class="photos-grid no">
                ${ def.fotosNo.length
                ? def.fotosNo.map(r => `<img src="dao/uploads/no/${r}" alt="${def.nombre}">`).join('')
                : '<small>(ninguna)</small>' }
              </div>
            </div>
          </div>
        </div>
      `).join('');

            contDefectos.innerHTML = html;
            contDefectos.querySelectorAll('.photos-grid img').forEach(img => {
                img.onclick = () => {
                    lbImg.src        = img.src;
                    lb.style.display = 'flex';
                };
            });

        } catch(err) {
            console.error(err);
            campos.descripcion.textContent = 'Error al cargar datos.';
            Swal.fire('Error', err.message, 'error');
        }
    };
})();
