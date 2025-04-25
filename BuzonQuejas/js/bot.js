// js/bot.js

document.addEventListener("DOMContentLoaded", function () {
    const bot        = document.getElementById("bot");
    const botSprite  = document.getElementById("botSprite");
    const dialogo    = document.getElementById("dialogo");
    const btnAyuda   = document.getElementById("btnAyuda");
    const tabs       = document.querySelectorAll(".tab-item");
    const btnSiguiente = document.getElementById("btnSiguiente");

    // ─── Variables para el sprite sheet ─────────────────────────
    let pasoActual  = 0;      // controla el paso/pestaña actual
    let totalFrames;         // número de cuadros en Heroher.png
    let frameWidth;          // ancho de cada cuadro (px)
    let frameIndex = 0;      // índice del cuadro actual

    // 1) Cargamos la imagen para medir sus dimensiones
    const spriteSheet = new Image();
    spriteSheet.src = "imagenes/Heroher.png";
    spriteSheet.onload = () => {
        const sheetW = spriteSheet.width;   // ancho total, p.e. 1536px
        const sheetH = spriteSheet.height;  // alto total, p.e. 1024px

        totalFrames = 3;                    // ajusta si añades/quitas cuadros
        frameWidth  = sheetW / totalFrames; // p.e. 1536 / 3 = 512px

        // 2) Ajustamos el <div> al tamaño de un solo cuadro
        botSprite.style.width        = `${frameWidth}px`;
        botSprite.style.height       = `${sheetH}px`;

        // 3) Configuramos el fondo como sprite sheet
        botSprite.style.background       = `url("imagenes/Heroher.png") no-repeat 0 0`;
        botSprite.style.backgroundSize   = `${sheetW}px ${sheetH}px`;

        // 4) Iniciamos la animación cada 200 ms
        setInterval(animarBot, 200);
    };

    function animarBot() {
        // Desplaza el background según el índice de cuadro
        const offsetX = -frameWidth * frameIndex;
        botSprite.style.backgroundPosition = `${offsetX}px 0`;

        frameIndex = (frameIndex + 1) % totalFrames;
    }

    // ─── Funciones para el parpadeo de pestañas ─────────────────
    function iniciarParpadeo() {
        tabs.forEach(tab => tab.classList.add("glowing"));
    }
    function detenerParpadeo() {
        tabs.forEach(tab => tab.classList.remove("glowing"));
    }

    // ─── Manejador de "Siguiente" ───────────────────────────────
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

    // ─── Clic en pestañas: detener parpadeo y ocultar bot ───────
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            detenerParpadeo();
            bot.classList.add("hidden");
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
        });
    });

    // ─── Botón "?" vuelve a mostrar bot y parpadeo ──────────────
    btnAyuda.addEventListener("click", function () {
        bot.classList.remove("hidden");
        dialogo.classList.remove("hidden");
        btnAyuda.classList.add("hidden");
        iniciarParpadeo();
    });
});
