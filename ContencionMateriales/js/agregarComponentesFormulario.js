/**
 * @file agregarComponentesFormulario.js
 * @project Contención de Materiales
 * @module formularios
 * @purpose Agregar dinámicamente un nuevo valor a catálogos (terciaria, proveedor, commodity, defecto)
 * @description Este script permite al usuario agregar elementos nuevos a los catálogos desde el frontend,
 * sin necesidad de ingresar directamente a la base de datos. Inyecta un modal HTML y utiliza Fetch API
 * para guardar el nuevo valor vía PHP. El nuevo elemento se agrega directamente al <select> correspondiente.
 * @author Ivan Medina / Hadbet Altamirano
 * @created Junio 2025
 * @updated Junio 2025
 *
 * @uso
 * Utilizado en `dashboardContencion.php`. El botón debe tener el atributo `data-type`
 * (ej: `data-type="proveedor"`) y debe estar ubicado en un contenedor `.form-sidebar`.
 * Los elementos afectados deben tener los IDs: terciaria, proveedor, commodity o defectos.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1️⃣ Inyecta el modal al DOM
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

    // 2️⃣ Referencias a elementos del modal
    const modal      = document.getElementById('catalog-modal');
    const modalTitle = document.getElementById('catalog-modal-title');
    const modalInput = document.getElementById('catalog-modal-input');
    const btnCancel  = document.getElementById('catalog-modal-cancel');
    const btnSave    = document.getElementById('catalog-modal-save');

    // 3️⃣ Mapeo tipo ⇒ ID del <select>
    const idMap = {
        terciaria: 'terciaria',
        proveedor: 'proveedor',
        commodity: 'commodity',
        defecto:   'defectos'
    };

    // Referencias directas a los <select>
    const elems = {};
    Object.entries(idMap).forEach(([type, id]) => {
        const el = document.getElementById(id);
        if (el) elems[type] = el;
    });

    let currentType = null;
    let currentTarget = null;

    // 4️⃣ Funciones para mostrar y cerrar el modal
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

    // 5️⃣ Al guardar, realiza petición a PHP y actualiza el <select>
    btnSave.addEventListener('click', async () => {
        const name = modalInput.value.trim();
        if (!name) return modalInput.focus();

        const form = new FormData();
        form.append('type', currentType);
        form.append('name', name);

        try {
            const res = await fetch('https://grammermx.com/IvanTest/ContencionMateriales/dao/agregarComponentesFormulario.php', {
                method: 'POST',
                body: form
            });
            const data = await res.json();
            if (data.status !== 'success') throw new Error(data.message);

            // ✅ Crear nueva opción y seleccionarla
            const select = currentTarget;
            const opt = document.createElement('option');
            opt.value = data.id;
            opt.textContent = data.name;
            select.appendChild(opt);
            select.value = data.id;

            closeModal();
            select.focus();

        } catch (err) {
            alert('¡Ups! ' + err.message);
        }
    });

    // 6️⃣ Botones para crear nuevo elemento en el formulario
    document.querySelectorAll('.form-sidebar button[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            const select = elems[type];
            if (!select) return console.warn(`⚠️ No existe elemento para “${type}”`);
            openModal(type, select);
        });
    });
});
