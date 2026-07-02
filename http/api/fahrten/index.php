<?php
//$csvDatei = '/var/www/vhosts/nuernberg1999.de/WP_Backend/fahrten.csv';
//require_once 'config.php';
//$csvDatei = BACKEND . 'fahrten.csv';
$csvDatei = __DIR__ . '/../../../data/WP_Backend/fahrten.csv';
$spalten = ['id', 'abfahrtszeit', 'liniennummer', 'sonderzeichen', 'ziel', 'betriebstag', 'sonderinfo', 'abfahrtszeit_prognose', 'triebwagen', 'beiwagen_1', 'beiwagen_2', 'abfahrtszeit_ist'];
$mapping = [
    'abfahrtszeit' => 'abfahrtszeit',
    'betriebstag' => 'betriebstag',
    'ziel' => 'ziel',
    'sonderzeichen' => 'sonderzeichen',
    'liniennummer' => 'liniennummer',
    'sonderinfo' => 'sonderinfo',
    'triebwagen' => 'triebwagen',
    'beiwagen_1' => 'beiwagen_1',
    'beiwagen_2' => 'beiwagen_2'
];
$allowedPattern = '/^[a-zA-Z0-9äöüÄÖÜß\-:\s.,+]*$/u';

// CSV laden
function ladeCSV($datei) {
    $daten = [];
    if (!file_exists($datei)) return $daten;
    $fp = fopen($datei, 'r');
    $header = fgetcsv($fp, 0, ",", '"', "\\");
    while (($zeile = fgetcsv($fp, 0, ",", '"', "\\")) !== false) {
        $daten[] = array_combine($header, $zeile);
    }
    fclose($fp);
    return $daten;
}

// CSV speichern
function speichereCSV($datei, $header, $daten) {
    $fp = fopen($datei, 'w');
    fputcsv($fp, $header, ",", '"', "\\");
    foreach ($daten as $zeile) {
        $reihe = [];
        foreach ($header as $feld) {
            $reihe[] = $zeile[$feld] ?? '';
        }
        fputcsv($fp, $reihe, ",", '"', "\\");
    }
    fclose($fp);
}

// Methode ermitteln
$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    $daten = ladeCSV($csvDatei);
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    if (strpos($accept, 'application/json') !== false) {
        header('Content-Type: application/json');
        echo json_encode($daten);
    } else {
        header('Content-Type: text/csv');
        $fp = fopen('php://output', 'w');
        fputcsv($fp, $spalten, ",", '"', "\\");
        foreach ($daten as $zeile) {
            $reihe = [];
            foreach ($spalten as $feld) {
                $reihe[] = $zeile[$feld] ?? '';
            }
            fputcsv($fp, $reihe, ",", '"', "\\");
        }
        fclose($fp);
    }
    exit;
}

// DELETE
if ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $params);
    
    // Prüfe ob id oder betriebstag angegeben ist
    if (empty($params['id']) && empty($params['betriebstag'])) {
        http_response_code(400);
        echo "Fehler: 'id' oder 'betriebstag' erforderlich.";
        exit;
    }
    
    $daten = ladeCSV($csvDatei);
    
    if (!empty($params['id'])) {
        // Lösche nach ID
        $daten = array_filter($daten, fn($zeile) => $zeile['id'] !== $params['id']);
    } elseif (!empty($params['betriebstag'])) {
        // Validiere Datumsformat
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $params['betriebstag'])) {
            http_response_code(400);
            echo "Fehler: 'betriebstag' muss im Format YYYY-MM-DD sein.";
            exit;
        }
        // Lösche alle Fahrten mit diesem Datum
        $daten = array_filter($daten, fn($zeile) => $zeile['betriebstag'] !== $params['betriebstag']);
    }
    
    speichereCSV($csvDatei, $spalten, $daten);
    echo "OK";
    exit;
}

// POST
if ($method === 'POST') {
    // Pflichtfeld prüfen
    if (empty($_POST['ziel'])) {
        http_response_code(400);
        echo "Fehler: 'ziel' ist erforderlich.";
        exit;
    }

    // tag: falls leer, aktuellen Tag setzen (YYYY-MM-DD)
    if (empty($_POST['tag'])) {
        $_POST['tag'] = date('Y-m-d');
    } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $_POST['tag'])) {
        http_response_code(400);
        echo "Fehler: 'tag' muss im Format YYYY-MM-DD sein.";
        exit;
    }

    // abfahrtszeit: muss im Format hh:mm sein
    if (!empty($_POST['abfahrtszeit']) && !preg_match('/^\d{2}:\d{2}$/', $_POST['abfahrtszeit'])) {
        http_response_code(400);
        echo "Fehler: 'zeit' muss im Format hh:mm sein.";
        exit;
    }

    // Sonderzeichen- und Linienprüfung: nur Ziffern erlaubt
    if (!empty($_POST['sonderzeichen']) && !preg_match('/^\d+$/', $_POST['sonderzeichen'])) {
        http_response_code(400);
        echo "Fehler: 'sonderzeichen' darf nur Ziffern enthalten.";
        exit;
    }
    if (!empty($_POST['liniennummer']) && !preg_match('/^\d+$/', $_POST['liniennummer'])) {
        http_response_code(400);
        echo "Fehler: 'linie' darf nur Ziffern enthalten.";
        exit;
    }

    // Allgemeine Zeichenprüfung für erlaubte Felder
    foreach ($mapping as $param => $feld) {
        if (isset($_POST[$param]) && !preg_match($allowedPattern, $_POST[$param])) {
            http_response_code(400);
            echo "Fehler: Ungültige Zeichen in '$param'.";
            exit;
        }
    }

    $daten = ladeCSV($csvDatei);
    $verwendeteIDs = array_column($daten, 'id');
    for ($id = 1000; $id <= 9999; $id++) {
        if (!in_array((string)$id, $verwendeteIDs)) {
            $neueID = (string)$id;
            break;
        }
    }
    if (!isset($neueID)) {
        http_response_code(500);
        echo "Keine freie ID verfügbar.";
        exit;
    }

    $neueZeile = array_fill_keys($spalten, '');
    $neueZeile['id'] = $neueID;
    foreach ($mapping as $param => $feld) {
        if (isset($_POST[$param])) {
            $neueZeile[$feld] = $_POST[$param];
        }
    }

    // Set prognose and ist to the provided abfahrtszeit when available
    if (isset($_POST['abfahrtszeit'])) {
        $neueZeile['abfahrtszeit_prognose'] = $_POST['abfahrtszeit'];
        $neueZeile['abfahrtszeit_ist'] = $_POST['abfahrtszeit'];
    }

    $daten[] = $neueZeile;
    speichereCSV($csvDatei, $spalten, $daten);
    echo "OK";
    exit;
}

http_response_code(405);
echo "Methode nicht erlaubt.";
exit;
?>
