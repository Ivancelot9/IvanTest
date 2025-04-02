<?php
include_once('db.php');

function cliente($Nomina){
    $con = new LocalConector();
    $conexion = $con->conectar();

    // Consulta para obtener el nombre del usuario con esa nómina
    $consP = "SELECT `NomUser` FROM `Empleados` WHERE `IdUser` = '$Nomina'";
    $rsconsPro = mysqli_query($conexion, $consP);

    if (mysqli_num_rows($rsconsPro) == 1) {
        $fila = mysqli_fetch_assoc($rsconsPro);
        mysqli_close($conexion);
        return $fila['NomUser']; // Devuelve el nombre directamente
    } else {
        mysqli_close($conexion);
        return null; // No encontrado
    }
}

