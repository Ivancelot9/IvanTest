/**
 * Módulo para abrir un modal estilo “reporte” con TODOS los datos
 * del caso—including las fotos OK / NO OK—al pulsar “Mostrar descripción”.
 */
(function(){
    const modal = document.getElementById('modal-descripcion');
    const body  = modal.querySelector('#modal-body');
    const close = modal.querySelector('#modal-cerrar');

    close.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // La función global que llama el paginador:
    window.mostrarModalDescripcion = async function(folio) {
        body.innerHTML = '<p>Cargando...</p>';
        modal.style.display = 'flex';

        try {
            const res = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const json = await res.json();

            if (json.error) {
                body.innerHTML = `<p class="error">${json.error}</p>`;
                return;
            }

            // Construimos el HTML del “reporte”
            let html = `
        <div class="report-grid">
          <div><strong>Folio:</strong> ${json.folio}</div>
          <div><strong>Fecha:</strong> ${json.fecha.split('-').reverse().join('-')}</div>
          <div><strong>No. Parte:</strong> ${json.numeroParte}</div>
          <div><strong>Cantidad:</strong> ${json.cantidad}</div>
          <div><strong>Terciaria:</strong> ${json.terciaria}</div>
          <div><strong>Proveedor:</strong> ${json.proveedor}</div>
          <div><strong>Commodity:</strong> ${json.commodity}</div>
          <div><strong>Defectos:</strong> ${json.defectos}</div>
        </div>

        <div class="desc-section">
          <h3>Descripción</h3>
          <p>${json.descripcion || '<em>(sin texto)</em>'}</p>
        </div>

        <div class="fotos-section">
          <div>
            <h3>Fotos OK</h3>
            <div class="fotos-grid">
              ${json.fotosOk.map(r => `<img src="dao/uploads/ok/${r}" alt="OK">`).join('')}
              ${json.fotosOk.length === 0 ? '<p>(ninguna)</p>' : ''}
            </div>
          </div>
          <div>
            <h3>Fotos NO OK</h3>
            <div class="fotos-grid">
              ${json.fotosNo.map(r => `<img src="dao/uploads/no/${r}" alt="NO OK">`).join('')}
              ${json.fotosNo.length === 0 ? '<p>(ninguna)</p>' : ''}
            </div>
          </div>
        </div>
      `;

            body.innerHTML = html;
        } catch (err) {
            body.innerHTML = `<p class="error">Error al cargar los datos.</p>`;
            console.error(err);
        }
    };
})();
