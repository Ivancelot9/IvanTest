// Elementos del DOM ya existentes...
const toggle      = document.getElementById('toggle-metodo-trabajo');
const btnPDF      = document.getElementById('btn-cargar-pdf');
const modalPDF    = document.getElementById('modal-pdf');
const cerrarModal = document.getElementById('cerrarModalPDF');
const inputModal  = document.getElementById('input-pdf-modal');
const visorPDF    = document.getElementById('visor-pdf');
const inputOculto = document.getElementById('archivoPDF');
const pdfStatus   = document.getElementById('pdf-status');
const btnConfirm  = document.getElementById('confirmar-pdf');

// 1) Toggle para mostrar/ocultar botón de carga
toggle.addEventListener('change', () => {
    btnPDF.style.display = toggle.checked ? 'inline-block' : 'none';
    if (!toggle.checked) {
        inputOculto.value = '';
        pdfStatus.style.display = 'none';
    }
});

// 2) Abrir modal
btnPDF.addEventListener('click', () => {
    modalPDF.classList.add('show');
    inputModal.value = '';
    visorPDF.style.display = 'none';
});

// 3) Cerrar modal
cerrarModal.addEventListener('click', () => {
    modalPDF.classList.remove('show');
});

// 4) Previsualizar PDF al seleccionarlo
inputModal.addEventListener('change', () => {
    const archivo = inputModal.files[0];
    if (archivo && archivo.type === 'application/pdf') {
        visorPDF.src = URL.createObjectURL(archivo);
        visorPDF.style.display = 'block';
        // copia al input oculto
        const dt = new DataTransfer();
        dt.items.add(archivo);
        inputOculto.files = dt.files;
    } else {
        visorPDF.style.display = 'none';
        inputOculto.value = '';
    }
});

// 5) Confirmar dentro del modal
btnConfirm.addEventListener('click', () => {
    if (!inputModal.files.length) {
        return Swal.fire('Error', 'Selecciona un PDF antes de guardar.', 'error');
    }
    modalPDF.classList.remove('show');
    pdfStatus.style.display = 'inline-block';
});
