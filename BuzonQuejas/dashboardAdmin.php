<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Estilo Cómic</title>
    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/dashboardStyle.css"> <!-- Vincula el CSS externo -->
</head>
<body>
<div class="sidebar">
    <div class="profile">
        <img src="https://via.placeholder.com/80" alt="Profile Picture">
        <h4>Iván Alejandro Medina</h4>
    </div>
    <a href="#">Datos Personales</a>
    <a href="#">Historial de Reportes</a>
    <a href="#">Reportes Completos</a>
</div>

<div class="main-content">
    <div class="header">
        <h1 class="comic-title">Historial de Reportes</h1>
    </div>

    <div class="content comic-container">
        <h2 class="comic-title">Resumen</h2>
        <table>
            <thead>
            <tr>
                <th>Shift Leader</th>
                <th>Área</th>
                <th>Reporte</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Pedro Pérez</td>
                <td>Producción</td>
                <td>Reporte 1</td>
            </tr>
            <tr>
                <td>María López</td>
                <td>Calidad</td>
                <td>Reporte 2</td>
            </tr>
            </tbody>
        </table>

        <button class="submit-btn">Siguiente</button>
    </div>
</div>
</body>
</html>