<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

// Incluimos la clase de conexión (una sola vez)
include_once ('conexionContencion.php');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Validar campos obligatorios
    $campos = ['Responsable','NumeroParte','Cantidad','IdTerceria','IdCommodity','IdProveedor','IdDefectos'];
    foreach ($campos as $c) {
        if (!isset($_POST[$c]) || trim($_POST[$c]) === '') {
            throw new Exception("Falta el campo $c");
        }
    }

    // Obtener IdUsuario de la sesión
    $idUsuario = $_SESSION['IdUsuario'] ?? null;
    if (!$idUsuario) {
        throw new Exception('Sesión inválida, no se encontró usuario.');
    }

    // Recoger datos del formulario
    $responsable  = trim($_POST['Responsable']);
    $numeroParte  = trim($_POST['NumeroParte']);
    $cantidad     = floatval(str_replace(',', '.', $_POST['Cantidad']));
    $descripcion  = trim($_POST['Descripcion'] ?? '');
    $idTerceria   = intval($_POST['IdTerceria']);
    $idCommodity  = intval($_POST['IdCommodity']);
    $idProveedor  = intval($_POST['IdProveedor']);
    $idDefectos   = intval($_POST['IdDefectos']);

    // Conectar a la base de datos
    $con = (new LocalConector())->conectar();

    // 1) Insertar el nuevo caso
    $sql = "INSERT INTO Casos
      (IdUsuario, NumeroParte, Cantidad, Descripcion, IdTerceria, IdCommodity, IdProveedor, IdDefectos)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $con->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error preparando INSERT Casos: ' . $con->error);
    }
    $stmt->bind_param(
        "isdsiiii",
        $idUsuario,
        $numeroParte,
        $cantidad,
        $descripcion,
        $idTerceria,
        $idCommodity,
        $idProveedor,
        $idDefectos
    );
    if (!$stmt->execute()) {
        throw new Exception('Error ejecutando INSERT Casos: ' . $stmt->error);
    }
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    // Preparar directorios de subida
    $baseDir = __DIR__ . '/uploads';
    $okDir   = "$baseDir/ok";
    $noDir   = "$baseDir/no";
    foreach ([$okDir, $noDir] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    // Función para procesar fotos subidas
    function procesarFotos($filesArray, $tipo, $folio, $con, $destDir) {
        if (empty($filesArray['name']) || !is_array($filesArray['name'])) {
            return;
        }
        $count = count($filesArray['name']);
        for ($i = 0; $i < $count; $i++) {
            if (empty($filesArray['tmp_name'][$i])) {
                continue;
            }
            $origName = basename($filesArray['name'][$i]);
            $newName  = uniqid() . "_" . $origName;
            $destPath = "$destDir/$newName";
            if (!move_uploaded_file($filesArray['tmp_name'][$i], $destPath)) {
                throw new Exception("No se pudo mover foto ($tipo): $origName");
            }
            $ins = $con->prepare(
                "INSERT INTO Fotos (FolioCaso, TipoFoto, Ruta) VALUES (?, ?, ?)"
            );
            if (!$ins) {
                throw new Exception('Error preparando INSERT Fotos: ' . $con->error);
            }
            $ins->bind_param("iss", $folio, $tipo, $newName);
            if (!$ins->execute()) {
                throw new Exception('Error ejecutando INSERT Fotos: ' . $ins->error);
            }
            $ins->close();
        }
    }

    // 2) Procesar fotos OK y NO OK
    procesarFotos($_FILES['fotosOk'], 'ok', $folioCaso, $con, $okDir);
    procesarFotos($_FILES['fotosNo'], 'no', $folioCaso, $con, $noDir);

    // 3) Respuesta JSON de éxito
    echo json_encode([
        'status'  => 'success',
        'message' => "Caso #$folioCaso guardado correctamente."
    ]);
    exit;

} catch (Exception $e) {
    // En caso de error, devolvemos JSON con status error
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}
