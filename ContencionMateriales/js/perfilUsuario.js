document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById('userDropdownToggle');
    const panel = document.getElementById('userDropdownPanel');
    const avatars = document.querySelectorAll(".avatar-option");
    const currentAvatarMini = document.getElementById("currentAvatarMini");
    const currentAvatarLarge = document.getElementById("currentAvatarLarge");

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
            // Visualmente marcarlo
            avatars.forEach(a => a.classList.remove("selected"));
            avatar.classList.add("selected");

            // Cambiar mini y grande
            currentAvatarMini.src = "uploads/avatars/" + avatar.dataset.avatar;
            currentAvatarLarge.src = "uploads/avatars/" + avatar.dataset.avatar;

            // (Opcional) enviar al backend con AJAX
            // saveAvatarToServer(avatar.dataset.avatar);
        });
    });

    // Función AJAX opcional para guardar en servidor
    function saveAvatarToServer(filename) {
        fetch('guardarAvatar.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ avatar: filename })
        })
            .then(res => res.json())
            .then(data => {
                console.log("Avatar actualizado:", data);
            })
            .catch(err => console.error("Error al guardar avatar:", err));
    }
});