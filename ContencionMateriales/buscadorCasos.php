<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Buscar Caso (Móvil)</title>

    <!-- Font Awesome para el icono de lupa -->
    <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
            integrity="sha512-…tuIntegridad…"
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
    />

    <!-- Tu CSS principal (incluye todos los estilos anteriores) -->
    <link rel="stylesheet" href="css/buscador.css"/>
    <link rel="stylesheet" href="css/modalMostrarDescripcion.css"/>

    <!-- SweetAlert2 (si lo necesitas para alertas) -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- El JS se carga con defer para que DOM esté listo -->
    <script defer src="js/buscador.js"></script>
</head>
<body>
<div class="mobile-search">
    <!-- Logo Grammer -->
    <header class="mobile-header">
        <img
                src="imagenes/Grammer_Logo_Original_White_sRGB_screen_transparent.png"
                alt="Grammer"
                class="mobile-logo"
        />
    </header>

    <!-- Panel verde con animaciones -->
    <div class="mobile-panel">
        <h2 class="mobile-title">Lista Casos</h2>

        <form id="search-form" class="mobile-form">
            <input
                    type="number"
                    id="case-number"
                    placeholder="Número de caso"
                    min="1"
                    required
            />
            <button type="submit" class="search-button">
                <i class="fas fa-search"></i> Buscar
            </button>
        </form>

        <!-- Aquí se inyecta dinámicamente el botón con el folio -->
        <div id="case-container"></div>
    </div>

    <!-- Modal overlay (vacío al inicio; el JS inyecta su contenido) -->
    <div id="case-modal" class="modal-overlay"></div>
</div>

<!-- Lightbox estático para imágenes ampliadas -->
<div id="modal-image" class="modal-overlay">
    <div class="lightbox-content">
        <button class="close-img">&times;</button>
        <img src="" alt="Foto ampliada">
    </div>
</div>
</body>
</html>
