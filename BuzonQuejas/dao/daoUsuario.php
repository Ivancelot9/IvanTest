<?php
include_once('db.php');

function cliente($Nomina) {
    $con = new LocalConector();
    $conexion = $con->conectar();

    // Validamos que $Nomina sea un número entero positivo
    if (!is_numeric($Nomina) || $Nomina <= 0) {
        return null; // Si no es un número válido, retornamos null
    }

    // Consulta preparada para evitar inyecciones SQL
    $consP = "SELECT `NomUser` FROM `Empleados` WHERE `IdUser` = ?";
    $stmt = $conexion->prepare($consP);

    // Vinculamos el parámetro
    $stmt->bind_param("i", $Nomina); // 'i' significa que $Nomina es un entero

    // Ejecutamos la consulta
    $stmt->execute();

    // Obtenemos el resultado
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $fila = $result->fetch_assoc();
        $stmt->close();
        mysqli_close($conexion);
        return $fila['NomUser']; // Devuelve el nombre directamente
    } else {
        $stmt->close();
        mysqli_close($conexion);
        return null; // No encontrado
    }
}

