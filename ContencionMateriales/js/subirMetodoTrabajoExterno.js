// subirMetodoTrabajoExterno.js

// Atrapa cualquier error global para que no rompa el flujo
window.addEventListener('error', ev => {
    console.error('🚨 Uncaught error:', ev.error || ev.message);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 subirMetodoTrabajoExterno.js cargado (DOMContentLoaded)');

    const form        = document.getElementById('formMetodo');
    const fileInput   = document.getElementById('input-file');
    const nameInput   = form?.querySelector('input[name="subidoPor"]');
    const nameDisplay = document.getElementById('file-name');
    const preview     = document.getElementById('preview-metodo-trabajo');

    if (!form) {
        console.error('❌ No existe form#formMetodo — ¿estás en la rama “no tiene PDF” del PHP?');
        return;
    }
    console.log('📋 form#formMetodo encontrado, montando listener submit');

    // verificación de elementos
    if (!fileInput)   console.error('❌ Falta #input-file');
    if (!nameInput)   console.error('❌ Falta input[name="subidoPor"]');
    if (!nameDisplay) console.error('❌ Falta #file-name');
    if (!preview)     console.error('❌ Falta #preview-metodo-trabajo');

    // Función para resetear
    const resetAll = () => {
        console.log('🔄 Reseteando formulario y preview');
        preview.innerHTML       = '';
        nameDisplay.textContent = '';
        fileInput.value         = '';
        nameInput.value         = '';
        form.style.display      = 'flex';
    };

    // Función para agregar botón ✕
    const attachRemoveBtn = () => {
        if (preview.querySelector('.btn-remove')) return;
        console.log('➕ Añadiendo botón “✕” para reemplazar PDF');
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
        wrapper.appendChild(btn);
        preview.appendChild(wrapper);
    };

    // 1) Previsualizar nada más elegir PDF
    fileInput.addEventListener('change', () => {
        console.log('📄 input-file “change”');
        const file = fileInput.files[0];
        if (!file || file.type !== 'application/pdf') {
            console.warn('⚠️ El archivo no es PDF, reseteando');
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

    // 2) Listener de submit
    console.log('👂 Añadiendo listener “submit” al form');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        console.log('📝 “submit” capturado');

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
            console.log('🌐 Fetch POST a guardarMetodoTrabajo.php');
            const res  = await fetch('../dao/guardarMetodoTrabajo.php', {
                method: 'POST',
                body: data
            });
            const text = await res.text();
            console.log('📥 respuesta bruta:', text);

            let json;
            try {
                json = JSON.parse(text);
            } catch (err) {
                console.error('❌ JSON.parse falló:', err);
                throw new Error('Respuesta del servidor inválida');
            }

            if (json.status === 'success') {
                console.log('🎉 upload OK');
                await Swal.fire({
                    icon: 'success',
                    title: 'PDF subido correctamente',
                    timer: 1500,
                    showConfirmButton: false
                });
                form.style.display = 'none';
                attachRemoveBtn();
            } else {
                console.error('❌ Error en JSON:', json.message);
                throw new Error(json.message || 'No se pudo subir el PDF');
            }
        } catch (err) {
            console.error('❌ Excepción durante fetch:', err);
            Swal.fire('Error', err.message, 'error');
        }
    });

});
