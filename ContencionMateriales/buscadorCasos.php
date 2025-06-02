<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Buscar Caso (Móvil)</title>

    <!-- Tu CSS principal -->
    <link rel="stylesheet" href="css/buscador.css"/>
    <link rel="stylesheet" href="css/modalMostrarDescripcion.css"/>

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

    <!-- Panel azul con título, input + botón "Buscar" y contenedor de resultados -->
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
            <button type="submit" class="search-button">Buscar</button>
        </form>

        <!-- Aquí se inyecta el botón con el folio; debe estar dentro del panel -->
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
