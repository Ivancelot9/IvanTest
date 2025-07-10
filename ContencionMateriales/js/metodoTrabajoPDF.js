document.addEventListener('DOMContentLoaded', () => {
    const toggle        = document.getElementById('toggle-metodo-trabajo');
    const btnPDF        = document.getElementById('btn-cargar-pdf');
    const modalPDF      = document.getElementById('modal-pdf');
    const cerrarModal   = document.getElementById('cerrarModalPDF');
    const inputModal    = document.getElementById('input-pdf-modal');
    const visorPDF      = document.getElementById('visor-pdf');
    const inputOculto   = document.getElementById('archivoPDF');
    const pdfFileNameEl = document.getElementById('pdf-file-name');
    const btnConfirm    = document.getElementById('confirmar-pdf');

    let storedFile = null;
    let storedURL  = null;

    // 1) Inicializar el botón en modo “Agregar” (ancho)
    function resetBtnPDF() {
        btnPDF.classList.remove('compact');
        btnPDF.innerHTML = '📄 Agregar método de trabajo';
        btnPDF.title     = 'Agregar método de trabajo';
        // Reforzamos ancho automático
        btnPDF.style.width = 'auto';
    }
    resetBtnPDF();
    btnPDF.style.display = 'none';

    // 2) Toggle: mostrar/ocultar botón ancho; al desmarcar reiniciar
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            resetBtnPDF();
            btnPDF.style.display = 'inline-flex';
        } else {
            btnPDF.style.display = 'none';
            storedFile = null;
            storedURL  = null;
            inputOculto.value            = '';
            pdfFileNameEl.style.display  = 'none';
            resetBtnPDF();
        }
    });

    // 3) Abrir modal
    btnPDF.addEventListener('click', () => {
        if (storedURL) {
            visorPDF.src           = storedURL;
            visorPDF.style.display = 'block';
        } else {
            inputModal.value       = '';
            visorPDF.style.display = 'none';
        }
        modalPDF.classList.add('show');
    });

    // 4) Cerrar modal con ❌
    cerrarModal.addEventListener('click', () => {
        modalPDF.classList.remove('show');
        if (!storedFile) {
            inputModal.value       = '';
            visorPDF.style.display = 'none';
        }
    });

    // 5) Previsualizar al seleccionar PDF
    inputModal.addEventListener('change', () => {
        const archivo = inputModal.files[0];
        if (archivo && archivo.type === 'application/pdf') {
            const url = URL.createObjectURL(archivo);
            visorPDF.src           = url;
            visorPDF.style.display = 'block';
        } else {
            visorPDF.style.display = 'none';
        }
    });

    // 6) Confirmar dentro del modal → compactar botón
    btnConfirm.addEventListener('click', () => {
        const archivo = inputModal.files[0];
        if (!archivo) {
            return Swal.fire('Error', 'Selecciona un PDF antes de guardar.', 'error');
        }

        // Guardar archivo
        storedFile = archivo;
        storedURL  = URL.createObjectURL(archivo);
        const dt    = new DataTransfer();
        dt.items.add(archivo);
        inputOculto.files = dt.files;

        // Mostrar nombre truncado + tooltip
        pdfFileNameEl.textContent   = archivo.name;
        pdfFileNameEl.title         = archivo.name;
        pdfFileNameEl.style.display = 'inline-block';

        // Compactar el botón → solo icono
        btnPDF.classList.add('compact');
        btnPDF.innerHTML = '<i class="fa fa-pencil-alt" aria-hidden="true"></i>';
        btnPDF.title     = 'Modificar método de trabajo';

        // Asegurar ancho fijo (compact)
        btnPDF.style.width = '34px';

        // Cerrar modal
        modalPDF.classList.remove('show');
    });

    // 7) Cerrar modal con Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') modalPDF.classList.remove('show');
    });
});
