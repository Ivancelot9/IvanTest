(function () {
    const modal = document.getElementById('modal-descripcion');
    const btnClose = modal.querySelector('#modal-cerrar');
    const lb = document.getElementById('modal-image');
    const lbImg = lb.querySelector('img');
    const lbClose = lb.querySelector('.close-img');

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

    const contDefectos = document.getElementById('r-defectos-container');
    const metodoTrabajoEl = document.getElementById('r-metodo-trabajo');

    modal.style.display = 'none';
    lb.style.display = 'none';

    btnClose.onclick = () => modal.style.display = 'none';
    lbClose.onclick = () => lb.style.display = 'none';
    lb.addEventListener('click', e => {
        if (e.target === lb) lb.style.display = 'none';
    });

    window.mostrarModalDescripcion = async folio => {
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

            campos.folio.textContent = data.folio;
            campos.fecha.textContent = data.fecha.split('-').reverse().join('-');
            campos.numeroParte.textContent = data.numeroParte;
            campos.cantidad.textContent = data.cantidad;
            campos.terciaria.textContent = data.terciaria;
            campos.proveedor.textContent = data.proveedor;
            campos.commodity.textContent = data.commodity;
            campos.descripcion.textContent = data.descripcion || '(sin descripción)';

            if (data.metodoTrabajo) {
                metodoTrabajoEl.innerHTML = `
        <iframe src="dao/uploads/pdf/${encodeURIComponent(data.metodoTrabajo)}"
                width="100%" height="500px"
                style="border:1px solid var(--card-border); border-radius: 6px;"></iframe>
    `;
            } else {
                metodoTrabajoEl.innerHTML = '(No disponible)';
            }

            // Renderizar defectos
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

// ESCUCHA A BOTONES .show-desc
document.addEventListener('click', e => {
    const btn = e.target.closest('.show-desc');
    if (!btn) return;
    const folio = btn.dataset.folio;
    console.log('[DEBUG] Folio capturado:', folio);
    if (folio) window.mostrarModalDescripcion(folio);
});
