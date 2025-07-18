/**
 * @file modalFotos.js
 * @project Sistema de Contención de Materiales
 * @module JavaScript
 * @purpose Gestión dinámica de bloques de defectos
 * @description
 * Este script permite al usuario agregar hasta 5 bloques de defectos al formulario principal.
 * Cada bloque incluye un selector de defecto (cargado desde `window.defectosCatalogo`)
 * y dos campos de carga de imágenes (foto OK y NO OK). También permite eliminar bloques
 * y mantiene la indexación correcta de los nombres de los campos para su envío por POST.
 *
 * @author Ivan Medina/Hadbet Altamirano
 * @created Junio 2025
 * @updated [¿?]
 *
 * @uso Utilizado por: `dashboardContencion.php`
 * - Muestra botón "Agregar Fotos"
 * - Usa el contenedor `#bloques-defectos` para renderizar los bloques de defectos
 */

document.addEventListener("DOMContentLoaded", () => {
    const btnAgregar  = document.getElementById("btn-agregar-defecto");
    const contenedor  = document.getElementById("bloques-defectos");
    const MAX_DEFECTOS = 5; // Límite máximo permitido

    // 📦 Catálogo cargado desde el backend (como variable global)
    const defectosCatalogo = window.defectosCatalogo || [];

    let contador = 0;

    // 🟢 Agregar nuevo bloque al hacer clic
    btnAgregar.addEventListener("click", () => {
        if (contador >= MAX_DEFECTOS) {
            Swal.fire("Límite alcanzado", "Solo puedes agregar hasta 5 defectos.", "warning");
            return;
        }

        const index = contador++;
        const bloque = document.createElement("div");
        bloque.className = "bloque-defecto";

        // 🧱 HTML del nuevo bloque
        bloque.innerHTML = `
    <div class="form-row">
      <select name="defectos[${index}][idDefecto]" required>
        <option value="">Selecciona defecto</option>
        ${defectosCatalogo.map(d =>
            `<option value="${d.id}">${d.name}</option>`
        ).join("")}
      </select>

      <div class="campo-foto campo-ok">
        <label class="label-ok">Foto OK:</label>
        <input
          type="file"
          name="defectos[${index}][fotoOk]"
          accept="image/*"
          required
        />
      </div>

      <div class="campo-foto campo-no">
        <label class="label-no">Foto NO OK:</label>
        <input
          type="file"
          name="defectos[${index}][fotoNo]"
          accept="image/*"
          required
        />
      </div>

      <button
        type="button"
        class="btn-eliminar-defecto"
        title="Eliminar este defecto"
      >✖</button>
    </div>
  `;

        // 📌 Agregar bloque al contenedor
        contenedor.appendChild(bloque);

        // 🗑️ Botón de eliminación
        bloque.querySelector(".btn-eliminar-defecto")
            .addEventListener("click", () => {
                bloque.remove();
                contador--;
                reindexarBloques();
            });
    });

    /**
     * @function reindexarBloques
     * @description Recalcula los índices de los nombres de los inputs dentro de cada bloque,
     *              para que el backend pueda procesarlos correctamente.
     */
    function reindexarBloques() {
        const bloques = contenedor.querySelectorAll(".bloque-defecto");
        bloques.forEach((bloque, i) => {
            const select = bloque.querySelector("select");
            const ok     = bloque.querySelector("input[name*='fotoOk']");
            const no     = bloque.querySelector("input[name*='fotoNo']");

            select.name = `defectos[${i}][idDefecto]`;
            ok.name     = `defectos[${i}][fotoOk]`;
            no.name     = `defectos[${i}][fotoNo]`;
        });
    }
});
