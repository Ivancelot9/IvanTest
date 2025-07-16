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
    if (empty($tab_id) || !isset($_SESSION['usuariosPorPestana'][$tab_id]['Username'])) {
        throw new Exception('Sesión inválida: usuario no encontrado.');
    }
    $username = $_SESSION['usuariosPorPestana'][$tab_id]['Username'];

    $conUser = (new LocalConector())->conectar();
    $stmtUser = $conUser->prepare("SELECT IdUsuario FROM Usuario WHERE Username = ?");
    if (!$stmtUser) throw new Exception('Error preparando SELECT usuario: ' . $conUser->error);
    $stmtUser->bind_param("s", $username);
    $stmtUser->execute();
    $stmtUser->bind_result($idUsuario);
    if (!$stmtUser->fetch()) {
        throw new Exception("Usuario \"$username\" no existe en BD.");
    }
    $stmtUser->close();
    $conUser->close();

    $required = ['Responsable', 'NumeroParte', 'Cantidad', 'IdTerceria', 'IdCommodity', 'IdProveedor'];
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
    $stmt = $con->prepare("
      INSERT INTO Casos (IdUsuario, NumeroParte, Cantidad, Descripcion,
        IdTerceria, IdCommodity, IdProveedor, IdEstatus, Responsable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    if (!$stmt) throw new Exception('Error preparando INSERT Casos: ' . $con->error);
    $stmt->bind_param("isdsiiiis", $idUsuario, $numeroParte, $cantidad, $descripcion,
        $idTerceria, $idCommodity, $idProveedor, $estatus, $responsable);
    if (!$stmt->execute()) throw new Exception('Error ejecutando INSERT Casos: ' . $stmt->error);
    $folioCaso = $stmt->insert_id;
    $stmt->close();

    $baseDir = __DIR__ . '/uploads';
    foreach (['ok', 'no', 'pdf'] as $folder) {
        $dir = "$baseDir/$folder";
        if (!is_dir($dir)) mkdir($dir, 0755, true);
    }

    if (isset($_FILES['archivoPDF']) && $_FILES['archivoPDF']['error'] === UPLOAD_ERR_OK) {
        $archivoPDF = $_FILES['archivoPDF'];
        $nombrePDF  = uniqid() . "_" . preg_replace('/\s+/', '_', basename($archivoPDF['name']));
        $destino    = "$baseDir/pdf/$nombrePDF";
        if (!move_uploaded_file($archivoPDF['tmp_name'], $destino)) {
            throw new Exception('No se pudo subir el archivo PDF.');
        }

        $stmtPDF = $con->prepare("INSERT INTO MetodoTrabajo (FolioCaso, RutaArchivo, SubidoPor) VALUES (?, ?, ?)");
        $stmtPDF->bind_param("iss", $folioCaso, $nombrePDF, $username);
        if (!$stmtPDF->execute()) {
            throw new Exception('Error insertando método de trabajo: ' . $stmtPDF->error);
        }
        $stmtPDF->close();
    }

    if (!isset($_POST['defectos']) || !is_array($_POST['defectos'])) {
        throw new Exception('No se recibieron defectos.');
    }

    foreach ($_POST['defectos'] as $idx => $bloque) {
        $idDef = intval($bloque['idDefecto'] ?? 0);
        if ($idDef <= 0) {
            throw new Exception("Defecto inválido en bloque " . ($idx + 1));
        }

        $sd = $con->prepare("INSERT INTO DefectosCaso (FolioCaso, IdDefectos) VALUES (?,?)");
        $sd->bind_param("ii", $folioCaso, $idDef);
        if (!$sd->execute()) {
            throw new Exception('Error insertando DefectosCaso: ' . $sd->error);
        }
        $idDefCaso = $sd->insert_id;
        $sd->close();

        subirFotoReducida($idx, 'fotoOk', 'ok', $folioCaso, $idDefCaso, "$baseDir/ok", $con);
        subirFotoReducida($idx, 'fotoNo',  'no', $folioCaso, $idDefCaso, "$baseDir/no", $con);
    }

    ob_clean();
    echo json_encode([
        'status'      => 'success',
        'message'     => "Caso #{$folioCaso} guardado correctamente.",
        'folio'       => $folioCaso,
        'fecha'       => date('Y-m-d'),
        'estatus'     => lookup($con, 'Estatus',  'IdEstatus',   'NombreEstatus',   $estatus),
        'responsable' => $responsable,
        'terciaria'   => lookup($con, 'Terceria', 'IdTerceria',  'NombreTerceria',  $idTerceria)
    ]);
    exit;

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}

// 📦 Comprimir imagen y guardar
function subirFotoReducida($idx, $campo, $tipo, $folio, $idDefCaso, $dir, $con) {
    if (!isset($_FILES['defectos']['tmp_name'][$idx][$campo]) ||
        $_FILES['defectos']['error'][$idx][$campo] !== UPLOAD_ERR_OK) {
        return;
    }

    $tmp = $_FILES['defectos']['tmp_name'][$idx][$campo];
    $origName = basename($_FILES['defectos']['name'][$idx][$campo]);
    $extension = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $nuevoNombre = uniqid() . "_{$origName}";
    $rutaDestino = "$dir/$nuevoNombre";

    // Cargar imagen y redimensionar si es muy grande
    list($anchoOriginal, $altoOriginal) = getimagesize($tmp);
    $anchoMax = 1280;
    $altoMax = 1280;
    $ratio = min($anchoMax / $anchoOriginal, $altoMax / $altoOriginal, 1);
    $anchoNuevo = (int)($anchoOriginal * $ratio);
    $altoNuevo = (int)($altoOriginal * $ratio);

    $imagenNueva = imagecreatetruecolor($anchoNuevo, $altoNuevo);
    switch ($extension) {
        case 'jpg':
        case 'jpeg':
            $img = imagecreatefromjpeg($tmp);
            imagecopyresampled($imagenNueva, $img, 0, 0, 0, 0, $anchoNuevo, $altoNuevo, $anchoOriginal, $altoOriginal);
            imagejpeg($imagenNueva, $rutaDestino, 70);
            break;
        case 'png':
            $img = imagecreatefrompng($tmp);
            imagecopyresampled($imagenNueva, $img, 0, 0, 0, 0, $anchoNuevo, $altoNuevo, $anchoOriginal, $altoOriginal);
            imagepng($imagenNueva, $rutaDestino, 6);
            break;
        default:
            move_uploaded_file($tmp, $rutaDestino); // fallback
    }

    $i = $con->prepare("INSERT INTO Fotos (FolioCaso, IdDefectoCaso, TipoFoto, Ruta) VALUES (?, ?, ?, ?)");
    $i->bind_param("iiss", $folio, $idDefCaso, $tipo, $nuevoNombre);
    if (!$i->execute()) {
        throw new Exception('Error insertando Foto: ' . $i->error);
    }
    $i->close();
}

function lookup($con, $tabla, $idFld, $nameFld, $val) {
    $output = '';
    $st = $con->prepare("SELECT `$nameFld` FROM `$tabla` WHERE `$idFld` = ?");
    if ($st) {
        $st->bind_param("i", $val);
        $st->execute();
        $st->bind_result($output);
        $st->fetch();
        $st->close();
    }
    return $output;
}
