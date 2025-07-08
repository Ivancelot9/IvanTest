// Elementos del DOM
const toggle = document.getElementById('toggle-metodo-trabajo');
const btnPDF  = document.getElementById('btn-cargar-pdf');
const modalPDF    = document.getElementById('modal-pdf');
const cerrarModal = document.getElementById('cerrarModalPDF');
const inputModal  = document.getElementById('input-pdf-modal');
const visorPDF    = document.getElementById('visor-pdf');
const inputOculto = document.getElementById('archivoPDF');

// 1) Mostrar/ocultar el botón de PDF según el toggle
toggle.addEventListener('change', () => {
    if (toggle.checked) {
        btnPDF.style.display = 'inline-block';
    } else {
        btnPDF.style.display = 'none';
        // Limpia cualquier selección previa
        inputOculto.value = '';
    }
});

// 2) Abrir el modal al hacer clic en "📄 Cargar Método de Trabajo"
btnPDF.addEventListener('click', () => {
    modalPDF.style.display     = 'flex';
    inputModal.value           = '';           // resetea input del modal
    visorPDF.style.display     = 'none';       // oculta el visor hasta escoger archivo
    visorPDF.src               = '';
});

// 3) Cerrar el modal
cerrarModal.addEventListener('click', () => {
    modalPDF.style.display = 'none';
});

// 4) Cuando el usuario elige un PDF en el modal
inputModal.addEventListener('change', () => {
    const archivo = inputModal.files[0];
    if (archivo && archivo.type === 'application/pdf') {
        // Genera URL y muestra preview
        const url = URL.createObjectURL(archivo);
        visorPDF.src           = url;
        visorPDF.style.display = 'block';

        // Copiar el archivo al input oculto del formulario
        const dt = new DataTransfer();
        dt.items.add(archivo);
        inputOculto.files = dt.files;
    } else {
        // Si no es PDF, limpia todo
        visorPDF.style.display = 'none';
        inputOculto.value      = '';
    }
});
