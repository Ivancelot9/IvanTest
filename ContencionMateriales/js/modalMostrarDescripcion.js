document.addEventListener('DOMContentLoaded', () => {
    const overlay   = document.getElementById('modal-descripcion');
    const modalBody = document.getElementById('modal-body');
    const btnCerrar = document.getElementById('modal-cerrar');

    // Delegación para todos los botones “Ver caso”
    document.body.addEventListener('click', async e => {
        if (e.target.matches('.show-desc[data-folio]')) {
            const folio = e.target.dataset.folio;

            try {
                const res  = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
                const caso = await res.json();
                if (caso.error) {
                    return Swal.fire({ icon: 'error', title: 'Error', text: caso.error });
                }

                // Construir la tabla con todos los campos
                modalBody.innerHTML = `
          <table class="report-table">
            <tr><th>Folio</th><td>${caso.folio}</td></tr>
            <tr><th>Fecha</th><td>${caso.fecha}</td></tr>
            <tr><th>No. Parte</th><td>${caso.numeroParte}</td></tr>
            <tr><th>Cantidad</th><td>${caso.cantidad}</td></tr>
            <tr><th>Terciaria</th><td>${caso.terciaria}</td></tr>
            <tr><th>Proveedor</th><td>${caso.proveedor}</td></tr>
            <tr><th>Commodity</th><td>${caso.commodity}</td></tr>
            <tr><th>Defectos</th><td>${caso.defectos}</td></tr>
            <tr><th>Descripción</th><td>${caso.descripcion}</td></tr>
          </table>
          <div class="photos-group">
            <strong>Fotos OK:</strong>
            <div class="thumbs">
              ${caso.fotosOk.map(r => `<img src="uploads/ok/${r}" class="thumb">`).join('')}
            </div>
          </div>
          <div class="photos-group">
            <strong>Fotos NO OK:</strong>
            <div class="thumbs">
              ${caso.fotosNo.map(r => `<img src="uploads/no/${r}" class="thumb">`).join('')}
            </div>
          </div>
        `;

                // Mostrar overlay
                overlay.style.display = 'flex';

            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el caso.' });
            }
        }
    });

    // Cerrar modal
    btnCerrar.addEventListener('click', () => overlay.style.display = 'none');
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.style.display = 'none';
    });
});
