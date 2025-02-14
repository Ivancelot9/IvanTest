document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");
    const hero = document.querySelector(".hero-animation");

    let animationInProgress = false; // 🔒 Evita interrupciones en la animación

    toggleBtn.addEventListener("click", function () {
        if (animationInProgress) return;
        animationInProgress = true;

        // 🔄 Reiniciar la animación eliminando todas las clases activas antes de iniciar
        hero.classList.remove("hero-fly-left", "hero-fly-left-end", "hero-fly-right", "hero-fly-right-end");
        hero.style.opacity = "1";
        hero.style.transform = "scale(1)";

        void hero.offsetWidth; // 🔥 Truco para reiniciar la animación correctamente

        if (sidebar.classList.contains("hidden")) {
            // 🟢 Mostrar sidebar y animar el héroe de IZQUIERDA → DERECHA
            hero.style.transform = "rotateY(0deg) scale(1)";
            hero.classList.add("hero-fly-right");

            setTimeout(() => {
                hero.style.transform = "rotateY(0deg) scale(1.5)";
                hero.classList.add("hero-fly-right-end");
            }, 100);

            sidebar.classList.remove("hidden");

            setTimeout(() => {
                hero.style.opacity = "0";
                animationInProgress = false;
            }, 1500);

            // 🔹 Cambiar icono del botón
            toggleBtn.innerHTML = "☰";

        } else {
            // 🔵 Ocultar sidebar y animar el héroe de DERECHA → IZQUIERDA
            hero.style.transform = "rotateY(180deg) scale(1)";
            hero.classList.add("hero-fly-left");

            setTimeout(() => {
                hero.style.transform = "rotateY(180deg) scale(1.5)";
                hero.classList.add("hero-fly-left-end");
            }, 100);

            setTimeout(() => {
                sidebar.classList.add("hidden");
            }, 200);

            setTimeout(() => {
                hero.style.opacity = "0";
                animationInProgress = false;
            }, 1500);

            // 🔹 Cambiar icono del botón
            toggleBtn.innerHTML = "❯";
        }
    });
});
