<?php
require 'daoUsuario.php';

if (isset($_POST['btnEntrar'])) {
    session_start();
    $Nomina = $_POST['nomina'];

    // Formato a 8 dígitos (puedes usar str_pad para simplificar)
    $Nomina = str_pad($Nomina, 8, "0", STR_PAD_LEFT);

    // Ahora cliente() devuelve el nombre si existe, o null si no
    $nombreUsuario = cliente($Nomina);

    if ($nombreUsuario !== null) {
        $_SESSION['nomina'] = $Nomina;
        $_SESSION['nombre'] = $nombreUsuario;
        echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=../dashboardUsuario.php'>";
    } else {
        echo "<script>alert('Acceso Denegado')</script>";
        echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=../loginUsuario.php'>";
    }
}

