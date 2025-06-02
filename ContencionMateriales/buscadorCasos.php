<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Buscar Caso (Móvil)</title>
    <link rel="stylesheet" href="css/buscador.css"/>
    <link rel="stylesheet" href="css/modalMostrarDescripcion.css"/>
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

    <!-- Panel azul con título, input y contenedor de resultados -->
    <div class="mobile-panel">
        <h2 class="mobile-title">Lista Casos</h2>

        <!-- Antes: solo tenías el <input> en el form -->
        <!-- Ahora: agregamos un botón de tipo submit al lado del input -->
        <form id="search-form" class="mobile-form">
            <input
                    type="number"
                    id="case-number"
                    placeholder="Ingresa número del caso"
                    min="1"
                    required
            />
            <button type="submit" class="search-button">Buscar</button>
        </form>

        <!-- Mantén el case-container dentro del panel -->
        <div id="case-container"></div>
    </div>
</div>
</body>
</html>
