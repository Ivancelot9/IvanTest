<?php
include_once("conexion.php");
header('Content-Type: application/json');

// Verificar si se envió un número de nómina
if (isset($_GET['NumNomina'])) {
    $NumNomina = trim($_GET['NumNomina']);

    // Validar que el número de nómina tenga exactamente 8 dígitos
    if (!ctype_digit($NumNomina) || strlen($NumNomina) !== 8) {
        echo json_encode(['status' => 'error', 'message' => 'El número de nómina debe tener exactamente 8 dígitos.']);
        exit;
    }

    try {
        $con = new LocalConector();
        $conex = $con->conectar();

        if (!$conex) {
            echo json_encode(['status' => 'error', 'message' => 'Error al conectar con la base de datos.']);
            exit;
        }

        // Depuración: Ver qué llega al servidor
        file_put_contents("debug.log", "NumNomina recibido: $NumNomina\n", FILE_APPEND);

        // Consultar datos del usuario usando la columna `IdUsuario`
        $query = $conex->prepare("SELECT Nombre, IdUsuario FROM Usuario WHERE IdUsuario = ?");
        $query->bind_param("s", $NumNomina);
        $query->execute();
        $result = $query->get_result();

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            echo json_encode(['status' => 'success', 'nombre' => $user['Nombre'], 'nomina' => $user['IdUsuario']]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se encontraron datos para el número de nómina ingresado.']);
        }

        $query->close();
        $conex->close();
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Número de nómina no proporcionado.']);
}
?>