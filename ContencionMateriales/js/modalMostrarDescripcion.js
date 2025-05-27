/**
 * modalMostrarDescripcion.js
 * Maneja apertura/cierre del modal y carga de datos via AJAX.
 */
(function(){
    const modal = document.getElementById('modal-descripcion');
    const btnClose = modal.querySelector('#modal-cerrar');

    // campos destino
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

    btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.mostrarModalDescripcion = async function(folio) {
        // limpiar y mostrar overlay
        Object.values(campos).forEach(el => {
            if (el.tagName === 'DIV') el.innerHTML = '';
        });
        modal.style.display = 'flex';

        // llamada AJAX
        try {
            const res = await fetch(`dao/obtenerCaso.php?folio=${folio}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // rellenar campos
            campos.folio.textContent       = data.folio;
            campos.fecha.textContent       = data.fecha.split('-').reverse().join('-');
            campos.numeroParte.textContent = data.numeroParte;
            campos.cantidad.textContent    = data.cantidad;
            campos.terciaria.textContent   = data.terciaria;
            campos.proveedor.textContent   = data.proveedor;
            campos.commodity.textContent   = data.commodity;
            campos.defectos.textContent    = data.defectos;
            campos.descripcion.textContent = data.descripcion || '(sin texto)';

            // fotos OK
            if (data.fotosOk.length) {
                data.fotosOk.forEach(ruta => {
                    const img = document.createElement('img');
                    img.src = `dao/uploads/ok/${ruta}`;
                    img.alt = 'OK';
                    campos.photosOk.appendChild(img);
                });
            } else {
                campos.photosOk.textContent = '(ninguna)';
            }

            // fotos NO OK
            if (data.fotosNo.length) {
                data.fotosNo.forEach(ruta => {
                    const img = document.createElement('img');
                    img.src = `dao/uploads/no/${ruta}`;
                    img.alt = 'NO OK';
                    campos.photosNo.appendChild(img);
                });
            } else {
                campos.photosNo.textContent = '(ninguna)';
            }

        } catch (err) {
            // mostrar error
            campos.descripcion.textContent = 'Error al cargar datos.';
            console.error(err);
        }
    };
})();
