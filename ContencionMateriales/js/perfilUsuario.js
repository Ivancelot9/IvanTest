document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById('userDropdownToggle');
    const panel = document.getElementById('userDropdownPanel');
    const avatars = document.querySelectorAll(".avatar-option");
    const currentAvatarMini = document.getElementById("currentAvatarMini");
    const currentAvatarLarge = document.getElementById("currentAvatarLarge");
    const inputFile = document.getElementById("customAvatarInput");

    // Recuperar del localStorage si hay uno guardado
    const savedAvatar = localStorage.getItem("avatarSeleccionado");
    if (savedAvatar) {
        currentAvatarMini.src = savedAvatar;
        currentAvatarLarge.src = savedAvatar;
    }

    // Toggle del panel
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target)) {
            panel.style.display = 'none';
        }
    });

    // Cambio de avatar al hacer clic
    avatars.forEach(avatar => {
        avatar.addEventListener("click", () => {
            avatars.forEach(a => a.classList.remove("selected"));
            avatar.classList.add("selected");

            const ruta = avatar.getAttribute('src');
            currentAvatarMini.src = ruta;
            currentAvatarLarge.src = ruta;
            localStorage.setItem("avatarSeleccionado", ruta);
        });
    });

    // Carga de foto personalizadas
    inputFile.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageSrc = e.target.result;
            currentAvatarMini.src = imageSrc;
            currentAvatarLarge.src = imageSrc;
            localStorage.setItem("avatarSeleccionado", imageSrc);
        };
        reader.readAsDataURL(file);
    });

    // Visor al hacer clic en la imagen grande
    currentAvatarLarge.addEventListener("click", () => {
        const lightbox = document.getElementById("avatarLightbox");
        const zoomImg = document.getElementById("avatarZoom");
        zoomImg.src = currentAvatarLarge.src;
        lightbox.style.display = "flex";
    });

    document.querySelector(".close-avatar").addEventListener("click", () => {
        document.getElementById("avatarLightbox").style.display = "none";
    });
});