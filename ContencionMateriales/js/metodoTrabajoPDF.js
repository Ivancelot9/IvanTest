const inputPDF    = document.getElementById('archivoPDF');
const btnVerPDF   = document.getElementById('verPDF');
const visorPDF    = document.getElementById('visor-pdf');
const modalPDF    = document.getElementById('modal-pdf');
const cerrarModal = document.getElementById('cerrarModalPDF');

inputPDF.addEventListener('change', () => {
    const archivo = inputPDF.files[0];
    if (archivo && archivo.type === 'application/pdf') {
        const url = URL.createObjectURL(archivo);
        visorPDF.src = url;
        btnVerPDF.disabled = false;
    } else {
        btnVerPDF.disabled = true;
        visorPDF.src = '';
    }
});

btnVerPDF.addEventListener('click', () => {
    modalPDF.style.display = 'flex';
});

cerrarModal.addEventListener('click', () => {
    modalPDF.style.display = 'none';
});
