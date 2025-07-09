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

//  Función para dejar el botón en estado “Agregar” (ancho)
//  Quita la clase .compact y pone texto + icono
function resetBtnPDF() {
    btnPDF.classList.remove('compact');
    btnPDF.innerHTML = '📄 Agregar método de trabajo';
    btnPDF.title     = 'Agregar método de trabajo';
}

// Estado inicial
resetBtnPDF();

// 1) Toggle: mostrar/ocultar botón de PDF
toggle.addEventListener('change', () => {
    if (toggle.checked) {
        btnPDF.style.display = 'inline-flex';
    } else {
        btnPDF.style.display = 'none';
        // Reiniciamos todo si se desactiva
        storedFile = null;
        storedURL  = null;
        inputOculto.value      = '';
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

    // Guardar archivo internamente y en el input oculto
    storedFile = archivo;
    storedURL  = URL.createObjectURL(archivo);
    const dt = new DataTransfer();
    dt.items.add(archivo);
    inputOculto.files = dt.files;

    // Mostrar nombre truncado con tooltip
    pdfFileNameEl.textContent = archivo.name;
    pdfFileNameEl.title       = archivo.name;
    pdfFileNameEl.style.display = 'inline-block';

    // Cambiar botón a estado compacto “Modificar”
    btnPDF.classList.add('compact');
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
