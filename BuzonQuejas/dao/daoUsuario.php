<?php
include_once('db.php');

/*$Nomina=$_GET['nomina'];
$contra=$_GET['contra'];

cliente($Nomina, $contra);*/


function cliente($Nomina){
    $con = new LocalConector();
    $conexion=$con->conectar();
    $consP="SELECT `NomUser` FROM `Empleados` WHERE `IdUser` = '$Nomina'";
    $rsconsPro=mysqli_query($conexion,$consP);
    mysqli_close($conexion);
    $userData = array();
    if(mysqli_num_rows($rsconsPro) == 1){
        return 1;
    }
    else{
        return 0;
    }
}


?>