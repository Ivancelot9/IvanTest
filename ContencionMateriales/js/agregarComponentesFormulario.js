document.addEventListener('DOMContentLoaded', () => {
    // 1) Inyecta el modal (igual que antes)
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

    // 2) Referencias al modal
    const modal      = document.getElementById('catalog-modal');
    const modalTitle = document.getElementById('catalog-modal-title');
    const modalInput = document.getElementById('catalog-modal-input');
    const btnCancel  = document.getElementById('catalog-modal-cancel');
    const btnSave    = document.getElementById('catalog-modal-save');

    // 3) Mapeo tipo ⇒ select DOM (solo 4)
    const idMap = {
        terciaria: 'terciaria',
        proveedor: 'proveedor',
        commodity: 'commodity',
        defecto:   'defectos'
    };
    const elems = {};
    Object.entries(idMap).forEach(([type, id]) => {
        const el = document.getElementById(id);
        if (el) elems[type] = el;
    });

    let currentType, currentTarget;

    // 4) Abrir/cerrar modal
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

    // 5) Guardar y actualizar el <select>
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
            if (data.status !== 'success') throw new Error(data.message);

            // Inserta la opción nueva
            const select = currentTarget;
            const opt    = document.createElement('option');
            opt.value       = data.id;
            opt.textContent = data.name;
            select.appendChild(opt);
            select.value = data.id;

            closeModal();
            select.focus();

        } catch (err) {
            alert('¡Ups! ' + err.message);
        }
    });

    // 6) Asocia a los 4 botones
    document.querySelectorAll('.form-sidebar button[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type   = btn.getAttribute('data-type');
            const select = elems[type];
            if (!select) return console.warn(`No existe elemento para “${type}”`);
            openModal(type, select);
        });
    });
});
