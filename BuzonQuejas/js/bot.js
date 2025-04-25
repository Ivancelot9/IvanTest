// js/bot.js

document.addEventListener("DOMContentLoaded", function () {
    const bot          = document.getElementById("bot");
    const botSprite    = document.getElementById("botSprite");
    const dialogo      = document.getElementById("dialogo");
    const btnAyuda     = document.getElementById("btnAyuda");
    const tabs         = document.querySelectorAll(".tab-item");
    const btnSiguiente = document.getElementById("btnSiguiente");

    // 🔹 Sprites para animación del bot (3 imágenes separadas)
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

    // 🔹 Inicia la animación cada 200 ms
    setInterval(animarBot, 200);

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
