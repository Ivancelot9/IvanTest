/* --- JS: js/bot.js --- */

/**
 * @file bot.js
 * @description
 * Controla la animación de dos bots mediante sprites, gestiona el parpadeo de pestañas
 * y alterna la visualización de los elementos de diálogo y ayuda al navegar entre pasos.
 *
 * Requiere:
 *  - Un elemento con id="bot" y su <img> interna con id="botSprite"
 *  - Un elemento con id="bot2" y su <img> interna con id="botSprite2"
 *  - Un contenedor de diálogo con id="dialogo"
 *  - Un botón de ayuda con id="btnAyuda"
 *  - Un conjunto de pestañas con clase ".tab-item"
 *  - Un botón "Siguiente" con id="btnSiguiente"
 *
 * Uso:
 *  Incluye este script tras tu HTML y asegúrate de que los elementos referenciados existan.
 */

document.addEventListener("DOMContentLoaded", function () {
    // 🔹 Elementos principales
    const bot          = document.getElementById("bot");          // Contenedor bot 1
    const botSprite    = document.getElementById("botSprite");    // <img> de bot 1
    const bot2         = document.getElementById("bot2");         // Contenedor bot 2
    const botSprite2   = document.getElementById("botSprite2");   // <img> de bot 2
    const dialogo      = document.getElementById("dialogo");      // Contenedor de diálogo
    const btnAyuda     = document.getElementById("btnAyuda");     // Botón "Ayuda"
    const tabs         = document.querySelectorAll(".tab-item");  // Lista de pestañas
    const btnSiguiente = document.getElementById("btnSiguiente"); // Botón "Siguiente"

    // 🔹 Intervalo de animación de sprites (ms)
    const frameInterval = 500;

    // ─── Animación del primer bot ─────────────────────────────────────
    const spriteFrames = [
        "imagenes/Heroher11.png",
        "imagenes/Heroher2.png",
        "imagenes/Heroher3.png"
    ];
    let frameIndex = 0;
    function animarBot() {
        botSprite.src = spriteFrames[frameIndex];
        frameIndex = (frameIndex + 1) % spriteFrames.length;
    }
    setInterval(animarBot, frameInterval);

    // ─── Animación del segundo bot ────────────────────────────────────
    const spriteFrames2 = [
        "imagenes/had1.png",
        "imagenes/had2.png"
    ];
    let frameIndex2 = 0;
    function animarBot2() {
        botSprite2.src = spriteFrames2[frameIndex2];
        frameIndex2 = (frameIndex2 + 1) % spriteFrames2.length;
    }
    setInterval(animarBot2, frameInterval);

    // ─── Funciones para parpadeo de pestañas ──────────────────────────
    function iniciarParpadeo() {
        tabs.forEach(tab => tab.classList.add("glowing"));
    }
    function detenerParpadeo() {
        tabs.forEach(tab => tab.classList.remove("glowing"));
    }

    // ─── Lógica del botón "Siguiente" ────────────────────────────────
    let pasoActual = 0;
    btnSiguiente.addEventListener("click", () => {
        pasoActual++;
        if (pasoActual === 1) {
            // Primer clic: mostrar bots y diálogo, ocultar ayuda
            [bot, bot2].forEach(el => el.classList.remove("hidden"));
            dialogo.classList.remove("hidden");
            btnAyuda.classList.add("hidden");
            iniciarParpadeo();
        } else {
            // Segundo clic: ocultar bots y diálogo, volver a mostrar ayuda
            [bot, bot2].forEach(el => el.classList.add("hidden"));
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
            detenerParpadeo();
        }
    });

    // ─── Reset al hacer clic en cualquier pestaña ───────────────────────
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            [bot, bot2].forEach(el => el.classList.add("hidden"));
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
            detenerParpadeo();
            pasoActual = 0; // Reinicia el contador de pasos
        });
    });

    // ─── Botón de ayuda ───────────────────────────────────────────────
    btnAyuda.addEventListener("click", () => {
        [bot, bot2].forEach(el => el.classList.remove("hidden"));
        dialogo.classList.remove("hidden");
        btnAyuda.classList.add("hidden");
        iniciarParpadeo();
        pasoActual = 1; // Ajusta pasoActual para sincronizar con "Siguiente"
    });
});
