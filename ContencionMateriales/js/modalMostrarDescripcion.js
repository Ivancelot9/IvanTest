// js/modalMostrarDescripcion.js
document.addEventListener('DOMContentLoaded', () => {
    const overlay   = document.getElementById('modal-descripcion');
    const modalBody = document.getElementById('modal-body');
    const btnCerrar = document.getElementById('modal-cerrar');

    // Delegamos click sobre cualquier .show-desc
    document.body.addEventListener('click', async e => {
        if (!e.target.matches('.show-desc')) return;
        const folio = e.target.dataset.folio;
        if (!folio) return;

        overlay.style.display = 'flex';
        modalBody.innerHTML = '<p>Cargando...</p>';

        try {
            const res  = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const caso = await res.json();
            if (caso.error) throw new Error(caso.error);

            // Armamos el HTML con todos los campos y fotos
            let html = `
        <table class="report-table">
          <tr><th>Folio</th>       <td>${caso.folio}</td></tr>
          <tr><th>Fecha</th>       <td>${caso.fecha}</td></tr>
          <tr><th>No. Parte</th>   <td>${caso.numeroParte}</td></tr>
          <tr><th>Cantidad</th>    <td>${caso.cantidad}</td></tr>
          <tr><th>Terciaria</th>   <td>${caso.terciaria}</td></tr>
          <tr><th>Proveedor</th>   <td>${caso.proveedor}</td></tr>
          <tr><th>Commodity</th>   <td>${caso.commodity}</td></tr>
          <tr><th>Defectos</th>    <td>${caso.defectos}</td></tr>
          <tr><th>Descripción</th> <td>${caso.descripcion}</td></tr>
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
            modalBody.innerHTML = html;

        } catch (err) {
            modalBody.innerHTML = `<p class="error">Error: ${err.message}</p>`;
        }
    });

    // Cerrar modal
    btnCerrar.addEventListener('click', () => overlay.style.display = 'none');
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.style.display = 'none';
    });
});
