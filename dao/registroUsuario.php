<?php
session_start();
// Iniciar sesión
include_once("conexion.php");
// Revisar si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Validar que todos los datos requeridos están presentes
      if (isset($_POST['NumNomina'], $_POST['Nombre'], $_POST['Contrasena'])) {
          // Obtener los datos del formulario
           $NumNomina = $_POST['NumNomina'];
           $Nombre = $_POST['Nombre'];
           $Contrasena = $_POST['Contrasena'];
           $response = registrarUsuarioEnDB($NumNomina, $Nombre, $Contrasena);
      } else
      { $response = array('status' => 'error', 'message' => 'Datos incompletos.');
      }
} else {
    $response = array('status' => 'error', 'message' => 'Se requiere método POST.');
}echo json_encode($response);
exit();
// Función para registrar al usuario en la base de datos
function registrarUsuarioEnDB($NumNomina, $Nombre, $Contrasena){
    $con = new LocalConector();
    $conex = $con->conectar();
    $insertUsuario = $conex->prepare("INSERT INTO Usuario (IdUsuario, Nombre, Contraseña)     
                                     VALUES (?, ?, ?)");
    $insertUsuario->bind_param("sss", $NumNomina, $Nombre, $Contrasena);
    $resultado = $insertUsuario->execute();
    $conex->close();
    if ($resultado) {
        $response = array('status' => 'success', 'message' => 'Usuario registrado exitosamente');
    } else
    {
        $response = array('status' => 'error', 'message' => 'Error al registrar usuario');
    }    return $response;}
?>