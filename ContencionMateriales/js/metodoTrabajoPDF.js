// Referencias
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

// Función para resetear el botón PDF a su estado inicial
function resetBtnPDF() {
    btnPDF.innerHTML = '<i class="fa fa-pencil-alt" aria-hidden="true"></i>';
    btnPDF.title     = 'Cargar método de trabajo';
}

// 1) Toggle: mostrar/ocultar botón de PDF
toggle.addEventListener('change', () => {
    btnPDF.style.display = toggle.checked ? 'inline-flex' : 'none';
    if (!toggle.checked) {
        storedFile = null;
        storedURL  = null;
        inputOculto.value   = '';
        pdfFileNameEl.style.display = 'none';
        resetBtnPDF();
    }
});

// 2) Abrir modal
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

// 3) Cerrar modal
cerrarModal.addEventListener('click', () => {
    modalPDF.classList.remove('show');
    if (!storedFile) {
        inputModal.value       = '';
        visorPDF.style.display = 'none';
    }
});

// 4) Previsualizar al seleccionar nuevo PDF
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

// 5) Confirmar dentro del modal
btnConfirm.addEventListener('click', () => {
    const archivo = inputModal.files[0];
    if (!archivo) {
        return Swal.fire('Error', 'Selecciona un PDF antes de guardar.', 'error');
    }

    // Guardar archivo
    storedFile = archivo;
    storedURL  = URL.createObjectURL(archivo);

    // Volcarlo al input oculto
    const dt = new DataTransfer();
    dt.items.add(archivo);
    inputOculto.files = dt.files;

    // Actualizar nombre y tooltip
    pdfFileNameEl.textContent = archivo.name;
    pdfFileNameEl.title       = archivo.name;
    pdfFileNameEl.style.display = 'inline-block';

    // Actualizar botón a “Modificar”
    btnPDF.innerHTML = '<i class="fa fa-pencil-alt" aria-hidden="true"></i>';
    btnPDF.title     = 'Modificar método de trabajo';

    // Cerrar modal
    modalPDF.classList.remove('show');
});

// 6) Cerrar modal con Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        modalPDF.classList.remove('show');
    }
});
