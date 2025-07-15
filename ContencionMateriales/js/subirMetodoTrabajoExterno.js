// subirMetodoTrabajoExterno.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 subirMetodoTrabajoExterno.js cargado');

    const form        = document.getElementById('formMetodo');
    const fileInput   = document.getElementById('input-file');
    const nameInput   = form?.querySelector('input[name="subidoPor"]');
    const nameDisplay = document.getElementById('file-name');
    const preview     = document.getElementById('preview-metodo-trabajo');

    if (!form) {
        console.error('❌ No existe form#formMetodo');
        return;
    }
    if (!fileInput)   console.error('❌ No existe input#input-file');
    if (!nameInput)   console.error('❌ No existe input[name="subidoPor"]');
    if (!nameDisplay) console.error('❌ No existe div#file-name');
    if (!preview)     console.error('❌ No existe div#preview-metodo-trabajo');

    //  Función para resetear todo
    const resetAll = () => {
        console.log('🔄 Reseting form and preview');
        preview.innerHTML       = '';
        nameDisplay.textContent = '';
        fileInput.value         = '';
        nameInput.value         = '';
        form.style.display      = 'flex';
    };

    //  Función para añadir botón de “✕” sobre el iframe
    const attachRemoveBtn = () => {
        if (preview.querySelector('.btn-remove')) return;
        console.log('➕ Agregando botón de remover PDF');
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-wrapper';
        wrapper.style.position = 'relative';

        const existingIframe = preview.querySelector('iframe');
        if (existingIframe) wrapper.appendChild(existingIframe);

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
        wrapper.appendChild(btn);
        preview.appendChild(wrapper);
    };

    // 1) Al cambiar el input de archivo
    fileInput.addEventListener('change', () => {
        console.log('📄 fileInput change event');
        const file = fileInput.files[0];
        if (!file || file.type !== 'application/pdf') {
            console.warn('⚠️ No es un PDF válido');
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

    // 2) Al enviar el formulario
    form.addEventListener('submit', async e => {
        e.preventDefault();
        console.log('📝 submit capturado');

        // Validaciones
        if (!fileInput.files.length) {
            console.log('❌ falta PDF');
            return Swal.fire({
                icon: 'warning',
                title: 'Selecciona un PDF primero',
                confirmButtonText: 'Entendido'
            });
        }
        if (!nameInput.value.trim()) {
            console.log('❌ falta nombre o correo');
            return Swal.fire({
                icon: 'warning',
                title: 'Ingresa tu nombre o correo',
                confirmButtonText: 'Entendido'
            });
        }

        Swal.fire({
            title: 'Subiendo PDF…',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const data = new FormData(form);
        data.set('pdf', fileInput.files[0]);

        try {
            console.log('🌐 Enviando fetch a guardarMetodoTrabajo.php');
            const res  = await fetch('../dao/guardarMetodoTrabajo.php', {
                method: 'POST',
                body: data
            });
            const text = await res.text();
            console.log('📥 respuesta del servidor:', text);

            let json;
            try {
                json = JSON.parse(text);
            } catch (err) {
                console.error('❌ JSON inválido:', err);
                throw new Error('Respuesta del servidor no es JSON válido');
            }

            if (json.status === 'success') {
                console.log('🎉 PDF subido con éxito');
                await Swal.fire({
                    icon: 'success',
                    title: 'PDF subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                form.style.display = 'none';
                attachRemoveBtn();
            } else {
                console.error('❌ Error en la respuesta:', json.message);
                throw new Error(json.message || 'No se pudo subir el archivo');
            }
        } catch (err) {
            console.error('❌ Error durante fetch:', err);
            Swal.fire('Error', err.message, 'error');
        }
    });
});
