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

let storedFile     = null;
let storedURL      = null;

// 1) Toggle: mostrar/ocultar botón de PDF
toggle.addEventListener('change', () => {
    btnPDF.style.display = toggle.checked ? 'inline-block' : 'none';
    if (!toggle.checked) {
        // Deselecciona todo
        storedFile = null;
        storedURL  = null;
        inputOculto.value = '';
        pdfFileNameEl.style.display = 'none';
        btnPDF.textContent = '📄 Cargar método de trabajo';
    }
});

// 2) Abrir modal
btnPDF.addEventListener('click', () => {
    // Si ya tenemos un archivo guardado, mostrar preview
    if (storedURL) {
        visorPDF.src = storedURL;
        visorPDF.style.display = 'block';
    } else {
        inputModal.value = '';
        visorPDF.style.display = 'none';
    }
    modalPDF.classList.add('show');
});

// 3) Cerrar modal
cerrarModal.addEventListener('click', () => {
    modalPDF.classList.remove('show');
});

// 4) Previsualizar al seleccionar nuevo PDF
inputModal.addEventListener('change', () => {
    const archivo = inputModal.files[0];
    if (archivo && archivo.type === 'application/pdf') {
        const url = URL.createObjectURL(archivo);
        visorPDF.src = url;
        visorPDF.style.display = 'block';
        // No lo guardamos aún en storedFile, hasta confirmar
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
    // Guardamos
    storedFile = archivo;
    storedURL  = URL.createObjectURL(archivo);
    // Volcar al input oculto
    const dt = new DataTransfer();
    dt.items.add(archivo);
    inputOculto.files = dt.files;
    // Actualizar UI
    pdfFileNameEl.textContent = archivo.name;
    pdfFileNameEl.style.display = 'inline-block';
    btnPDF.textContent = '✏️ Modificar método de trabajo';
    // Cerrar modal
    modalPDF.classList.remove('show');
});
