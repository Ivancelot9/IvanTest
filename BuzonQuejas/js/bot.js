// js/bot.js

document.addEventListener("DOMContentLoaded", function () {
    const bot          = document.getElementById("bot");
    const botSprite    = document.getElementById("botSprite");
    const dialogo      = document.getElementById("dialogo");
    const btnAyuda     = document.getElementById("btnAyuda");
    const tabs         = document.querySelectorAll(".tab-item");
    const btnSiguiente = document.getElementById("btnSiguiente");

    // ─── Configuración de escala ─────────────────────────────────
    const scale = 0.3;      // ← ajusta este valor (0.5 = 50 %, 0.3 = 30 %, etc.)
    let totalFrames;        // número de cuadros en Heroher.png
    let frameWidth;         // ancho de cada cuadro (px)
    let frameIndex = 0;     // índice del cuadro actual

    // 1) Carga la imagen para medir dimensiones
    const spriteSheet = new Image();
    spriteSheet.src = "imagenes/Heroher.png";
    spriteSheet.onload = () => {
        const sheetW = spriteSheet.width;   // ancho total (p.e. 1536px)
        const sheetH = spriteSheet.height;  // alto total (p.e. 1024px)

        totalFrames = 3;                    // ajusta si cambias nº de cuadros
        frameWidth  = sheetW / totalFrames; // p.e. 1536 / 3 = 512px

        // 2) Calcula tamaño escalado
        const sw = sheetW * scale;          // ancho total escalado
        const sh = sheetH * scale;          // alto total escalado
        const fw = frameWidth * scale;      // ancho de un frame escalado
        const fh = sheetH * scale;          // alto de un frame escalado

        // 3) Aplica dimensiones escaladas al contenedor
        botSprite.style.width          = `${fw}px`;
        botSprite.style.height         = `${fh}px`;
        botSprite.style.background     = `url("imagenes/Heroher.png") no-repeat 0 0`;
        botSprite.style.backgroundSize = `${sw}px ${sh}px`;

        // 4) Inicia la animación
        setInterval(animarBot, 200);
    };

    function animarBot() {
        const offsetX = -frameWidth * frameIndex * scale;
        botSprite.style.backgroundPosition = `${offsetX}px 0`;
        frameIndex = (frameIndex + 1) % totalFrames;
    }

    // ─── Funciones de parpadeo ───────────────────────────────────
    function iniciarParpadeo() {
        tabs.forEach(tab => tab.classList.add("glowing"));
    }
    function detenerParpadeo() {
        tabs.forEach(tab => tab.classList.remove("glowing"));
    }

    // ─── Manejador de "Siguiente" ───────────────────────────────
    let pasoActual = 0;
    btnSiguiente.addEventListener("click", () => {
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

    // ─── Clic en pestañas ────────────────────────────────────────
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            detenerParpadeo();
            bot.classList.add("hidden");
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
        });
    });

    // ─── Botón "?" ──────────────────────────────────────────────
    btnAyuda.addEventListener("click", () => {
        bot.classList.remove("hidden");
        dialogo.classList.remove("hidden");
        btnAyuda.classList.add("hidden");
        iniciarParpadeo();
    });
});
