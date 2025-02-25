document.addEventListener("DOMContentLoaded", function () {
    const datosReportes = [
        {
            folio: "001",
            nomina: "123456",
            encargado: "Juan Pérez",
            fechaRegistro: "10/02/2025",
            fechaFinalizacion: "-",
            descripcion: "El sistema de autenticación presenta un problema crítico.",
            estatus: "Pendiente"
        },
        {
            folio: "002",
            nomina: "654321",
            encargado: "María López",
            fechaRegistro: "11/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Error en la base de datos",
            estatus: "Pendiente"
        },
        {
            folio: "003",
            nomina: "789654",
            encargado: "Carlos García",
            fechaRegistro: "12/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Actualización del sistema completada",
            estatus: "Pendiente"
        },
        {
            folio: "004",
            nomina: "111222",
            encargado: "Laura Torres",
            fechaRegistro: "13/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Fallo en la conexión con el servidor",
            estatus: "Pendiente"
        },
        {
            folio: "005",
            nomina: "333444",
            encargado: "Diego Mendoza",
            fechaRegistro: "14/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Actualización del sistema operativo",
            estatus: "Pendiente"
        },
        {
            folio: "006",
            nomina: "555666",
            encargado: "Sofía Ramírez",
            fechaRegistro: "15/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Implementación de nuevo software",
            estatus: "Pendiente"
        },
        {
            folio: "007",
            nomina: "777888",
            encargado: "Ricardo Pérez",
            fechaRegistro: "16/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Revisión de seguridad en la red",
            estatus: "Pendiente"
        },
        {
            folio: "008",
            nomina: "999000",
            encargado: "Fernanda López",
            fechaRegistro: "17/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Optimización de base de datos",
            estatus: "Pendiente"
        },
        {
            folio: "009",
            nomina: "222333",
            encargado: "Andrés Salgado",
            fechaRegistro: "18/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Corrección de errores en frontend",
            estatus: "Pendiente"
        },
        {
            folio: "010",
            nomina: "444555",
            encargado: "Gabriela Márquez",
            fechaRegistro: "19/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Mejora en la experiencia del usuario",
            estatus: "Pendiente"
        },
        {
            folio: "011",
            nomina: "666777",
            encargado: "Miguel Ángel López",
            fechaRegistro: "20/02/2025",
            fechaFinalizacion: "-",
            descripcion: "Prueba con el reporte número 11",
            estatus: "Pendiente"
        }
    ];

    const filasPorPagina = 10;
    let paginaActual = 1;
    let datosFiltrados = [...datosReportes];

    // ✅ Elementos del DOM
    const tablaBody = document.getElementById("tabla-body");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageIndicator = document.getElementById("pageIndicator");
    const filterColumn = document.getElementById("filter-column");
    const filterInput = document.getElementById("filter-input");
    const filterButton = document.getElementById("filter-button");

    // ✅ Función para resaltar el texto que coincide con el filtro
    function resaltarTexto(texto, filtro) {
        if (!filtro || filtro.trim() === "") return texto;
        const regex = new RegExp(`(${filtro})`, "gi");
        return texto.replace(regex, `<span class="highlight">$1</span>`);
    }

    // ✅ Mostrar reportes
    function mostrarReportes(pagina, reportes = datosFiltrados) {
        tablaBody.innerHTML = "";
        const inicio = (pagina - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const reportesPagina = reportes.slice(inicio, fin);

        const valorFiltro = filterInput.value.toLowerCase();
        const columnaSeleccionada = filterColumn.value;

        reportesPagina.forEach(reporte => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${columnaSeleccionada === "folio" ? resaltarTexto(reporte.folio, valorFiltro) : reporte.folio}</td>
                <td>${columnaSeleccionada === "fechaRegistro" ? resaltarTexto(reporte.fechaRegistro, valorFiltro) : reporte.fechaRegistro}</td>
                <td>${columnaSeleccionada === "nomina" ? resaltarTexto(reporte.nomina, valorFiltro) : reporte.nomina}</td>
                <td>${columnaSeleccionada === "encargado" ? resaltarTexto(reporte.encargado, valorFiltro) : reporte.encargado}</td>
                <td><button class="mostrar-descripcion" data-descripcion="${reporte.descripcion}">Mostrar Descripción</button></td>
                <td><button class="agregar-comentario" data-folio="${reporte.folio}">Agregar Comentario</button></td>
                <td class="estatus-cell"><strong>${columnaSeleccionada === "estatus" ? resaltarTexto(reporte.estatus, valorFiltro) : reporte.estatus}</strong></td>
                <td><button class="seleccionar-fecha" data-folio="${reporte.folio}">Finalizar Reporte</button></td>
            `;
            tablaBody.appendChild(fila);
        });

        pageIndicator.textContent = `Página ${pagina}`;
        prevPageBtn.disabled = pagina === 1;
        nextPageBtn.disabled = fin >= reportes.length;

        initEstatusEditor();
    }

    // ✅ Filtrado de reportes
    function filtrarReportes() {
        const valorFiltro = filterInput.value.toLowerCase();
        const columna = filterColumn.value;

        datosFiltrados = datosReportes.filter(reporte => {
            return reporte[columna].toLowerCase().includes(valorFiltro);
        });

        paginaActual = 1;
        mostrarReportes(paginaActual);
    }

    // ✅ Exponer funciones globalmente para usarlas desde otros scripts
    window.getReportePorFolio = function (folio) {
        return datosReportes.find(r => r.folio === folio);
    };

    // ✅ Eliminar el reporte y actualizar la tabla
    window.eliminarReportePorFolio = function (folio) {
        const index = datosReportes.findIndex(r => r.folio === folio);
        if (index !== -1) {
            datosReportes.splice(index, 1);
            filtrarReportes();
        }
    };

    // ✅ Eventos de navegación de página
    prevPageBtn.addEventListener("click", () => {
        paginaActual--;
        mostrarReportes(paginaActual);
    });

    nextPageBtn.addEventListener("click", () => {
        paginaActual++;
        mostrarReportes(paginaActual);
    });

    // ✅ Evento para filtrar reportes
    filterInput.addEventListener("input", filtrarReportes);
    filterButton.addEventListener("click", filtrarReportes);

    // ✅ Mostrar reportes al cargar
    mostrarReportes(paginaActual);
});
