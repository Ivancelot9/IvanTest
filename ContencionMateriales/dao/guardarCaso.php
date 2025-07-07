<?php
ob_start();
session_start();
header('Content-Type: application/json; charset=UTF-8');

include_once 'conexionContencion.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    $tab_id = $_GET['tab_id'] ?? '';
    if (!$tab_id || !isset($_SESSION['usuariosPorPestana'][$tab_id]['Username'])) {
        throw new Exception('Sesión inválida');
    }
    $username = $_SESSION['usuariosPorPestana'][$tab_id]['Username'];

    // Obtener IdUsuario
    $conUser = (new LocalConector())->conectar();
    $stmtUser = $conUser->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $stmtUser->bind_result($idUsuario);
    if (!$stmtUser->fetch()) {
        throw new Exception("Usuario no encontrado");
    }
    $stmtUser->close();
    $conUser->close();

    // Validación de campos
    $required = ['Responsable','NumeroParte','Cantidad','IdTerceria','IdCommodity','IdProveedor'];
    foreach ($required as $f) {
        if (!isset($_POST[$f]) || trim($_POST[$f]) === '') {
            throw new Exception("Falta el campo $f");
        }
    }

    $responsable = trim($_POST['Responsable']);
    $numeroParte = trim($_POST['NumeroParte']);
    $cantidad    = floatval(str_replace(',', '.', $_POST['Cantidad']));
    $descripcion = $_POST['Descripcion'] ?? '';
    $idTerceria  = intval($_POST['IdTerceria']);
    $idCommodity = intval($_POST['IdCommodity']);
    $idProveedor = intval($_POST['IdProveedor']);
    $estatus     = 1;

    $con = (new LocalConector())->conectar();
    $sql = "
        INSERT INTO Casos
            (IdUsuario, NumeroParte, Cantidad, Descripcion,
             IdTerceria, IdCommodity, IdProveedor, IdEstatus, Responsable)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $con->prepare($sql);
    $stmt->bind_param("isdsiiiis", $idUsuario, $numeroParte, $cantidad, $descripcion, $idTerceria, $idCommodity, $idProveedor, $estatus, $responsable);
    $stmt->execute();
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    // Crear carpetas si no existen
    $baseDir = __DIR__ . '/uploads';
    $okDir   = "$baseDir/ok";
    $noDir   = "$baseDir/no";
    foreach ([$okDir, $noDir] as $d) {
        if (!is_dir($d)) mkdir($d, 0755, true);
    }

    // Procesar defectos
    if (!isset($_POST['defectos']) || !is_array($_POST['defectos'])) {
        throw new Exception('No se recibieron defectos');
    }

    foreach ($_POST['defectos'] as $idx => $bloque) {
        $idDef = intval($bloque['idDefecto'] ?? 0);
        if ($idDef <= 0) throw new Exception("Defecto inválido en el bloque " . ($idx + 1));

        $sd = $con->prepare("INSERT INTO DefectosCaso (FolioCaso, IdDefectos) VALUES (?, ?)");
        $sd->bind_param("ii", $folioCaso, $idDef);
        $sd->execute();
        $idDefCaso = $sd->insert_id;
        $sd->close();

        subirFoto($idx, 'fotoOk', 'ok', $folioCaso, $idDefCaso, $okDir, $con);
        subirFoto($idx, 'fotoNo', 'no', $folioCaso, $idDefCaso, $noDir, $con);
    }

    ob_clean();
    echo json_encode([
        'status' => 'success',
        'message' => "Caso #$folioCaso guardado correctamente",
        'folio' => $folioCaso,
        'fecha' => date('Y-m-d'),
    ]);
    exit;

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}

// 📷 Subida de una foto individual
function subirFoto($idx, $campo, $tipo, $folio, $idDefCaso, $dir, $con) {
    if (
        !isset($_FILES['defectos']['tmp_name'][$idx][$campo]) ||
        $_FILES['defectos']['error'][$idx][$campo] !== UPLOAD_ERR_OK
    ) {
        $error = $_FILES['defectos']['error'][$idx][$campo] ?? 'No detectado';
        if ($error !== UPLOAD_ERR_NO_FILE) {
            throw new Exception("Error al subir la foto ($tipo), código: $error");
        }
        return;
    }

    $orig = basename($_FILES['defectos']['name'][$idx][$campo]);
    $new  = uniqid() . "_$orig";
    $destino = "$dir/$new";

    if (!move_uploaded_file($_FILES['defectos']['tmp_name'][$idx][$campo], $destino)) {
        throw new Exception("Error al mover el archivo ($tipo) a $destino");
    }

    $stmt = $con->prepare("INSERT INTO Fotos (FolioCaso, IdDefectoCaso, TipoFoto, Ruta) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $folio, $idDefCaso, $tipo, $new);
    $stmt->execute();
    $stmt->close();
}
