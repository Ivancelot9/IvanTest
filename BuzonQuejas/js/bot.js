document.addEventListener("DOMContentLoaded", function () {
    const bot = document.getElementById("bot");
    const botSprite = document.getElementById("botSprite");
    const dialogo = document.getElementById("dialogo");
    const btnAyuda = document.getElementById("btnAyuda");
    const tabs = document.querySelectorAll(".tab-item");
    const btnSiguiente = document.getElementById("btnSiguiente");

    // 🔹 Sprites para animación del bot
    const spriteFrames = [
        "imagenes/gatilloMamon1.png",
        "imagenes/gatilloMamon2.png",
        "imagenes/gatilloMamon3.png"
    ];
    let frameIndex = 0;

    function animarBot() {
        botSprite.src = spriteFrames[frameIndex]; // 🔹 Cambia la imagen del bot
        frameIndex = (frameIndex + 1) % spriteFrames.length;
    }

    // 🔹 Inicia la animación del bot cada 200ms
    setInterval(animarBot, 200);

    let pasoActual = 0; // 🔹 Control de la pestaña actual

    function iniciarParpadeo() {
        tabs.forEach(tab => tab.classList.add("glowing"));
    }

    function detenerParpadeo() {
        tabs.forEach(tab => tab.classList.remove("glowing"));
    }

    // 🔹 Manejador de botón "Siguiente"
    btnSiguiente.addEventListener("click", function () {
        pasoActual++;

        if (pasoActual === 1) {
            // 🔹 Cuando pasamos a la pestaña "Área", mostramos el bot y el diálogo
            bot.classList.remove("hidden");
            dialogo.classList.remove("hidden");
            btnAyuda.classList.add("hidden"); // 🔹 Ocultamos el botón de ayuda

            // 🔹 Iniciar el parpadeo infinito de las pestañas
            iniciarParpadeo();
        } else {
            // 🔹 Si avanza a la siguiente pestaña, detener el parpadeo y mostrar el botón "?"
            detenerParpadeo();
            bot.classList.add("hidden");
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
        }
    });

    // 🔹 Si el usuario hace clic en cualquier pestaña, detener el parpadeo y ocultar el bot
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            detenerParpadeo();
            bot.classList.add("hidden");
            dialogo.classList.add("hidden");
            btnAyuda.classList.remove("hidden");
        });
    });

    // 🔹 Cuando el usuario presiona el botón "?", vuelve a mostrar el bot y el parpadeo
    btnAyuda.addEventListener("click", function () {
        bot.classList.remove("hidden");
        dialogo.classList.remove("hidden");
        btnAyuda.classList.add("hidden"); // 🔹 Ocultamos el botón "?" al mostrar el bot

        // 🔹 Reiniciamos el parpadeo de las pestañas
        iniciarParpadeo();
    });
});
