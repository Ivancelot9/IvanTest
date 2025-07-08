const btnPDF = document.getElementById('btn-cargar-pdf');
const modalPDF = document.getElementById('modal-pdf');
const cerrarModal = document.getElementById('cerrarModalPDF');
const inputModal = document.getElementById('input-pdf-modal');
const visorPDF = document.getElementById('visor-pdf');
const inputOculto = document.getElementById('archivoPDF');

// Abrir el modal al hacer clic en el botón
btnPDF.addEventListener('click', () => {
    modalPDF.style.display = 'flex';
    inputModal.value = '';
    visorPDF.style.display = 'none';
});

// Cerrar el modal
cerrarModal.addEventListener('click', () => {
    modalPDF.style.display = 'none';
});

// Cuando el usuario elige un PDF en el modal
inputModal.addEventListener('change', () => {
    const archivo = inputModal.files[0];
    if (archivo && archivo.type === 'application/pdf') {
        const url = URL.createObjectURL(archivo);
        visorPDF.src = url;
        visorPDF.style.display = 'block';

        // Copiar el archivo al input oculto real del formulario
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(archivo);
        inputOculto.files = dataTransfer.files;
    } else {
        visorPDF.style.display = 'none';
        inputOculto.value = '';
    }
});
