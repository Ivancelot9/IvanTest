(function(){
    const modal = document.getElementById('modal-descripcion');
    const btnClose = modal.querySelector('#modal-cerrar');

    // mapeo de campos
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

    btnClose.addEventListener('click', () => { modal.style.display = 'none'; });

    window.mostrarModalDescripcion = async function(folio) {
        // limpiar
        Object.values(campos).forEach(el => el.innerHTML = '');

        modal.style.display = 'flex';

        try {
            const res = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // rellenar
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
            const okHeader = modal.querySelector('h3.ok');
            const okGrid   = campos.photosOk;
            okGrid.classList.add('photos-grid','ok');
            okHeader.textContent = ''; // vamos a inyectar icono + texto
            okHeader.appendChild(Object.assign(document.createElement('i'),{className:'fa fa-check-circle'}));
            okHeader.insertAdjacentText('beforeend',' Fotos OK');
            if (data.fotosOk.length) {
                data.fotosOk.forEach(r => {
                    const img = new Image(100,100);
                    img.src = `dao/uploads/ok/${r}`;
                    img.alt = 'OK';
                    okGrid.appendChild(img);
                });
            } else {
                okGrid.textContent = '(ninguna)';
            }

            // Fotos NO OK
            const noHeader = modal.querySelector('h3.no');
            const noGrid   = campos.photosNo;
            noGrid.classList.add('photos-grid','no');
            noHeader.textContent = '';
            noHeader.appendChild(Object.assign(document.createElement('i'),{className:'fa fa-times-circle'}));
            noHeader.insertAdjacentText('beforeend',' Fotos NO OK');
            if (data.fotosNo.length) {
                data.fotosNo.forEach(r => {
                    const img = new Image(100,100);
                    img.src = `dao/uploads/no/${r}`;
                    img.alt = 'NO OK';
                    noGrid.appendChild(img);
                });
            } else {
                noGrid.textContent = '(ninguna)';
            }

        } catch (err) {
            campos.descripcion.textContent = 'Error al cargar datos.';
            console.error(err);
        }
    };
})();
