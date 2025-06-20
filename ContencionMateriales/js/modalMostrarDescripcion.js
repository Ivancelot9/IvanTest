(function() {
    const modal    = document.getElementById('modal-descripcion');
    const btnClose = modal.querySelector('#modal-cerrar');
    const lb       = document.getElementById('modal-image');
    const lbImg    = lb.querySelector('img');
    const lbClose  = lb.querySelector('.close-img');

    // Ocultar al arrancar
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
        photosNo:     document.getElementById('r-photos-no')
    };

    // Cerrar modales
    btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    lbClose.addEventListener('click', () => {
        lb.style.display = 'none';
    });
    lb.addEventListener('click', e => {
        if (e.target === lb) {
            lb.style.display = 'none';
        }
    });

    // Función global
    window.mostrarModalDescripcion = async function(folio) {
        // Limpiar todos los campos
        Object.values(campos).forEach(el => el.innerHTML = '');

        // Mostrar modal
        modal.style.display = 'flex';

        try {
            const res = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.status && data.status !== 'success') {
                throw new Error(data.message || 'Error al cargar datos');
            }

            // 1) Campos básicos
            campos.folio.textContent       = data.folio;
            campos.fecha.textContent       = data.fecha.split('-').reverse().join('-');
            campos.numeroParte.textContent = data.numeroParte;
            campos.cantidad.textContent    = data.cantidad;
            campos.terciaria.textContent   = data.terciaria;
            campos.proveedor.textContent   = data.proveedor;
            campos.commodity.textContent   = data.commodity;
            campos.descripcion.textContent = data.descripcion || '(sin descripción)';

            // 2) Defectos (varios)
            const listaNombres = data.defectos.map(d => d.nombre);
            campos.defectos.textContent = listaNombres.join(', ') || '(ninguno)';

            // 3) Fotos OK / NO OK
            const okGrid = campos.photosOk;
            const noGrid = campos.photosNo;
            okGrid.innerHTML = '';
            noGrid.innerHTML = '';
            okGrid.classList.add('ok');
            noGrid.classList.add('no');

            data.defectos.forEach(def => {
                def.fotosOk.forEach(ruta => {
                    const img = new Image();
                    img.src = `dao/uploads/ok/${ruta}`;
                    img.alt = def.nombre;
                    img.addEventListener('click', () => {
                        lbImg.src        = img.src;
                        lb.style.display = 'flex';
                    });
                    okGrid.appendChild(img);
                });
                def.fotosNo.forEach(ruta => {
                    const img = new Image();
                    img.src = `dao/uploads/no/${ruta}`;
                    img.alt = def.nombre;
                    img.addEventListener('click', () => {
                        lbImg.src        = img.src;
                        lb.style.display = 'flex';
                    });
                    noGrid.appendChild(img);
                });
            });

            if (!okGrid.children.length) okGrid.textContent = '(ninguna)';
            if (!noGrid.children.length) noGrid.textContent  = '(ninguna)';

        } catch (err) {
            console.error(err);
            campos.descripcion.textContent = 'Error al cargar datos.';
            Swal.fire('Error', err.message, 'error');
        }
    };
})();
