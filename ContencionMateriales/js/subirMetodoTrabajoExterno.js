// subirMetodoTrabajoExterno.js

document.addEventListener('DOMContentLoaded', () => {
    const form       = document.getElementById('formMetodo');
    const fileInput  = document.getElementById('input-file');
    const nameDisplay= document.getElementById('file-name');
    const preview    = document.getElementById('preview-metodo-trabajo');

    if (!form || !fileInput || !nameDisplay || !preview) return;

    // Resetea todo al estado inicial
    const resetAll = () => {
        preview.innerHTML    = '';
        nameDisplay.textContent = '';
        fileInput.value      = '';
        form.style.display   = 'flex';
    };

    // Añade botón “✕” para modificar/reemplazar
    const attachRemoveBtn = () => {
        if (preview.querySelector('.btn-remove')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-wrapper';
        wrapper.style.position = 'relative';
        // Mueve el iframe dentro del wrapper si existe
        const existingIframe = preview.querySelector('iframe');
        if (existingIframe) {
            wrapper.appendChild(existingIframe);
        }
        // Crea el botón
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
            cursor: 'pointer',
        });
        btn.addEventListener('click', resetAll);
        wrapper.appendChild(btn);
        preview.appendChild(wrapper);
    };

    // 1) Al elegir archivo, mostrar preview + botón de “✕”
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file || file.type !== 'application/pdf') {
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

    // 2) Al enviar, guardar por AJAX y ocultar el form
    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!fileInput.files.length) {
            return Swal.fire('Error', 'Selecciona un PDF antes de enviar.', 'warning');
        }
        const data = new FormData(form);
        data.set('pdf', fileInput.files[0]);

        try {
            const res  = await fetch('../dao/guardarMetodoTrabajo.php', {
                method: 'POST',
                body: data
            });
            const text = await res.text();
            let json;
            try { json = JSON.parse(text); }
            catch {
                console.error('Respuesta inválida:', text);
                return Swal.fire('Error','El servidor no devolvió JSON válido.','error');
            }

            if (json.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: 'PDF subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                form.style.display = 'none';
                attachRemoveBtn();
            } else {
                Swal.fire('Error', json.message || 'No se pudo subir el archivo.','error');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            Swal.fire('Error','Hubo un problema de conexión con el servidor.','error');
        }
    });
});
