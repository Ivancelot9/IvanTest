<?php

include_once("conexion.php"); // 🔥 Conexión a la BD

header("Content-Type: application/json");

try {
    $con = new LocalConector();
    $conn = $con->conectar();

    $query = $conn->prepare("SELECT IdArea, NombreArea FROM Area ORDER BY NombreArea");
    $query->execute();
    $result = $query->get_result();

    $areas = [];

    while ($row = $result->fetch_assoc()) {
        $areas[] = $row;
    }

    echo json_encode($areas);

    $query->close();
    $conn->close();
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error en el servidor: " . $e->getMessage()]);
}


