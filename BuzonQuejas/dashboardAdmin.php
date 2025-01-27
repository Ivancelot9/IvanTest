<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            display: flex;
            min-height: 100vh;
            background-color: #f4f4f9;
        }

        /* Sidebar */
        .sidebar {
            width: 250px;
            background-color: #007acc;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 0;
        }

        .sidebar h2 {
            margin-bottom: 20px;
        }

        .sidebar a {
            text-decoration: none;
            color: white;
            margin: 10px 0;
            padding: 10px 15px;
            width: 100%;
            text-align: center;
            border-radius: 5px;
            transition: background-color 0.3s;
        }

        .sidebar a:hover {
            background-color: #005b99;
        }

        .sidebar .profile {
            margin-bottom: 30px;
            text-align: center;
        }

        .sidebar .profile img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-bottom: 10px;
        }

        .sidebar .profile h4 {
            margin-top: 10px;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            padding: 20px;
        }

        .main-content .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .main-content .header h1 {
            font-size: 24px;
            color: #333;
        }

        .main-content .content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .main-content .content h2 {
            margin-bottom: 10px;
            color: #007acc;
        }

        .main-content .content table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .main-content .content table th,
        .main-content .content table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        .main-content .content table th {
            background-color: #f4f4f9;
            color: #333;
        }

        .button {
            background-color: #007acc;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .button:hover {
            background-color: #005b99;
        }
    </style>
</head>
<body>
<div class="sidebar">
    <div class="profile">
        <img src="https://via.placeholder.com/80" alt="Profile Picture">
        <h4>Juan Alejandro Medina</h4>
    </div>
    <a href="#">Datos Personales</a>
    <a href="#">Historial de Reportes</a>
    <a href="#">Reportes Completos</a>
</div>

<div class="main-content">
    <div class="header">
        <h1>Historial de Reportes</h1>
    </div>

    <div class="content">
        <h2>Resumen</h2>
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

        <button class="button">Siguiente</button>
    </div>
</div>
</body>
</html>
