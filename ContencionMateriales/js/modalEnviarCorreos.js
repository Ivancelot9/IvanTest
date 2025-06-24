// modalEnviarCorreo.js
// Requiere SweetAlert2 (Swal.fire) y tu función enviarCorreo(folios: string[], email: string): Promise

document.addEventListener('DOMContentLoaded', () => {
    // 1) Inyectar el HTML del modal en el body
    const html = `
    <div id="modal-enviar">
      <div class="backdrop"></div>
      <div class="content">
        <header>
          <h2>Confirma Casos a Enviar</h2>
          <button class="close-btn" id="modal-close">×</button>
        </header>
        <section>
          <ul id="lista-folios"></ul>
          <label for="email-destino">Correo destino:</label>
          <input type="email" id="email-destino" placeholder="correo@ejemplo.com">
        </section>
        <footer>
          <button id="modal-send">📤 Enviar</button>
          <button id="modal-cancel">Cancelar</button>
        </footer>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    // 2) Referencias
    const modal     = document.getElementById('modal-enviar');
    const backdrop  = modal.querySelector('.backdrop');
    const btnClose  = document.getElementById('modal-close');
    const btnCancel = document.getElementById('modal-cancel');
    const btnSend   = document.getElementById('modal-send');
    const ulFolios  = document.getElementById('lista-folios');
    const inpEmail  = document.getElementById('email-destino');
    const toggleBtn = document.getElementById('btn-toggle-seleccion');

    // 3) Funciones abrir/cerrar
    function openModal() {
        ulFolios.innerHTML = '';
        // recoger folios marcados
        const folios = Array.from(document.querySelectorAll('.check-folio:checked'))
            .map(cb => cb.value);
        if (folios.length === 0) {
            // si quieres, puedes omitir este warning
            Swal.fire('Atención','No has seleccionado ningún caso.','warning');
            return;
        }
        folios.forEach(folio => {
            const li = document.createElement('li');
            li.dataset.folio = folio;
            li.textContent   = `Folio ${folio}`;
            const btnX = document.createElement('button');
            btnX.textContent = '×';
            btnX.className   = 'remove-folio';
            btnX.addEventListener('click', () => li.remove());
            li.appendChild(btnX);
            ulFolios.appendChild(li);
        });
        inpEmail.value = '';
        modal.style.display = 'block';
    }
    function closeModal() {
        modal.style.display = 'none';
    }

    // 4) Cierres
    backdrop.addEventListener('click', closeModal);
    btnClose .addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // 5) Interceptar el segundo click en “Confirmar envío”
    toggleBtn.addEventListener('click', function(e) {
        // solo si ya está en modo “✅ Confirmar envío”
        if (this.textContent.startsWith('✅')) {
            const checked = document.querySelectorAll('.check-folio:checked');
            if (checked.length === 0) {
                // si quieres warning, descomenta:
                // Swal.fire('Atención','Marca al menos un caso.','warning');
            } else {
                openModal();
            }
            // evitar que el script de selección original cambie el estado
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true);  // <<< captura antes que el listener original

    // 6) Envío desde el modal
    btnSend.addEventListener('click', () => {
        const folios = Array.from(ulFolios.children).map(li => li.dataset.folio);
        const email  = inpEmail.value.trim();
        if (!/.+@.+\..+/.test(email)) {
            Swal.fire('Error','Ingresa un correo válido.','error');
            return;
        }
        enviarCorreo(folios, email)
            .then(() => {
                Swal.fire('Éxito','Correos enviados.','success');
                closeModal();
                // ahora sí desactivar modo selección
                toggleBtn.click();
            })
            .catch(err => {
                Swal.fire('Error','Falló el envío: '+err.message,'error');
            });
    });
});
