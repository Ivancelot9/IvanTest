/* --- JS: js/tablaReportesCompletos.js --- */
/**
 * @file tablaReportesCompletos.js
 * @description
 * Gestión de reportes COMPLETADOS:
 *  – Filtro por texto y rango de fechas
 *  – Paginación y resaltado dinámico
 *  – Exportar reporte individual a Excel
 *  – Recibe notificaciones de tablaReportes.js mediante
 *    window.moverReporteACompletados(reporte, notificar)
 *
 * Requiere:
 *  – <body data-user-id="..."> para identificar usuario
 *  – Elementos en el DOM con IDs:
 *      • #tabla-completos-body, #prevPage-completo, #nextPage-completo
 *      • #pageIndicator-completo, #filter-column-completo
 *      • #filter-input-completo, #filter-button-completo
 *      • #start-date, #end-date, #filter-date-button, #clear-date-button
 *  – Funciones y librerías externas:
 *      • XLSX (SheetJS) para exportar Excel
 *      • SweetAlert2 (Swal) para alertas
 *      • flatpickr para datepickers
 */
document.addEventListener("DOMContentLoaded", function () {

    /* ────────────────────────────────────────────────
       1.  Variables y elementos
    ──────────────────────────────────────────────── */
    const userId  = document.body.getAttribute("data-user-id") || "default";
    const claveStorageCompletos = `contadorCompletos_${userId}`;

    const tablaCompletosBody   = document.getElementById("tabla-completos-body");
    const prevPageBtnCompleto  = document.getElementById("prevPage-completo");
    const nextPageBtnCompleto  = document.getElementById("nextPage-completo");
    const pageIndicatorCompleto= document.getElementById("pageIndicator-completo");
    const filterColumnCompleto = document.getElementById("filter-column-completo");
    const filterInputCompleto  = document.getElementById("filter-input-completo");
    const filterButtonCompleto = document.getElementById("filter-button-completo");
    const startDateInput       = document.getElementById("start-date");
    const endDateInput         = document.getElementById("end-date");
    const filterDateButton     = document.getElementById("filter-date-button");
    const clearDateButton      = document.getElementById("clear-date-button");

    /* Datos */
    let datosReportesCompletos   = [];
    let datosFiltradosCompletos  = [];
    let paginaActualCompleto     = 1;
    const filasPorPagina         = 10;
    let resaltarFechas           = false;

    /* Mapa columnas */
    const columnasBDCompletos = {
        folio           : "folio",
        nomina          : "nomina",
        encargado       : "encargado",
        fechaFinalizacion: "fechaFinalizacion",
        estatus         : "estatus"
    };

    startDateInput.setAttribute("onkeydown", "return false;");
    endDateInput  .setAttribute("onkeydown", "return false;");

    /* ────────────────────────────────────────────────
       2.  Utilidades
    ──────────────────────────────────────────────── */
    const escapeRegex = t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const resaltarTexto = (txt, f) =>
        (!f||f.trim()==="") ? String(txt??"") : String(txt??"").replace(new RegExp(`(${escapeRegex(f)})`,"gi"),'<span class="highlight">$1</span>');

    const aplicarResaltado = (v,campo,filt,colSel) => colSel===campo?resaltarTexto(v,filt):v;

    const formatearFecha = f=>{
        const p=f.split(" ")[0].split("-");
        return (p.length===3)?`${p[2]}-${p[1]}-${p[0]}`:f;
    };

    const extraerTextoPlano = html=>{
        const d=document.createElement("div"); d.innerHTML=html;
        return d.textContent||d.innerText||"";
    };

    const parseFechaDMY = s=>{
        const p=s.split("/");
        return (p.length===3)?new Date(`${p[2]}-${p[1]}-${p[0]}`):null;
    };

    const limpiarHTMLParaExcel = html=>{
        if(!html) return "N/A";
        const tmp=document.createElement("div");
        html=html.replace(/<br\s*\/?>/gi,"\n");
        tmp.innerHTML=html;
        return tmp.textContent.trim();
    };

    const formatearEncargadoParaVista = txt=>{
        if(!txt) return "N/A";
        return txt.replace(/\n/g,"<br>")
            .replace(/SUPERVISOR:/gi,"<strong>SUPERVISOR:</strong>")
            .replace(/SHIFT LEADER:/gi,"<strong>SHIFT LEADER:</strong>");
    };

    /* Excel */
    function exportarExcel(rep){
        const wb = XLSX.utils.book_new();
        wb.Props = { Title: "Reporte Completado", Author: "Sistema", CreatedDate: new Date() };
        wb.SheetNames.push("Reporte");

        const ws_data = [
            ["Folio","Número de Nómina","Encargado","Fecha Registro","Fecha Finalización","Descripción","Estatus","Comentarios"],
            [
                rep.folio,
                rep.nomina,
                limpiarHTMLParaExcel(rep.encargado),
                formatearFecha(rep.fechaRegistro),
                formatearFecha(rep.fechaFinalizacion),
                rep.descripcion || "-",
                rep.estatus,
                rep.comentarios || "Sin comentarios"
            ]
        ];

        const ws = XLSX.utils.aoa_to_sheet(ws_data);

        // 🔁 Solo tendrá efecto si usas SheetJS Pro
        ["F2", "H2"].forEach(ref => {
            if (ws[ref]) {
                ws[ref].s = {
                    alignment: {
                        wrapText: true,
                        vertical: "top"
                    }
                };
            }
        });

        // Ancho de columnas
        ws["!cols"] = [
            { wch: 15 }, // Folio
            { wch: 20 }, // Nómina
            { wch: 80 }, // Encargado
            { wch: 20 }, // Fecha Registro
            { wch: 20 }, // Fecha Finalización
            { wch: 40 }, // Descripción
            { wch: 15 }, // Estatus
            { wch: 40 }  // Comentarios
        ];

        wb.Sheets["Reporte"] = ws;
        XLSX.writeFile(wb, `Reporte_${rep.folio}.xlsx`, { bookType: "xlsx", cellStyles: true });
    }

    /* ────────────────────────────────────────────────
       3.  Renderizado y paginación
    ──────────────────────────────────────────────── */
    window.mostrarReportesCompletos = function(pag=1){
        const ini=(pag-1)*filasPorPagina, fin=ini+filasPorPagina;
        const lista=datosFiltradosCompletos.slice(ini,fin);
        const filtro=filterInputCompleto.value.toLowerCase();
        const colSel=filterColumnCompleto.value;

        tablaCompletosBody.innerHTML="";

        if(lista.length===0){
            const usandoFecha=startDateInput.value||endDateInput.value;
            const msg=usandoFecha? "❌ No hay reportes en este rango de fechas."
                : "❌ No hay reportes que coincidan con el filtro.";
            tablaCompletosBody.innerHTML=`<tr><td colspan="6" style="color:red;font-weight:bold;">${msg}</td></tr>`;
            return;
        }

        lista.forEach(rep=>{
            const fila=document.createElement("tr");
            fila.innerHTML=`
                <td>${aplicarResaltado(rep.folio,"folio",filtro,colSel)}</td>
                <td>${aplicarResaltado(rep.nomina,"nomina",filtro,colSel)}</td>
                <td>${formatearEncargadoParaVista(aplicarResaltado(rep.encargado,"encargado",filtro,colSel))}</td>
                <td>${aplicarResaltado(formatearFecha(rep.fechaFinalizacion),"fechaFinalizacion",filtro,colSel)}</td>
                <td>${aplicarResaltado(rep.estatus,"estatus",filtro,colSel)}</td>`;
            const btn=document.createElement("button");
            btn.classList.add("convertidor");
            btn.dataset.folio=rep.folio;
            btn.innerHTML=`<i class="fas fa-file-excel"></i> Convertir a Excel`;
            const celda=document.createElement("td");
            celda.appendChild(btn);
            fila.appendChild(celda);
            tablaCompletosBody.appendChild(fila);
        });

        if(resaltarFechas){
            tablaCompletosBody.querySelectorAll("td:nth-child(4)")
                .forEach(c=>c.classList.add("highlight"));
        }

        pageIndicatorCompleto.textContent=`Página ${pag}`;
        prevPageBtnCompleto.disabled=pag===1;
        nextPageBtnCompleto.disabled=fin>=datosFiltradosCompletos.length;
        paginaActualCompleto=pag;
    };

    /* ────────────────────────────────────────────────
       4.  Carga inicial desde backend
    ──────────────────────────────────────────────── */
    function cargarReportesCompletos(){
        fetch("https://grammermx.com/IvanTest/BuzonQuejas/dao/conseguirReportesCompletos.php")
            .then(r=>r.json()).then(data=>{
            datosReportesCompletos=Array.isArray(data)?data:[];
            window.datosReportesCompletos=datosReportesCompletos;
            datosFiltradosCompletos=[...datosReportesCompletos];
            mostrarReportesCompletos(1);
        })
            .catch(e=>console.error("❌ Error al cargar reportes completados:",e));
    }

    /* ────────────────────────────────────────────────
       5.  Filtros
    ──────────────────────────────────────────────── */
    function filtrarReportesCompletos(){
        const f=filterInputCompleto.value.toLowerCase();
        const colSel=filterColumnCompleto.value;
        const colBD =columnasBDCompletos[colSel];
        if(!colBD) return;

        datosFiltradosCompletos=datosReportesCompletos.filter(rep=>{
            let v=rep[colBD]??"";
            if(colBD==="encargado") v=extraerTextoPlano(v);
            if(colBD==="fechaFinalizacion") v=formatearFecha(v);
            return v.toString().toLowerCase().includes(f);
        });

        resaltarFechas=false;
        mostrarReportesCompletos(paginaActualCompleto=1);
    }

    function filtrarPorRangoDeFechas(){
        const start=startDateInput.value?parseFechaDMY(startDateInput.value):null;
        const end  =endDateInput.value  ?parseFechaDMY(endDateInput.value)  :null;
        if(!start&&!end){ Swal.fire("Advertencia","Debes seleccionar al menos una fecha.","warning"); return; }

        datosFiltradosCompletos=datosReportesCompletos.filter(rep=>{
            const fStr=rep.fechaFinalizacion?.split(" ")[0];
            if(!fStr) return false;
            const f=new Date(fStr);
            return start&&end?f>=start&&f<=end : start?f>=start : end?f<=end : false;
        }).sort((a,b)=>new Date(a.fechaFinalizacion)-new Date(b.fechaFinalizacion));

        resaltarFechas=true;
        filterInputCompleto.value="";
        mostrarReportesCompletos(paginaActualCompleto=1);
    }

    function limpiarRangoFechas(){
        startDateInput.value=endDateInput.value="";
        resaltarFechas=false;
        datosFiltradosCompletos=[...datosReportesCompletos];
        mostrarReportesCompletos(paginaActualCompleto=1);
    }

    /* ────────────────────────────────────────────────
       6.  Exportar a Excel
    ──────────────────────────────────────────────── */
    tablaCompletosBody.addEventListener("click",ev=>{
        const btn=ev.target.closest(".convertidor");
        if(!btn) return;
        const folio=btn.dataset.folio;
        const rep=datosReportesCompletos.find(r=>String(r.folio)===String(folio));
        rep?exportarExcel(rep):Swal.fire("Error","No se encontró el reporte.","error");
    });

    /* ────────────────────────────────────────────────
       7.  Eventos UI
    ──────────────────────────────────────────────── */
    prevPageBtnCompleto.addEventListener("click",()=>{
        if(paginaActualCompleto>1) mostrarReportesCompletos(--paginaActualCompleto);
    });
    nextPageBtnCompleto.addEventListener("click",()=>{
        if(paginaActualCompleto*filasPorPagina<datosFiltradosCompletos.length)
            mostrarReportesCompletos(++paginaActualCompleto);
    });

    filterInputCompleto.addEventListener("input",filtrarReportesCompletos);
    filterButtonCompleto.addEventListener("click",filtrarReportesCompletos);
    filterDateButton.addEventListener("click",filtrarPorRangoDeFechas);
    clearDateButton .addEventListener("click",limpiarRangoFechas);

    /* Datepickers */
    flatpickr("#start-date",{dateFormat:"d/m/Y",locale:"es"});
    flatpickr("#end-date"  ,{dateFormat:"d/m/Y",locale:"es"});

    /* ────────────────────────────────────────────────
    8. Función pública para recibir reportes nuevos
       — incluye flag `notificar` y registro de “nuevos completados”
 ──────────────────────────────────────────────── */
    window.moverReporteACompletados = function(nuevoReporte, notificar = true) {
        // 0. Inicializar set global para resaltado
        window.nuevosCompletados = window.nuevosCompletados || new Set();

        // 1. Evitar duplicados
        const yaExiste = datosReportesCompletos.some(r => String(r.folio) === String(nuevoReporte.folio));
        if (yaExiste) return;

        // 2. Agregar a la lista local y exponer globalmente
        datosReportesCompletos.unshift(nuevoReporte);
        datosFiltradosCompletos = [...datosReportesCompletos];
        window.datosReportesCompletos = datosReportesCompletos;
        mostrarReportesCompletos(1);

        // 3. Registrar este folio como “nuevo completado”
        window.nuevosCompletados.add(String(nuevoReporte.folio));

        // 4. Actualizar badge de completados solo si notificar == true
        const badge      = document.getElementById("contador-completos");
        const foliosKey  = `foliosContadosCompletos_${userId}`;
        let foliosCont   = JSON.parse(localStorage.getItem(foliosKey) || "[]");

        if (notificar && !foliosCont.includes(nuevoReporte.folio)) {
            foliosCont.push(nuevoReporte.folio);
            localStorage.setItem(foliosKey, JSON.stringify(foliosCont));

            let count = parseInt(localStorage.getItem(claveStorageCompletos) || "0");
            count++;
            localStorage.setItem(claveStorageCompletos, String(count));

            if (badge) {
                badge.textContent   = String(count);
                badge.style.display = "inline-block";
            }
        }
    };


    /* ────────────────────────────────────────────────
       9.  Arranque
    ──────────────────────────────────────────────── */
    cargarReportesCompletos();
    window.cargarReportesCompletos=cargarReportesCompletos;   // acceso global
});
