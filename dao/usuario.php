<?php
require_once 'conexion.php';

class Usuario{

    private $conexion;

    public function __construct(){
        $localConector = new LocalConector();
        $this->conexion = $localConector->conectar();
    }

    // Método para registrar el usuario
    public function registrarUsuario($usuario, $numNomina, $contrasena) {
        try {
            $hashedPassword = password_hash($contrasena, PASSWORD_DEFAULT);
            $query = "INSERT INTO Usuarios (IdUsuario, Nombre, Contraseña) VALUES (?, ?, ?)";
            $stmt = $this->conexion->prepare($query);

            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta: " . $this->conexion->error);
            }

            $stmt->bind_param('sss', $usuario, $numNomina, $hashedPassword);
            $stmt->execute();

            return $stmt->affected_rows > 0;
        } catch (Exception $e) {
            error_log("Error en registrarUsuario: " . $e->getMessage());
            return false;
        }
    }

    // Método para verificar si el número de nómina existe
    public function existeNumNomina($numNomina) {
        try {
            $query = "SELECT COUNT(*) as total FROM Usuarios WHERE NumNomina = ?";
            $stmt = $this->conexion->prepare($query);

            if ($stmt === false) {
                throw new Exception("Error al preparar la consulta: " . $this->conexion->error);
            }

            $stmt->bind_param('s', $numNomina);
            $stmt->execute();

            $result = $stmt->get_result();
            $data = $result->fetch_assoc();

            return $data['total'] > 0;
        } catch (Exception $e) {
            error_log("Error en existeNumNomina: " . $e->getMessage());
            return false;
        }
    }
}