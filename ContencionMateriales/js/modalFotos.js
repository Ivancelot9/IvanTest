document.addEventListener("DOMContentLoaded", () => {
    const btnAgregar = document.getElementById("btn-agregar-defecto");
    const contenedor = document.getElementById("bloques-defectos");
    const MAX_DEFECTOS = 5;

    const defectosCatalogo = window.defectosCatalogo || [];

    let contador = 0;

    btnAgregar.addEventListener("click", () => {
        if (contador >= MAX_DEFECTOS) {
            Swal.fire("Límite alcanzado", "Solo puedes agregar hasta 5 defectos por caso.", "warning");
            return;
        }

        const index = contador++;
        const bloque = document.createElement("div");
        bloque.className = "bloque-defecto";

        bloque.innerHTML = `
            <div class="form-row">
                <select name="defectos[${index}][idDefecto]" required>
                    <option value="">Selecciona defecto</option>
                    ${defectosCatalogo.map(d =>
            `<option value="${d.id}">${d.name}</option>`).join("")}
                </select>

                <label>Foto OK:</label>
                <input type="file" name="defectos[${index}][fotoOk]" accept="image/*" required />

                <label>Foto NO OK:</label>
                <input type="file" name="defectos[${index}][fotoNo]" accept="image/*" required />

                <button type="button" class="btn-eliminar-defecto" title="Eliminar este defecto">✖</button>
            </div>
        `;

        contenedor.appendChild(bloque);

        const btnEliminar = bloque.querySelector(".btn-eliminar-defecto");
        btnEliminar.addEventListener("click", () => {
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
