document.addEventListener("DOMContentLoaded", function () {
    const bot = document.getElementById("bot");
    const botSprite = document.getElementById("botSprite");
    const dialogo = document.getElementById("dialogo");
    const btnAyuda = document.getElementById("btnAyuda");
    const tabs = document.querySelectorAll(".tab-item");
    const btnSiguiente = document.getElementById("btnSiguiente");

    // 🔹 Configuración del sprite sheet
    const totalFrames = 3;       // número de cuadros en Heroher.png
    const frameWidth  = 180;     // ancho de cada cuadro en px
    let frameIndex = 0;

    function animarBot() {
        // calculamos el desplazamiento horizontal
        const offsetX = -frameWidth * frameIndex;
        botSprite.style.backgroundPosition = `${offsetX}px 0`;
        frameIndex = (frameIndex + 1) % totalFrames;
    }

    // 🔹 Inicia la animación cada 200 ms
    setInterval(animarBot, 200);

    let pasoActual = 0; // controla en qué paso/pestaña estamos

    function iniciarParpadeo() {
        tabs.forEach(tab => tab.classList.add("glowing"));
    }

    function detenerParpadeo() {
        tabs.forEach(tab => tab.classList.remove("glowing"));
    }

    // 🔹 Botón "Siguiente"
    btnSiguiente.addEventListener("click", function () {
        pasoActual++;
        if (pasoActual === 1) {
            bot.classList.remove("hidden");
            dialogo.classList.remove("hidden");
            btnAyuda.classList.add("hidden");
            iniciarParpadeo();
        } else {
            detenerParpadeo();
            bot.classList.add("hidden");
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
        }
    });

    // 🔹 Clic en cualquier pestaña detiene parpadeo y oculta bot
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            detenerParpadeo();
            bot.classList.add("hidden");
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
        });
    });

    // 🔹 Botón "?" vuelve a mostrar bot + parpadeo
    btnAyuda.addEventListener("click", function () {
        bot.classList.remove("hidden");
        dialogo.classList.remove("hidden");
        btnAyuda.classList.add("hidden");
        iniciarParpadeo();
    });
});
