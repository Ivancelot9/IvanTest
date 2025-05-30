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

<main class="mobile-search">
    <h1>🔍 Buscar Caso</h1>

    <form id="search-form">
        <input
            type="number"
            id="case-number"
            placeholder="Número de caso"
            min="1"
            required
        />
        <button type="submit">Buscar</button>
    </form>

    <div id="case-container">
        <!-- Aquí aparecerá el caso ó mensaje de error -->
    </div>
</main>

<!-- Iconos FontAwesome -->
<script src="https://kit.fontawesome.com/tu-kit.js" crossorigin="anonymous"></script>
</body>
</html>

