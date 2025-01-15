<?php
 include 'conexion.php';
// Verificar si se enviaron datos por POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Obtener los datos del formulario
    $nombre = trim($_POST["nombre"]);
    $num_nomina = trim($_POST["num_nomina"]);
    $contrasena = trim($_POST["contrasena"]);

    // Validar que no estén vacíos
    if (empty($nombre) || empty($num_nomina) || empty($contrasena)) {
        die("Todos los campos son obligatorios.");
    }

    // Validar que el número de nómina tenga exactamente 8 caracteres
    if (strlen($num_nomina) < 8) {
        $num_nomina = str_pad($num_nomina, 8, "0", STR_PAD_LEFT);
    }

    if (strlen($num_nomina) !== 8) {
        die("El número de nómina debe tener exactamente 8 caracteres.");
    }

    // Guardar los datos en la base de datos
    $host = "localhost";
    $usuario = "root"; // Cambia esto por tu usuario
    $password = "";    // Cambia esto por tu contraseña
    $database = "mi_base_datos"; // Cambia esto por el nombre de tu base de datos

    $conexion = new mysqli($host, $usuario, $password, $database);

    // Verificar la conexión
    if ($conexion->connect_error) {
        die("Error de conexión: " . $conexion->connect_error);
    }

    // Insertar los datos en la tabla usuarios
    $sql = "INSERT INTO usuarios (nombre, num_nomina, contrasena) VALUES (?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sss", $nombre, $num_nomina, $contrasena);

    if ($stmt->execute()) {
        echo "Registro exitoso.";
    } else {
        echo "Error al registrar: " . $stmt->error;
    }

    $stmt->close();
    $conexion->close();
}
?>
