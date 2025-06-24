// modalEnviarCorreo.js
// Requiere SweetAlert2 (Swal.fire) y tu función enviarCorreo(folios: string[], email: string): Promise

document.addEventListener('DOMContentLoaded', () => {
    // ——> Solo inicializamos en la sección “Mis Casos”
    if (!document.getElementById('tabla-historial')) {
        return;
    }

    // 1) Inyectar HTML del modal
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
    if (!toggleBtn) return;

    // 3) Abrir / cerrar modal
    function openModal() {
        ulFolios.innerHTML = '';
        const folios = Array.from(
            document.querySelectorAll('.check-folio:checked')
        ).map(cb => cb.value);

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

    // 5) Capturar 2º click (Confirmar envío)
    toggleBtn.addEventListener('click', function(e) {
        // Solo si ya estamos en modo selección
        if (this.dataset.selectionActive === 'true') {
            const marked = document.querySelectorAll('.check-folio:checked');
            if (marked.length === 0) {
                Swal.fire('Atención','Marca al menos un caso.','warning');
            } else {
                openModal();
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    }, true); // fase captura

    // 6) Envío final
    btnSend.addEventListener('click', () => {
        const folios = Array.from(ulFolios.children).map(li => li.dataset.folio);
        const email  = inpEmail.value.trim();
        if (!/.+@.+\..+/.test(email)) {
            Swal.fire('Error','Ingresa un correo válido.','error');
            return;
        }
        enviarCorreo(folios, email)
            .then(() => {
                Swal.fire('Éxito','Correos enviados correctamente.','success');
                closeModal();
                toggleBtn.click(); // restablecer modo selección
            })
            .catch(err => {
                Swal.fire('Error','Falló el envío: ' + err.message,'error');
            });
    });
});
