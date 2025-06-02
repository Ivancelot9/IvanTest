document.addEventListener('DOMContentLoaded', () => {
    const form         = document.getElementById('search-form');
    const container    = document.getElementById('case-container');
    const modalOverlay = document.getElementById('case-modal');

    // Rutas absolutas a tus carpetas de imágenes
    const baseOk = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/ok/';
    const baseNo = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/no/';

    // Referencias al lightbox estático que añadimos en el HTML
    const lb      = document.getElementById('modal-image');
    const lbImg   = lb.querySelector('img');
    const lbClose = lb.querySelector('.close-img');

    // Asegurarnos de que el lightbox esté oculto al iniciar
    lb.style.display = 'none';

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const folio = document.getElementById('case-number').value.trim();
        if (!folio) return;

        // Mostramos “Cargando…” mientras llega la respuesta
        container.innerHTML = '<p style="text-align:center;">Cargando…</p>';

        try {
            const resp = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const data = await resp.json();

            if (!resp.ok || data.error) {
                // Lanzamos SweetAlert2 en lugar de inyectar un párrafo
                await Swal.fire({
                    icon: 'error',
                    title: 'Caso no encontrado',
                    text: data.error || 'El caso no existe. Por favor verifica el número e intenta de nuevo.',
                });
                container.innerHTML = ''; // Limpiamos el contenedor
                return;
            }

            // Inyectamos un botón DENTRO del panel
            container.innerHTML = `<button id="report-btn">${folio}</button>`;

            // Agregamos el listener al botón “report-btn”
            document
                .getElementById('report-btn')
                .addEventListener('click', () => showModal(data));

        } catch (err) {
            // En caso de otro tipo de error (por ejemplo, fallo en la fetch):
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Ocurrió un problema al buscar el caso.',
            });
            container.innerHTML = '';
        }
    });

    // Función para montar y mostrar el modal de datos
    function showModal(c) {
        // Limpiamos contenido previo
        modalOverlay.innerHTML = '';
        // Inyectamos el HTML del modal
        modalOverlay.innerHTML = renderModal(c);
        modalOverlay.classList.add('active');

        // Listener para cerrar con la X
        modalOverlay
            .querySelector('.modal-close')
            .addEventListener('click', hideModal);

        // Listener para cerrar clic fuera del contenido
        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay) hideModal();
        });

        // Asignamos el listener a cada miniatura INYECTADA:
        modalOverlay.querySelectorAll('.photos-grid img').forEach(img => {
            img.addEventListener('click', openImageFullscreen);
        });
    }

    function hideModal() {
        modalOverlay.classList.remove('active');
        modalOverlay.innerHTML = '';
        // Si el lightbox está abierto, ocultarlo (no eliminarlo)
        lb.style.display = 'none';
    }

    // Abre la imagen en pantalla completa reutilizando el lightbox estático
    function openImageFullscreen(e) {
        const src = e.currentTarget.src; // URL de la miniatura clicada
        // Simplemente actualizamos el <img> del lightbox y lo mostramos:
        lbImg.src = src;
        lb.style.display = 'flex';
    }

    // Listener para cerrar el lightbox al hacer clic en la “X”
    lbClose.addEventListener('click', () => {
        lb.style.display = 'none';
    });

    // Listener para cerrar lightbox al hacer clic fuera de la imagen
    lb.addEventListener('click', e => {
        if (e.target === lb) {
            lb.style.display = 'none';
        }
    });

    // Genera la estructura HTML del modal con los datos recibidos
    function renderModal(c) {
        const {
            folio, fecha,
            numeroParte, cantidad,
            descripcion, terciaria,
            proveedor, commodity,
            defectos, fotosOk = [],
            fotosNo = []
        } = c;

        const field = (label, value) => `
      <label class="field-label">${label}</label>
      <div class="field-value">${value}</div>
    `;

        const photosSection = (arr, tipo) => {
            const cls   = tipo === 'ok' ? 'ok-section' : 'no-section';
            const icon  = tipo === 'ok'
                ? '<i class="fas fa-check-circle"></i>'
                : '<i class="fas fa-times-circle"></i>';
            const base  = tipo === 'ok' ? baseOk : baseNo;

            if (!arr.length) {
                return `
          <div class="photo-section ${cls}">
            <h3>${icon} Fotos ${tipo.toUpperCase()}</h3>
            <p>(ninguna)</p>
          </div>
        `;
            }

            return `
        <div class="photo-section ${cls}">
          <h3>${icon} Fotos ${tipo.toUpperCase()}</h3>
          <div class="photos-grid ${tipo}">
            ${arr.map(file => {
                const url = base + encodeURIComponent(file);
                return `<img src="${url}" alt="Foto ${tipo}">`;
            }).join('')}
          </div>
        </div>
      `;
        };

        return `
      <div class="modal-content reporte">
        <div class="reporte-inner">
          <div class="reporte-header">
            <h2 class="modal-heading">
              <i class="fas fa-folder-open"></i> Datos del Caso
            </h2>
            <button class="modal-close">&times;</button>
          </div>

          <div class="reporte-grid">
            ${field('Folio:', folio)}
            ${field('Fecha:', fecha)}
            ${field('No. Parte:', numeroParte)}
            ${field('Cantidad:', cantidad)}
            ${field('Terciaria:', terciaria)}
            ${field('Proveedor:', proveedor)}
            ${field('Commodity:', commodity)}
            ${field('Defectos:', defectos)}
            <label class="field-label">Descripción:</label>
            <div class="description-box">${descripcion}</div>
          </div>

          <div class="reporte-photos">
            ${photosSection(fotosOk, 'ok')}
            ${photosSection(fotosNo, 'no')}
          </div>
        </div>
      </div>
    `;
    }
});
