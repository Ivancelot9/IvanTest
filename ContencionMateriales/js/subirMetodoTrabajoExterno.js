// Captura errores globales
window.addEventListener('error', ev => {
    console.error('🚨 Error no capturado:', ev.error || ev.message);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 JS cargado');

    const form        = document.getElementById('formMetodo');
    const fileInput   = document.getElementById('input-file');
    const nameInput   = form?.querySelector('input[name="subidoPor"]');
    const nameDisplay = document.getElementById('file-name');
    const preview     = document.getElementById('preview-metodo-trabajo');
    const btnSelect   = document.getElementById('botonSeleccionarArchivo'); // NUEVO botón externo

    if (!form || !fileInput || !nameInput || !nameDisplay || !preview) {
        console.warn('❌ No se encontraron todos los elementos requeridos');
        return;
    }

    // 🔘 Activar el botón "Seleccionar PDF…" (simula click en input)
    if (btnSelect) {
        btnSelect.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // 🔄 Reset completo
    const resetAll = () => {
        console.log('🔄 Reset');
        preview.innerHTML = '';
        nameDisplay.textContent = '';
        fileInput.value = '';
        nameInput.value = '';
        form.style.display = 'flex';
    };

    // ✕ Botón para remover archivo
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
        btn.title = 'Modificar PDF';
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
    };

    // 📄 Mostrar PDF al seleccionarlo
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file || file.type !== 'application/pdf') {
            Swal.fire('Archivo inválido', 'Solo se permiten archivos PDF.', 'warning');
            return resetAll();
        }

        console.log('✅ PDF seleccionado:', file.name);
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

    // 📤 Validación y envío
    form.addEventListener('submit', async e => {
        e.preventDefault();
        console.log('📝 Formulario enviado');

        const hasPDF = fileInput.files.length > 0;
        const hasName = nameInput.value.trim().length > 0;

        if (!hasPDF && !hasName) {
            return Swal.fire('Faltan datos', 'Debes ingresar un nombre y seleccionar un PDF.', 'warning');
        }
        if (!hasPDF) {
            return Swal.fire('PDF faltante', 'Selecciona un archivo PDF antes de continuar.', 'warning');
        }
        if (!hasName) {
            return Swal.fire('Nombre faltante', 'Escribe tu nombre o correo antes de continuar.', 'warning');
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
            const text = await res.text();
            const json = JSON.parse(text);

            if (json.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: 'PDF subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                form.style.display = 'none';
            } else {
                throw new Error(json.message || 'Ocurrió un error al subir el archivo.');
            }
        } catch (err) {
            console.error('❌ Error al subir:', err);
            Swal.fire('Error', err.message || 'Fallo de conexión.', 'error');
        }
    });
});
