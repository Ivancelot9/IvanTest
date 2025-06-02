document.addEventListener('DOMContentLoaded', () => {
    const form         = document.getElementById('search-form');
    const container    = document.getElementById('case-container');
    const modalOverlay = document.getElementById('case-modal');

    // Rutas absolutas a tus carpetas de imágenes
    const baseOk = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/ok/';
    const baseNo = 'https://grammermx.com/IvanTest/ContencionMateriales/dao/uploads/no/';

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const folio = document.getElementById('case-number').value.trim();
        if (!folio) return;

        // Mostramos un “Cargando…” mientras esperamos la respuesta
        container.innerHTML = '<p style="text-align:center;">Cargando…</p>';

        try {
            const resp = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const data = await resp.json();

            if (!resp.ok || data.error) {
                throw new Error(data.error || 'Caso no encontrado');
            }

            // Inyecta un botón DENTRO del panel (en #case-container)
            container.innerHTML = `<button id="report-btn">${folio}</button>`;

            // Ahora sí agregamos el listener al botón “report-btn”
            document
                .getElementById('report-btn')
                .addEventListener('click', () => showModal(data));

        } catch (err) {
            container.innerHTML = `
        <p style="color: var(--accent-no); text-align:center;">
          ${err.message}
        </p>`;
        }
    });

    // Función para montar y mostrar el modal
    function showModal(c) {
        // Primero vaciamos cualquier contenido previo (por si acaso)
        modalOverlay.innerHTML = '';
        // Luego inyectamos el HTML del modal con la función renderModal
        modalOverlay.innerHTML = renderModal(c);
        modalOverlay.classList.add('active');

        // Asignamos el listener para cerrar con la X
        modalOverlay
            .querySelector('.modal-close')
            .addEventListener('click', hideModal);

        // Asignamos el listener para cerrar al hacer clic fuera del cuadro
        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay) hideModal();
        });

        // ★ Nuevas líneas: después de inyectar el contenido,
        // buscamos cada <img> dentro de .photos-grid y le añadimos un evento de clic:
        modalOverlay.querySelectorAll('.photos-grid img').forEach(img => {
            img.addEventListener('click', openImageFullscreen);
        });
    }

    function hideModal() {
        modalOverlay.classList.remove('active');
        modalOverlay.innerHTML = '';
        // Si hay un lightbox abierto (#modal-image), cerrarlo también:
        const existingLightbox = document.getElementById('modal-image');
        if (existingLightbox) existingLightbox.remove();
    }

    // ★ Nueva función: abre la imagen en pantalla completa (lightbox)
    function openImageFullscreen(e) {
        const src = e.currentTarget.src; // URL de la imagen clicada
        // Creamos el contenedor overlay
        const lightbox = document.createElement('div');
        lightbox.id = 'modal-image';                // coincide con el CSS que ya tienes
        lightbox.className = 'modal-overlay';       // reutiliza la clase de overlay
        lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="close-img">&times;</button>
        <img src="${src}" alt="Foto ampliada">
      </div>
    `;
        document.body.appendChild(lightbox);

        // Evento para cerrar al hacer clic en la X
        lightbox.querySelector('.close-img').addEventListener('click', () => {
            lightbox.remove();
        });

        // Evento para cerrar al hacer clic fuera de la imagen (en el overlay)
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) {
                lightbox.remove();
            }
        });
    }

    // Genera la estructura HTML del modal con los datos devueltos
    function renderModal(c) {
        const {
            folio, fecha,
            numeroParte, cantidad,
            descripcion, terciaria,
            proveedor, commodity,
            defectos, fotosOk = [],
            fotosNo = []
        } = c;

        // Helper para cada fila de etiqueta + valor
        const field = (label, value) => `
      <label class="field-label">${label}</label>
      <div class="field-value">${value}</div>
    `;

        // Genera la sección de fotos (ok o no)
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
