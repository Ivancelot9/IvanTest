document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-descripcion');
    const body  = document.getElementById('modal-body');
    const close = document.getElementById('modal-cerrar');

    // Abrir modal al clickar "Mostrar descripción"
    document.querySelectorAll('.show-desc').forEach(btn => {
        btn.addEventListener('click', async () => {
            const fila = btn.closest('tr');
            const folio = fila.querySelector('td').textContent.trim();

            body.innerHTML = 'Cargando…';
            modal.style.display = 'flex';

            try {
                const res = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);

                // Construyo HTML con todos los campos
                body.innerHTML = `
          <p><strong>Folio:</strong> ${data.folio}</p>
          <p><strong>Fecha:</strong> ${data.fecha}</p>
          <p><strong>Número de parte:</strong> ${data.numeroParte}</p>
          <p><strong>Cantidad:</strong> ${data.cantidad}</p>
          <p><strong>Descripción:</strong> ${data.descripcion}</p>
          <p><strong>Terciaria:</strong> ${data.terciaria}</p>
          <p><strong>Proveedor:</strong> ${data.proveedor}</p>
          <p><strong>Commodity:</strong> ${data.commodity}</p>
          <p><strong>Defectos:</strong> ${data.defectos}</p>
          <div><strong>Fotos OK:</strong><br>${data.fotosOk.map(f=>`<img src="uploads/ok/${f}" class="thumb">`).join(' ')}</div>
          <div><strong>Fotos NO OK:</strong><br>${data.fotosNo.map(f=>`<img src="uploads/no/${f}" class="thumb">`).join(' ')}</div>
        `;
            } catch (err) {
                body.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
            }
        });
    });

    // Cerrar modal
    close.addEventListener('click', () => {
        modal.style.display = 'none';
    });
});
