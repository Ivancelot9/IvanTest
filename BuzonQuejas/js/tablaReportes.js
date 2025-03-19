document.addEventListener("DOMContentLoaded", function () {
    const filasPorPagina = 10;
    let paginaActual = 1;
    let datosReportes = [];
    let datosFiltrados = [];

    // ✅ Elementos del DOM
    const tablaBody = document.getElementById("tabla-body");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const filterColumn = document.getElementById("filter-column");
    const filterInput = document.getElementById("filter-input");
    const filterButton = document.getElementById("filter-button");

    // 🔹 Función para resaltar texto en la búsqueda
    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    // 🔹 Cargar reportes desde la base de datos
    function cargarReportes() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerReportesPendientes.php")
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    console.warn("⚠ No hay reportes disponibles.");
                    return;
                }
                datosReportes = data;
                datosFiltrados = [...datosReportes]; // Asegurar una copia para filtrado
                mostrarReportes(paginaActual);
            })
            .catch(error => console.error("❌ Error al cargar reportes:", error));
    }

    function mostrarReportes(pagina) {
        tablaBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltrados.slice(inicio, fin);

        let estatusGuardados = JSON.parse(localStorage.getItem("estatusReportes")) || {};

        reportesPagina.forEach(reporte => {
            let encargadoTexto = reporte.Encargado ? reporte.Encargado : "N/A";
            let folio = reporte.FolioReportes;
            let estadoGuardado = estatusGuardados[folio] ? estatusGuardados[folio].progresoManual : 100;
            let estadoClase = obtenerClaseEstado(estadoGuardado);

            let fila = document.createElement("tr");
            fila.innerHTML = `
            <td>${resaltarTexto(reporte.FolioReportes, filterInput.value)}</td>
            <td>${resaltarTexto(reporte.FechaRegistro, filterInput.value)}</td>
            <td>${resaltarTexto(reporte.NumeroNomina, filterInput.value)}</td>
            <td>${resaltarTexto(reporte.Area, filterInput.value)}</td>
            <td>${resaltarTexto(encargadoTexto, filterInput.value)}</td>
            <td><button class="mostrar-descripcion" data-descripcion="${reporte.Descripcion}">Mostrar Descripción</button></td>
            <td><button class="agregar-comentario" data-folio="${folio}">Agregar Comentario</button></td>
            <td class="estatus-cell">
                <button class="ver-estatus-btn ${estadoClase}" data-folio="${folio}">Ver Estatus</button>
            </td>
            <td><button class="seleccionar-fecha" data-folio="${folio}">Finalizar Reporte</button></td>
        `;

            tablaBody.appendChild(fila);
        });

        pageIndicator.textContent = `Página ${pagina}`;
        prevPageBtn.disabled = pagina === 1;
        nextPageBtn.disabled = fin >= datosFiltrados.length;

        // 🔹 **Reinicializar eventos para abrir el modal de estatus**
        document.querySelectorAll(".ver-estatus-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                let folio = btn.getAttribute("data-folio");
                abrirModal(folio); // 🔹 Función de `estatusEditor.js`
            });
        });
    }

    window.obtenerClaseEstado = function (progreso) {
        if (progreso === 100) return "green";
        if (progreso === 75) return "blue";
        if (progreso === 50) return "yellow";
        if (progreso === 25) return "red";
        return "";
    };
    /* 🔹 Función para obtener la clase de color según el estado */
    function obtenerClaseEstado(progreso) {
        if (progreso === 100) return "green";
        if (progreso === 75) return "blue";
        if (progreso === 50) return "yellow";
        if (progreso === 25) return "red";
        return "";
    }

    // 🔹 Filtrar reportes en tiempo real
    function filtrarReportes() {
        const valorFiltro = filterInput.value.toLowerCase();
        const columna = filterColumn.value;

        if (!columna || columna.trim() === "") {
            console.warn("⚠ No se ha seleccionado una columna para filtrar.");
            return;
        }

        datosFiltrados = datosReportes.filter(reporte => {
            let valor = reporte[columna] ? String(reporte[columna]).toLowerCase() : "";
            return valor.includes(valorFiltro);
        });

        paginaActual = 1;
        mostrarReportes(paginaActual);
    }

    // 🔹 Eventos para paginación
    prevPageBtn.addEventListener("click", () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarReportes(paginaActual);
        }
    });

    nextPageBtn.addEventListener("click", () => {
        if ((paginaActual * filasPorPagina) < datosFiltrados.length) {
            paginaActual++;
            mostrarReportes(paginaActual);
        }
    });

    filterInput.addEventListener("input", filtrarReportes);
    filterButton.addEventListener("click", filtrarReportes);

    // 🔹 Cargar los reportes al iniciar
    cargarReportes();
});
