/**
 * @file perfilUsuario.js
 * @project Contención de Materiales
 * @module perfilUsuario
 * @purpose Personalización del perfil de usuario
 * @description Controla la selección y visualización del avatar de usuario, así como su
 * almacenamiento persistente mediante localStorage. Permite elegir entre avatares
 * predeterminados o subir uno personalizado. También incluye un visor ampliado
 * tipo lightbox.
 * @author Ivan Medina / Hadbet Altamirano
 * @created Mayo 2025
 * @updated [¿?]
 *
 * @uso
 * Este archivo se utiliza en `dashboardContencion.php` para permitir a los
 * usuarios personalizar y visualizar su avatar.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const toggle = document.getElementById('userDropdownToggle');   // Botón para mostrar panel
    const panel = document.getElementById('userDropdownPanel');     // Panel de selección de avatar
    const avatars = document.querySelectorAll(".avatar-option");    // Avatares predeterminados
    const currentAvatarMini = document.getElementById("currentAvatarMini"); // Avatar miniatura (en header)
    const currentAvatarLarge = document.getElementById("currentAvatarLarge"); // Avatar ampliado (en panel)
    const inputFile = document.getElementById("customAvatarInput"); // Input para subir avatar personalizado

    // 🔁 Cargar avatar guardado en localStorage (si existe)
    const savedAvatar = localStorage.getItem("avatarSeleccionado");
    if (savedAvatar) {
        currentAvatarMini.src = savedAvatar;
        currentAvatarLarge.src = savedAvatar;
    }

    // 🧩 Alternar visibilidad del panel de avatar al hacer clic en el ícono
    toggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita cierre inmediato
        panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
    });

    // 🧹 Cerrar el panel si se hace clic fuera de él
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target)) {
            panel.style.display = 'none';
        }
    });

    // 🎨 Cambiar avatar al hacer clic sobre una imagen predeterminada
    avatars.forEach(avatar => {
        avatar.addEventListener("click", () => {
            avatars.forEach(a => a.classList.remove("selected")); // Quita selección a todos
            avatar.classList.add("selected"); // Marca como seleccionado el nuevo

            const ruta = avatar.getAttribute('src'); // Obtiene ruta del avatar
            currentAvatarMini.src = ruta;
            currentAvatarLarge.src = ruta;
            localStorage.setItem("avatarSeleccionado", ruta); // Guarda elección
        });
    });

    // ⬆️ Cargar avatar personalizado desde archivo
    inputFile.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageSrc = e.target.result;
            currentAvatarMini.src = imageSrc;
            currentAvatarLarge.src = imageSrc;
            localStorage.setItem("avatarSeleccionado", imageSrc); // Guarda imagen personalizada
        };
        reader.readAsDataURL(file);
    });

    // 🔍 Mostrar visor ampliado del avatar al hacer clic
    currentAvatarLarge.addEventListener("click", () => {
        const lightbox = document.getElementById("avatarLightbox");
        const zoomImg = document.getElementById("avatarZoom");
        zoomImg.src = currentAvatarLarge.src;
        lightbox.style.display = "flex";
    });

    // ❌ Cerrar visor ampliado (lightbox)
    document.querySelector(".close-avatar").addEventListener("click", () => {
        document.getElementById("avatarLightbox").style.display = "none";
    });
});
