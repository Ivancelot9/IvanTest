/**
 * @file subirMetodoTrabajoExterno.js
 * @project Contención de Materiales
 * @module Subida de Método de Trabajo
 * @purpose Controlar la carga de archivos PDF en el formulario `verCaso.php`
 * @description Este script se encarga de gestionar la selección, validación,
 *              previsualización y envío del archivo PDF que contiene el método
 *              de trabajo asociado a un caso. También muestra alertas con SweetAlert2
 *              y permite eliminar el PDF cargado antes de enviarlo.
 *
 * @dependencies SweetAlert2, FormData API, Fetch API
 * @related ../dao/guardarMetodoTrabajo.php (receptor del PDF)
 *
 * @author Ivan Medina/Hadbet Altamirano
 * @created Julio 2025
 * @updated [¿?]
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formMetodo');
    if (!form) return; // 🛑 Si no hay formulario, no hay nada que hacer

    // Elementos principales del formulario
    const fileInput = document.getElementById('input-file');
    const nameInput = document.querySelector('input[name="subidoPor"]');
    const nameDisplay = document.getElementById('file-name');
    const preview = document.getElementById('preview-metodo-trabajo');
    const botonArchivo = document.getElementById('botonSeleccionarArchivo');

    if (!fileInput || !nameInput || !nameDisplay || !preview || !botonArchivo) {
        return; // 🛑 Si algún elemento no existe, se detiene
    }

    // 🔍 Al hacer clic en el botón, se abre el explorador de archivos
    botonArchivo.addEventListener('click', () => fileInput.click());

    /**
     * @function resetAll
     * @description Limpia los campos del formulario y elimina la vista previa
     */
    const resetAll = () => {
        preview.innerHTML = '';
        nameDisplay.textContent = '';
        fileInput.value = '';
        nameInput.value = '';
        form.style.display = 'flex';
    };

    /**
     * @function attachRemoveBtn
     * @description Agrega un botón ✕ para quitar el PDF cargado
     */
    const attachRemoveBtn = () => {
        if (preview.querySelector('.btn-remove')) return;

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';

        const iframe = preview.querySelector('iframe');
        if (iframe) wrapper.appendChild(iframe);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-remove';
        btn.textContent = '✕';
        Object.assign(btn.style, {
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            cursor: 'pointer'
        });
        btn.addEventListener('click', resetAll);

        preview.innerHTML = '';
        preview.appendChild(wrapper);
        wrapper.appendChild(btn);
    };

    // Vista previa del PDF
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];

        if (!file || file.type !== 'application/pdf') {
            Swal.fire('Archivo inválido', 'Selecciona un archivo PDF válido.', 'warning');
            return resetAll();
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire('Archivo demasiado grande', 'El PDF no debe superar los 5 MB.', 'warning');
            return resetAll();
        }

        nameDisplay.textContent = `Archivo: ${file.name}`;
        const url = URL.createObjectURL(file);
        preview.innerHTML = `
            <iframe
                src="${url}"
                width="100%" height="300px"
                style="border:1px solid #ccc; border-radius:6px;"
            ></iframe>
        `;
        attachRemoveBtn();
    });

    // Enviar formulario con validaciones detalladas
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const hasPDF = fileInput.files.length > 0;
        const nameText = nameInput.value.trim();
        const hasName = nameText.length >= 3;

        if (!hasPDF && !hasName) {
            Swal.fire('Faltan datos', 'Debes seleccionar un PDF y escribir tu nombre.', 'warning');
            return;
        } else if (!hasPDF) {
            Swal.fire('PDF faltante', 'Debes seleccionar un archivo PDF.', 'warning');
            return;
        } else if (!hasName) {
            Swal.fire('Nombre inválido', 'Escribe al menos 3 caracteres en el campo de nombre.', 'warning');
            return;
        }

        Swal.fire({
            title: 'Subiendo archivo...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const data = new FormData(form);
        data.set('pdf', fileInput.files[0]);

        try {
            const res = await fetch('../dao/guardarMetodoTrabajo.php', {
                method: 'POST',
                body: data
            });
            const json = await res.json();

            if (json.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: 'PDF subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                location.reload(); // 🔄 Recarga para que se muestre el iframe
            } else {
                throw new Error(json.message || 'Error desconocido.');
            }
        } catch (err) {
            // ❌ Error en subida
            console.error('❌ Error al subir:', err);
            Swal.fire('Error', err.message || 'No se pudo subir el archivo.', 'error');
        }
    });
});
