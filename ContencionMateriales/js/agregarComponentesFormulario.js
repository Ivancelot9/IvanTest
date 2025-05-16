document.addEventListener('DOMContentLoaded', () => {
    // 1) Inyecto el modal en el body
    const modalHTML = `
    <div id="catalog-modal" class="modal-overlay" style="display:none;">
      <div class="modal-box">
        <h2 id="catalog-modal-title"></h2>
        <input type="text" id="catalog-modal-input" placeholder="Nombre..." />
        <div class="modal-actions">
          <button id="catalog-modal-cancel" type="button">Cancelar</button>
          <button id="catalog-modal-save"   type="button">Guardar</button>
        </div>
      </div>
    </div>
  `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 2) Capturo referencias al modal
    const modal      = document.getElementById('catalog-modal');
    const modalTitle = document.getElementById('catalog-modal-title');
    const modalInput = document.getElementById('catalog-modal-input');
    const btnCancel  = document.getElementById('catalog-modal-cancel');
    const btnSave    = document.getElementById('catalog-modal-save');

    // 3) Mapeo de tipo ⇒ elemento en el formulario
    const idMap = {
        responsable: 'responsable',  // ahora es input text
        terciaria:   'terciaria',    // select
        proveedor:   'proveedor',    // select
        commodity:   'commodity',    // select
        defecto:     'defectos'      // select
    };
    const elems = {};
    Object.entries(idMap).forEach(([type, id]) => {
        const el = document.getElementById(id);
        if (el) elems[type] = el;
    });

    let currentType, currentTarget;

    // 4) Funciones para abrir/cerrar modal
    function openModal(type, targetEl) {
        currentType   = type;
        currentTarget = targetEl;
        modalTitle.textContent = 'Nuevo ' + type.charAt(0).toUpperCase() + type.slice(1);
        modalInput.value = '';
        modal.style.display = 'flex';
        modalInput.focus();
    }
    function closeModal() {
        modal.style.display = 'none';
    }

    btnCancel.addEventListener('click', closeModal);

    // 5) Al guardar, envío al PHP y actualizo el select/input
    btnSave.addEventListener('click', async () => {
        const name = modalInput.value.trim();
        if (!name) return modalInput.focus();

        const form = new FormData();
        form.append('type', currentType);
        form.append('name', name);

        try {
            const res  = await fetch('https://grammermx.com/IvanTest/ContencionMateriales/dao/agregarComponentesFormulario.php', {
                method: 'POST',
                body: form
            });
            const data = await res.json();
            if (data.status !== 'success') {
                throw new Error(data.message || 'Error al guardar');
            }

            if (currentTarget.tagName === 'SELECT') {
                const opt = document.createElement('option');
                opt.value       = data.id;
                opt.textContent = data.name;
                currentTarget.appendChild(opt);
                currentTarget.value = data.id;
            } else {
                currentTarget.value = data.name;
            }

            closeModal();
            currentTarget.focus();

        } catch (err) {
            alert('¡Ups! ' + err.message);
        }
    });

    // 6) Asigno evento a cada botón de la sidebar derecha
    document.querySelectorAll('.form-sidebar button[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            const target = elems[type];
            if (!target) {
                console.warn(`No existe elemento para tipo “${type}”`);
                return;
            }
            openModal(type, target);
        });
    });
});
