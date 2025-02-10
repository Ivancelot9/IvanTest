document.addEventListener("DOMContentLoaded", function () {
    // Seleccionamos todos los botones "Mostrar Reporte"
    const botonesMostrar = document.querySelectorAll(".mostrar-reporte");

    botonesMostrar.forEach((boton) => {
        boton.addEventListener("click", function () {
            const folio = this.getAttribute("data-folio");

            // Crear ventana emergente con detalles del reporte
            const popup = window.open("", "Reporte", "width=600,height=400");

            // Escribir contenido del reporte con el atributo lang="es"
            popup.document.write(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reporte ${folio}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Bangers', cursive;
                            background: #fff;
                            text-align: center;
                            padding: 20px;
                        }
                        .reporte-container {
                            border: 3px solid #000;
                            padding: 20px;
                            background: #fffae6;
                            box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
                            width: 90%;
                            margin: auto;
                        }
                        h2 {
                            color: #ff4500;
                        }
                        .info {
                            text-align: left;
                            margin: 10px 0;
                        }
                        button {
                            background: #ff4500;
                            color: white;
                            border: none;
                            padding: 10px;
                            font-size: 16px;
                            cursor: pointer;
                        }
                        button:hover {
                            background: #d40000;
                        }
                    </style>
                </head>
                <body>
                    <div class="reporte-container">
                        <h2>Reporte ${folio}</h2>
                        <div class="info">
                            <p><strong>Folio:</strong> ${folio}</p>
                            <p><strong>Área:</strong> Sistemas</p>
                            <p><strong>Fecha:</strong> 10/02/2025</p>
                            <p><strong>Estado:</strong> En revisión</p>
                            <p><strong>Descripción:</strong> Aquí se muestra toda la información detallada del reporte.</p>
                        </div>
                        <button onclick="window.print()">Imprimir</button>
                    </div>
                </body>
                </html>
            `);
        });
    });
});
