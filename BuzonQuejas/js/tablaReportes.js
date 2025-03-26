document.addEventListener("DOMContentLoaded", function () {
    const canal = new BroadcastChannel("canalReportes"); // 🔧 AÑADIDO AQUÍ

    const filasPorPagina = 10;
    let paginaActual = 1;
    let datosReportes = [];
    let datosFiltrados = [];

    const tablaBody = document.getElementById("tabla-body");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const filterColumn = document.getElementById("filter-column");
    const filterInput = document.getElementById("filter-input");
    const filterButton = document.getElementById("filter-button");

    const columnasBD = {
        folio: "FolioReportes",
        nomina: "NumeroNomina",
        encargado: "Encargado",
        fechaRegistro: "FechaRegistro"
    };

    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    function obtenerClaseEstado(progreso) {
        if (progreso === 100) return "green";
        if (progreso === 75) return "blue";
        if (progreso === 50) return "yellow";
        if (progreso === 25) return "red";
        return "";
    }

    function cargarReportes() {
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/obtenerReportesPendientes.php")
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    console.warn("⚠ No hay reportes disponibles.");
                    return;
                }
                datosReportes = data;
                datosFiltrados = [...datosReportes];
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
            let encargadoTexto = reporte.Encargado || reporte.encargado || "N/A";
            let folio = reporte.FolioReportes || reporte.folio || "S/F";
            let progresoManual = estatusGuardados[folio]?.progresoManual || null;
            let estadoClase = obtenerClaseEstado(progresoManual);

            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${resaltarTexto(folio, filterInput.value)}</td>
                <td>${resaltarTexto(reporte.FechaRegistro || reporte.fechaRegistro || "Sin fecha", filterInput.value)}</td>
                <td>${resaltarTexto(reporte.NumeroNomina || reporte.nomina || "Sin nómina", filterInput.value)}</td>
                <td>${resaltarTexto(reporte.Area || reporte.area || "Sin área", filterInput.value)}</td>
                <td>${resaltarTexto(encargadoTexto, filterInput.value)}</td>
                <td><button class="mostrar-descripcion" data-descripcion="${reporte.Descripcion || reporte.descripcion || 'Sin descripción'}">Mostrar Descripción</button></td>
                <td><button class="agregar-comentario" data-folio="${folio}">Agregar Comentario</button></td>
                <td class="estatus-cell">
                    <button class="ver-estatus-btn ${estadoClase}" data-folio="${folio}" 
                        style="${progresoManual !== null ? '' : 'background: white; color: black; border: 2px solid black;'}">
                        Ver Estatus
                    </button>
                </td>
                <td><button class="seleccionar-fecha" data-folio="${folio}">Finalizar Reporte</button></td>
            `;

            tablaBody.appendChild(fila);
        });

        pageIndicator.textContent = `Página ${pagina}`;
        prevPageBtn.disabled = pagina === 1;
        nextPageBtn.disabled = fin >= datosFiltrados.length;
    }

    function filtrarReportes() {
        const valorFiltro = filterInput.value.trim().toLowerCase();
        const columnaSeleccionada = filterColumn.value;
        const columnaBD = columnasBD[columnaSeleccionada];

        if (!columnaBD) return;

        datosFiltrados = datosReportes.filter(reporte => {
            let valor = reporte[columnaBD] ? String(reporte[columnaBD]).toLowerCase() : "";
            return valor.includes(valorFiltro);
        });

        paginaActual = 1;
        mostrarReportes(paginaActual);
    }

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

    cargarReportes();

    // 🟢 Agregar reporte desde BroadcastChannel o frontend en tiempo real
    window.agregarReporteAHistorial = function (nuevoReporte) {
        if (!nuevoReporte || !nuevoReporte.FolioReportes || !nuevoReporte.FechaRegistro || !nuevoReporte.NumeroNomina) {
            console.warn("❌ Reporte recibido incompleto:", nuevoReporte);
            return;
        }

        datosReportes.unshift(nuevoReporte);
        datosFiltrados = [...datosReportes];
        mostrarReportes(1);

        // ✨ Efecto visual en la primera fila
        const primeraFila = tablaBody.querySelector("tr");
        if (primeraFila) {
            primeraFila.classList.add("nueva-fila");
            setTimeout(() => {
                primeraFila.classList.remove("nueva-fila");
            }, 2000);
        }
    };

    // ✅ Listener real con fetch al recibir folio
    canal.addEventListener("message", (event) => {
        if (event.data?.tipo === "nuevo-reporte" && event.data.folio) {
            const folioNuevo = event.data.folio;

            fetch(`https://grammermx.com/IvanTest/BuzonQuejas/dao/obteneReportesPorFolio.php?folio=${folioNuevo}`)
                .then(resp => resp.json())
                .then(reporte => {
                    if (reporte && reporte.FolioReportes) {
                        window.agregarReporteAHistorial(reporte);

                        const currentSection = document.querySelector(".main-content .content:not([style*='display: none'])")?.id;
                        if (currentSection !== "historial-reportes") {
                            const badge = document.getElementById("contador-historial");
                            let count = parseInt(localStorage.getItem("contadorHistorial") || "0");
                            count++;
                            badge.textContent = count.toString();
                            badge.style.display = "inline-block";
                            localStorage.setItem("contadorHistorial", count.toString());
                        }
                    } else {
                        console.warn("❌ No se pudo cargar el reporte por folio:", folioNuevo);
                    }
                })
                .catch(error => {
                    console.error("❌ Error al obtener reporte por folio:", error);
                });
        }
    });
});
