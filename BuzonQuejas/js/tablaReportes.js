document.addEventListener("DOMContentLoaded", function () {
    const canal = new BroadcastChannel("canalReportes");

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
        texto = String(texto ?? ""); // 🔒 asegura que sea string aunque sea null/undefined
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    function obtenerClaseEstado(progreso) {
        switch (parseInt(progreso)) {
            case 100:
                return "green";
            case 75:
                return "blue";
            case 50:
                return "yellow";
            case 25:
                return "red";
            default:
                return "";
        }
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

    function formatearFecha(fechaOriginal) {
        const partes = fechaOriginal.split(" ")[0].split("-");
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`; // DD-MM-YYYY
        }
        return fechaOriginal; // fallback si no tiene formato válido
    }

    function extraerTextoPlano(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    }

    function mostrarReportes(pagina) {
        tablaBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = datosFiltrados.slice(inicio, fin);

        let estatusGuardados = JSON.parse(localStorage.getItem("estatusReportes")) || {};
        const columnaActiva = filterColumn.value;
        const valorFiltro = filterInput.value;

        reportesPagina.forEach(reporte => {
            let encargadoTexto = reporte.Encargado || reporte.encargado || "N/A";
            let folio = reporte.FolioReportes || reporte.folio || "S/F";

            let estatus = estatusGuardados[folio];
            let progresoManual = estatus ? estatus.progresoManual : null;
            let colorManual = estatus ? estatus.colorManual : null;

            let estadoClase;
            if (colorManual) {
                let mapaColores = { G: "green", B: "blue", Y: "yellow", R: "red" };
                estadoClase = mapaColores[colorManual] || obtenerClaseEstado(progresoManual);
            } else {
                estadoClase = obtenerClaseEstado(progresoManual);
            }

            const porcentajeTexto = progresoManual !== null ? `${progresoManual}%` : "Ver Estatus";
            const esCirculo = progresoManual !== null;
            const color = estadoClase || "white";

            const botonEstatusHTML = `
            <button class="ver-estatus-btn ${estadoClase}" data-folio="${folio}"
                style="
                    ${esCirculo ? `
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        background-color: ${color};
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                        text-shadow: 2px 2px 0 black;
                        border: 3px solid black;
                        margin: auto;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ` : `
                        background: white;
                        color: black;
                        border: 2px solid black;
                        font-weight: bold;
                        padding: 4px 10px;
                        margin: auto;
                    `}
                ">
                ${porcentajeTexto}
            </button>
        `;

            // 🧼 Limpieza de HTML embebido en Encargado
            let partes = encargadoTexto.split("<br>");
            let supervisorText = extraerTextoPlano(partes[0] || "SUPERVISOR: N/A");
            let shiftLeaderText = extraerTextoPlano(partes[1] || "SHIFT LEADER: N/A");

            if (columnaActiva === "encargado") {
                supervisorText = resaltarTexto(supervisorText, valorFiltro);
                shiftLeaderText = resaltarTexto(shiftLeaderText, valorFiltro);
            }

            const fila = document.createElement("tr");
            fila.innerHTML = `
            <td>${columnaActiva === "folio" ? resaltarTexto(folio, valorFiltro) : folio}</td>
            <td>${columnaActiva === "fechaRegistro" ? resaltarTexto(formatearFecha(reporte.FechaRegistro || "Sin fecha"), valorFiltro) : formatearFecha(reporte.FechaRegistro || "Sin fecha")}</td>
            <td>${columnaActiva === "nomina" ? resaltarTexto(reporte.NumeroNomina || "Sin nómina", valorFiltro) : (reporte.NumeroNomina || "Sin nómina")}</td>
            <td>${reporte.Area || "Sin área"}</td>
            <td class="celda-encargado">
                ${supervisorText}<br>${shiftLeaderText}
            </td>
            <td><button class="mostrar-descripcion" data-descripcion="${reporte.Descripcion || 'Sin descripción'}">Mostrar Descripción</button></td>
            <td><button class="agregar-comentario" data-folio="${folio}">Agregar Comentario</button></td>
            <td class="estatus-cell">${botonEstatusHTML}</td>
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
            let valor = reporte[columnaBD] ?? "";

            // Si es FechaRegistro, filtrar usando la fecha formateada
            if (columnaBD === "FechaRegistro") {
                valor = formatearFecha(valor);
            }

            return String(valor).toLowerCase().includes(valorFiltro);
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

    window.agregarReporteAHistorial = function (nuevoReporte) {
        if (!nuevoReporte || !nuevoReporte.FolioReportes || !nuevoReporte.FechaRegistro || !nuevoReporte.NumeroNomina) {
            console.warn("❌ Reporte recibido incompleto:", nuevoReporte);
            return;
        }

        datosReportes.push(nuevoReporte);
        datosReportes.sort((a, b) => new Date(b.FechaRegistro) - new Date(a.FechaRegistro));
        filtrarReportes();


        const primeraFila = tablaBody.querySelector("tr");
        if (primeraFila) {
            primeraFila.classList.add("nueva-fila");
            setTimeout(() => {
                primeraFila.classList.remove("nueva-fila");
            }, 2000);
        }
    };

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
