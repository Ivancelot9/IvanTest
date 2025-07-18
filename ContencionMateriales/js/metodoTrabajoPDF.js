/**
 * @file modalMetodoTrabajo.js
 * @project Contención de Materiales
 * @module modalMetodoTrabajo
 * @purpose Gestión del archivo PDF del método de trabajo
 * @description
 * Este script controla toda la lógica relacionada con la subida, visualización,
 * validación y confirmación del archivo PDF correspondiente al método de trabajo.
 * El flujo incluye:
 *  - Mostrar/ocultar el botón de carga según el toggle del formulario.
 *  - Apertura de modal personalizado para previsualizar el PDF.
 *  - Confirmación y vinculación del archivo cargado al formulario (input oculto).
 *  - Vista previa con nombre del archivo y ajuste visual del botón.
 *  - Cierre del modal por botón o tecla Escape.
 *
 * @autor Ivan Medina / Hadbet Altamirano
 * @created Julio 2025
 * @updated [¿?]
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─────────────────────────────────────────────────────
    // 🧩 Referencias del DOM
    // ─────────────────────────────────────────────────────
    const toggle        = document.getElementById('toggle-metodo-trabajo');
    const btnPDF        = document.getElementById('btn-cargar-pdf');
    const modalPDF      = document.getElementById('modal-pdf');
    const cerrarModal   = document.getElementById('cerrarModalPDF');
    const inputModal    = document.getElementById('input-pdf-modal');
    const visorPDF      = document.getElementById('visor-pdf');
    const inputOculto   = document.getElementById('archivoPDF');
    const pdfFileNameEl = document.getElementById('pdf-file-name');
    const btnConfirm    = document.getElementById('confirmar-pdf');

    // 🗃️ Variables internas
    let storedFile = null;
    let storedURL  = null;

    // ─────────────────────────────────────────────────────
    // 1) Inicializar el botón de carga en modo "Agregar"
    // ─────────────────────────────────────────────────────
    function resetBtnPDF() {
        btnPDF.classList.remove('compact');
        btnPDF.innerHTML = '📄 Agregar método de trabajo';
        btnPDF.title     = 'Agregar método de trabajo';
        btnPDF.style.width = 'auto';
    }

    resetBtnPDF();
    btnPDF.style.display = 'none'; // Oculto al cargar si toggle desmarcado

    // ─────────────────────────────────────────────────────
    // 2) Alternar visibilidad del botón al marcar el toggle
    // ─────────────────────────────────────────────────────
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            resetBtnPDF();
            btnPDF.style.display = 'inline-flex';
        } else {
            btnPDF.style.display = 'none';
            storedFile = null;
            storedURL  = null;
            inputOculto.value           = '';
            pdfFileNameEl.style.display = 'none';
            resetBtnPDF();
        }
    });

    // ─────────────────────────────────────────────────────
    // 3) Abrir el modal de carga de PDF
    // ─────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────
    // 4) Cerrar el modal de carga
    // ─────────────────────────────────────────────────────
    cerrarModal.addEventListener('click', () => {
        modalPDF.classList.remove('show');
        if (!storedFile) {
            inputModal.value       = '';
            visorPDF.style.display = 'none';
        }
    });

    // ─────────────────────────────────────────────────────
    // 5) Previsualizar el PDF seleccionado
    // ─────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────
    // 6) Confirmar archivo y compactar botón
    // ─────────────────────────────────────────────────────
    btnConfirm.addEventListener('click', () => {
        const archivo = inputModal.files[0];
        if (!archivo) {
            return Swal.fire('Error', 'Selecciona un PDF antes de guardar.', 'error');
        }

        // Vincular archivo al input oculto del formulario
        storedFile = archivo;
        storedURL  = URL.createObjectURL(archivo);
        const dt    = new DataTransfer();
        dt.items.add(archivo);
        inputOculto.files = dt.files;

        // Mostrar nombre truncado del archivo
        pdfFileNameEl.textContent   = archivo.name;
        pdfFileNameEl.title         = archivo.name;
        pdfFileNameEl.style.display = 'inline-block';

        // Cambiar botón a modo compacto
        btnPDF.classList.add('compact');
        btnPDF.innerHTML = '<i class="fa fa-pencil-alt"></i>';
        btnPDF.title     = 'Modificar método de trabajo';
        btnPDF.style.width = '34px';

        // Cerrar modal
        modalPDF.classList.remove('show');
    });

    // ─────────────────────────────────────────────────────
    // 7) Cerrar modal con tecla Escape
    // ─────────────────────────────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            modalPDF.classList.remove('show');
        }
    });
});
