// js/notificacionesCasos.js
document.addEventListener('DOMContentLoaded', () => {
    const canal = new BroadcastChannel('casosChannel');
    const btnMisCasos = document.getElementById('btn-mis-casos');
    const badge = btnMisCasos.querySelector('.badge-count');

    // 1) Inicializar contador desde localStorage (si quieres persistir entre recargas)
    let contador = parseInt(localStorage.getItem('newCasesCount') || '0', 10);
    actualizarBadge(contador);

    // 2) Escuchar nuevos casos en tiempo real
    canal.addEventListener('message', ({data}) => {
        if (data.type === 'new-case') {
            contador++;
            localStorage.setItem('newCasesCount', contador);
            actualizarBadge(contador);
        }
    });

    // 3) Al hacer clic en “Mis casos”, resetear el contador
    btnMisCasos.addEventListener('click', () => {
        contador = 0;
        localStorage.setItem('newCasesCount', '0');
        actualizarBadge(contador);
        // Aquí tu lógica de mostrar la sección #historial...
    });

    // Función helper
    function actualizarBadge(count) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
});
