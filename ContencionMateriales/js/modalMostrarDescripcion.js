(function(){
    const modal    = document.getElementById('modal-descripcion');
    const btnClose = modal.querySelector('#modal-cerrar');
    const lb       = document.getElementById('modal-image');
    const lbImg    = lb.querySelector('img');
    const lbClose  = lb.querySelector('.close-img');

    // ← Modificación: asegurarnos de que ambos modales estén ocultos al arrancar
    modal.style.display = 'none';
    lb.style.display    = 'none';

    // Mapeo de campos
    const campos = {
        folio:       document.getElementById('r-folio'),
        fecha:       document.getElementById('r-fecha'),
        numeroParte: document.getElementById('r-parte'),
        cantidad:    document.getElementById('r-cantidad'),
        descripcion: document.getElementById('r-descripcion'),
        terciaria:   document.getElementById('r-terciaria'),
        proveedor:   document.getElementById('r-proveedor'),
        commodity:   document.getElementById('r-commodity'),
        defectos:    document.getElementById('r-defectos'),
        photosOk:    document.getElementById('r-photos-ok'),
        photosNo:    document.getElementById('r-photos-no')
    };

    // Cerrar modales
    btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    lbClose.addEventListener('click', () => {
        lb.style.display = 'none';
    });

    // Cerrar lightbox al hacer clic fuera de la imagen
    lb.addEventListener('click', e => {
        if (e.target === lb) {
            lb.style.display = 'none';
        }
    });

    // Función global para abrir el modal de descripción
    window.mostrarModalDescripcion = async function(folio) {
        // limpiar contenidos de todos los campos
        Object.values(campos).forEach(el => el.innerHTML = '');

        // abrir modal de descripción
        modal.style.display = 'flex';

        try {
            const res  = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Rellenar campos
            campos.folio.textContent       = data.folio;
            campos.fecha.textContent       = data.fecha.split('-').reverse().join('-');
            campos.numeroParte.textContent = data.numeroParte;
            campos.cantidad.textContent    = data.cantidad;
            campos.terciaria.textContent   = data.terciaria;
            campos.proveedor.textContent   = data.proveedor;
            campos.commodity.textContent   = data.commodity;
            campos.defectos.textContent    = data.defectos;
            campos.descripcion.textContent = data.descripcion || '(sin texto)';

            // Fotos OK
            const okGrid = campos.photosOk;
            okGrid.classList.add('ok');
            if (data.fotosOk.length) {
                data.fotosOk.forEach(r => {
                    const img = new Image();
                    img.src = `dao/uploads/ok/${r}`;
                    img.alt = 'OK';
                    okGrid.appendChild(img);

                    // ← Modificación: sólo abres el lightbox al hacer clic en la miniatura
                    img.addEventListener('click', () => {
                        lbImg.src          = img.src;
                        lb.style.display   = 'flex';
                    });
                });
            } else {
                okGrid.textContent = '(ninguna)';
            }

            // Fotos NO OK
            const noGrid = campos.photosNo;
            noGrid.classList.add('no');
            if (data.fotosNo.length) {
                data.fotosNo.forEach(r => {
                    const img = new Image();
                    img.src = `dao/uploads/no/${r}`;
                    img.alt = 'NO OK';
                    noGrid.appendChild(img);

                    // ← Modificación: sólo abres el lightbox al hacer clic en la miniatura
                    img.addEventListener('click', () => {
                        lbImg.src          = img.src;
                        lb.style.display   = 'flex';
                    });
                });
            } else {
                noGrid.textContent = '(ninguna)';
            }

        } catch(err) {
            campos.descripcion.textContent = 'Error al cargar datos.';
            console.error(err);
        }
    };
})();
