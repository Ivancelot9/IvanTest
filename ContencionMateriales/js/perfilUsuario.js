document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById('userDropdownToggle');
    const panel = document.getElementById('userDropdownPanel');
    const avatars = document.querySelectorAll(".avatar-option");
    const currentAvatarMini = document.getElementById("currentAvatarMini");
    const currentAvatarLarge = document.getElementById("currentAvatarLarge");

    // Recuperar el avatar guardado en localStorage (si existe)
    const savedAvatar = localStorage.getItem("avatarSeleccionado");
    if (savedAvatar) {
        currentAvatarMini.src = savedAvatar;
        currentAvatarLarge.src = savedAvatar;
    }

    // Abrir/cerrar panel
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target)) {
            panel.style.display = 'none';
        }
    });

    // Manejar selección de avatar
    avatars.forEach(avatar => {
        avatar.addEventListener("click", () => {
            avatars.forEach(a => a.classList.remove("selected"));
            avatar.classList.add("selected");

            const ruta = avatar.getAttribute('src');

            currentAvatarMini.src = ruta;
            currentAvatarLarge.src = ruta;

            // Guardar en localStorage
            localStorage.setItem("avatarSeleccionado", ruta);
        });
    });
});
