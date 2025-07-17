/**
 * @file        ValidacionesCasos.js
 * @project     Contención de Materiales
 * @module      Frontend - Validación y Envío de Casos
 * @purpose     Validar el formulario de creación de caso y notificar al resto del sistema
 * @description
 * Este script realiza las siguientes tareas:
 * 1. Escucha el envío del formulario de caso.
 * 2. Valida campos obligatorios del formulario.
 * 3. Verifica que se hayan agregado defectos con sus fotos OK/NO OK.
 * 4. Verifica la presencia del archivo PDF si se activó el toggle correspondiente.
 * 5. Envia los datos al servidor vía `fetch`.
 * 6. Notifica mediante `BroadcastChannel` al resto de pestañas del navegador.
 * 7. Actualiza el contador/badge de nuevos casos guardados.
 * 8. Inserta visualmente el nuevo caso en la tabla de "Mis Casos".
 *
 * Este archivo usa:
 * - SweetAlert2 para feedback visual
 * - BroadcastChannel API para sincronizar notificaciones entre pestañas
 * - LocalStorage para almacenar el contador local de nuevos casos
 *
 * @author      Ivan Medina/Hadbet Altamirano
 * @created     Mayo 2025
 * @updated     [¿?]
 */

// Espera a que cargue todo el DOM
document.addEventListener('DOMContentLoaded', () => {
    // ============================
    // 🔔 Notificaciones y canales
    // ============================
    const username    = document.body.dataset.username;
    const canalLocal  = new BroadcastChannel(`casosChannel_${username}`);
    const canalGlobal = new BroadcastChannel('canal-casos');
    const btnMisCasos = document.getElementById('btn-mis-casos');
    let badgeLocal    = btnMisCasos?.querySelector('.badge-count') || null;

    // 🧠 LocalStorage key personalizado por usuario
    const storageKey  = `newCasesCount_${username}`;
    let contadorLocal = parseInt(localStorage.getItem(storageKey) || '0', 10);

    actualizarBadgeLocal(contadorLocal);

    // Escucha de nuevos casos recibidos (local)
    canalLocal.addEventListener('message', ({ data }) => {
        if (data.type === 'new-case') {
            contadorLocal++;
            localStorage.setItem(storageKey, contadorLocal);
            actualizarBadgeLocal(contadorLocal);
        }
    });

    // Al hacer clic en "Mis Casos", reiniciar el contador
    btnMisCasos?.addEventListener('click', () => {
        contadorLocal = 0;
        localStorage.setItem(storageKey, '0');
        actualizarBadgeLocal(0);
    });

    // ============================
    // 📤 Validación y envío
    // ============================
    const form = document.querySelector('form.data-form');

    form.addEventListener('submit', async e => {
        e.preventDefault();

        // 1️⃣ Validación de campos generales
        const responsable = form.Responsable.value.trim();
        const numeroParte = form.NumeroParte.value.trim();
        const cantidad    = form.Cantidad.value.trim();
        const descripcion = form.Descripcion.value.trim();
        const idTerceria  = form.IdTerceria.value;
        const idProveedor = form.IdProveedor.value;
        const idCommodity = form.IdCommodity.value;

        if (!responsable || !numeroParte || !cantidad || !descripcion ||
            !idTerceria || !idProveedor || !idCommodity) {
            return Swal.fire('Error', 'Por favor completa todos los datos generales.', 'error');
        }

        // 2️⃣ Validación de bloques de defectos
        const bloques = document.querySelectorAll('.bloque-defecto');
        if (bloques.length === 0) {
            return Swal.fire('Error', 'Agrega al menos un defecto con sus dos fotos.', 'error');
        }

        for (let i = 0; i < bloques.length; i++) {
            const bloque = bloques[i];
            const sel  = bloque.querySelector('select');
            const ok   = bloque.querySelector('input[type="file"][name*="[fotoOk]"]');
            const no   = bloque.querySelector('input[type="file"][name*="[fotoNo]"]');

            if (!sel.value) {
                return Swal.fire('Error', `Selecciona el defecto en el bloque ${i + 1}.`, 'error');
            }
            if (!ok.files.length) {
                return Swal.fire('Error', `Agrega la foto OK en el bloque ${i + 1}.`, 'error');
            }
            if (!no.files.length) {
                return Swal.fire('Error', `Agrega la foto NO OK en el bloque ${i + 1}.`, 'error');
            }
        }

        // 2.5️⃣ Validación condicional del método de trabajo en PDF
        const togglePDF = document.getElementById('toggle-metodo-pdf');
        const inputPDF  = document.getElementById('input-metodo-pdf');

        if (togglePDF?.checked && inputPDF?.files.length === 0) {
            return Swal.fire('Error', 'Debes subir el archivo PDF del método de trabajo.', 'error');
        }

        // 3️⃣ Envío al servidor
        Swal.fire({
            title: 'Guardando caso…',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form)
            });

            if (!resp.ok) {
                const text = await resp.text();
                Swal.close();
                console.error('SERVER ERROR:', text);
                return Swal.fire('Error interno', text, 'error');
            }

            Swal.close();
            const json = await resp.json();
            if (json.status !== 'success') {
                throw new Error(json.message || 'Error inesperado');
            }

            // 4️⃣ Notificación a otras pestañas
            canalLocal.postMessage({ type: 'new-case', folio: json.folio });
            canalGlobal.postMessage({
                type:        'new-case',
                folio:       json.folio,
                fecha:       json.fecha,
                estatus:     json.estatus,
                responsable: json.responsable,
                terciaria:   json.terciaria,
                from:        username
            });

            // 5️⃣ Actualizar badge y contador local
            contadorLocal++;
            localStorage.setItem(storageKey, contadorLocal);
            actualizarBadgeLocal(contadorLocal);

            // 6️⃣ Limpiar formulario y bloques
            form.reset();
            const cont = document.getElementById('bloques-defectos');
            if (cont) cont.innerHTML = '';

            // 7️⃣ Añadir nueva fila a tabla de "Mis Casos"
            const tbody = document.querySelector('#historial .cases-table tbody');
            if (tbody) {
                const tr = document.createElement('tr');
                tr.innerHTML =
                    `<td>${json.folio}</td>` +
                    `<td>${json.fecha}</td>` +
                    `<td><button class="show-desc" data-folio="${json.folio}">Mostrar descripción</button></td>` +
                    `<td>${json.estatus}</td>`;
                tbody.prepend(tr);
                window.historialPaginador?.addRow(tr);
            }

            await Swal.fire('¡Caso guardado!', json.message, 'success');
        } catch (err) {
            console.error(err);
            Swal.close();
            Swal.fire('Error', err.message, 'error');
        }
    });

    // 🔄 Función para actualizar visualmente el badge de notificaciones
    function actualizarBadgeLocal(count) {
        if (badgeLocal) {
            if (count > 0) {
                badgeLocal.textContent = count;
                badgeLocal.style.display = 'inline-block';
            } else {
                badgeLocal.style.display = 'none';
            }
        }
    }
});
