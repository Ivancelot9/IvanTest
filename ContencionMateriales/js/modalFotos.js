document.addEventListener("DOMContentLoaded", () => {
    const btnAgregar = document.getElementById("btn-agregar-defecto");
    const contenedor = document.getElementById("bloques-defectos");
    const MAX_DEFECTOS = 5;

    const defectosCatalogo = window.defectosCatalogo || [];

    let contador = 0;

    btnAgregar.addEventListener("click", () => {
        if (contador >= MAX_DEFECTOS) {
            Swal.fire("Límite alcanzado", "Solo puedes agregar hasta 5 defectos.", "warning");
            return;
        }
        const index = contador++;
        const bloque = document.createElement("div");
        bloque.className = "bloque-defecto";

        // Aquí el innerHTML actualizado
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

        // Inserta y enlaza el botón de eliminar
        contenedor.appendChild(bloque);
        bloque.querySelector(".btn-eliminar-defecto")
            .addEventListener("click", () => {
                bloque.remove();
                contador--;
                reindexarBloques();
            });
    });

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
