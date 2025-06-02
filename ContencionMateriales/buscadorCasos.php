<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Buscar Caso (Móvil)</title>
    <link rel="stylesheet" href="css/buscador.css"/>
    <script defer src="js/buscador.js"></script>
</head>
<body>
<div class="mobile-search">
    <!-- Logo Grammer -->
    <header class="mobile-header">
        <img src="imagenes/Recurso%206%20(2).png" alt="Grammer" class="mobile-logo"/>
    </header>

    <!-- Panel azul con título e input pill -->
    <div class="mobile-panel">
        <h2 class="mobile-title">Lista Casos</h2>
        <form id="search-form" class="mobile-form">
            <input
                type="number"
                id="case-number"
                placeholder="Ingresa número del caso"
                min="1"
                required
            />
        </form>
    </div>

    <!-- Aquí aparecerá el detalle del caso -->
    <div id="case-container"></div>
    <!-- Modal para mostrar el reporte -->
    <div id="case-modal" class="modal-overlay">
        <div class="modal-content">
            <button id="modal-close" class="modal-close">&times;</button>
            <div id="modal-body"></div>
        </div>
    </div>
</div>
</body>
</html>
