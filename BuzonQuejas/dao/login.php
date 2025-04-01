<?php
require 'daoUsuario.php';
if(isset($_POST['btnEntrar'])){

    session_start();
    $Nomina = $_POST['nomina'];
    if (strlen($Nomina) == 1) { $Nomina = "0000000".$Nomina; }
    if (strlen($Nomina) == 2) { $Nomina = "000000".$Nomina; }
    if (strlen($Nomina) == 3) { $Nomina = "00000".$Nomina; }
    if (strlen($Nomina) == 4) { $Nomina = "0000".$Nomina; }
    if (strlen($Nomina) == 5) { $Nomina = "000".$Nomina; }
    if (strlen($Nomina) == 6) { $Nomina = "00".$Nomina; }
    if (strlen($Nomina) == 7) { $Nomina = "0".$Nomina; }

    $statusLogin = cliente($Nomina);

    if($statusLogin == 1){
        $_SESSION['nomina'] = $Nomina;
        echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=../dashboardUsuario.php'>";
    }else if($statusLogin == 0){
        echo "<script>alert('Acceso Denegado')</script>";
        echo "<META HTTP-EQUIV='REFRESH' CONTENT='1; URL=../loginUsuario.php'>";
    }
}