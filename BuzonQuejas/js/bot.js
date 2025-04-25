/* --- JS: js/bot.js --- */
document.addEventListener("DOMContentLoaded", function () {
    const bot          = document.getElementById("bot");
    const botSprite    = document.getElementById("botSprite");
    const bot2         = document.getElementById("bot2");
    const botSprite2   = document.getElementById("botSprite2");
    const dialogo      = document.getElementById("dialogo");
    const btnAyuda     = document.getElementById("btnAyuda");
    const tabs         = document.querySelectorAll(".tab-item");
    const btnSiguiente = document.getElementById("btnSiguiente");

    // Sprites primer bot
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
    setInterval(animarBot, 200);

    // Sprites segundo bot
    const spriteFrames2 = [
        "imagenes/had1.png",
        "imagenes/had2.png"
    ];
    let frameIndex2 = 0;
    function animarBot2() {
        botSprite2.src = spriteFrames2[frameIndex2];
        frameIndex2 = (frameIndex2 + 1) % spriteFrames2.length;
    }
    setInterval(animarBot2, 200);

    // Funciones de parpadeo
    function iniciarParpadeo() {
        tabs.forEach(tab => tab.classList.add("glowing"));
    }
    function detenerParpadeo() {
        tabs.forEach(tab => tab.classList.remove("glowing"));
    }

    // Manejador de "Siguiente"
    let pasoActual = 0;
    btnSiguiente.addEventListener("click", () => {
        pasoActual++;
        if (pasoActual === 1) {
            [bot, bot2].forEach(el => el.classList.remove("hidden"));
            dialogo.classList.remove("hidden");
            btnAyuda.classList.add("hidden");
            iniciarParpadeo();
        } else {
            [bot, bot2].forEach(el => el.classList.add("hidden"));
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
            detenerParpadeo();
        }
    });

    // Clic en pestañas
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            [bot, bot2].forEach(el => el.classList.add("hidden"));
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
            detenerParpadeo();
        });
    });

    // Botón de ayuda
    btnAyuda.addEventListener("click", () => {
        [bot, bot2].forEach(el => el.classList.remove("hidden"));
        dialogo.classList.remove("hidden");
        btnAyuda.classList.add("hidden");
        iniciarParpadeo();
    });
});