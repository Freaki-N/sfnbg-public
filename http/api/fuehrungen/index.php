<?php
//$csvDatei = '/var/www/vhosts/nuernberg1999.de/WP_Backend/fuehrungen.csv';
$csvDatei = __DIR__ . '/../../../data/WP_Backend/fuehrungen.csv';
$spalten = ['id', 'startzeit', 'betriebstag', 'sonderinfo'];
$mapping = [
    'startzeit' => 'startzeit',
    'betriebstag' => 'betriebstag',
    'sonderinfo' => 'sonderinfo'
];
$allowedPattern = '/^[a-zA-Z0-9\-\:\s]*$/';

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
    if (empty($params['id'])) {
        http_response_code(400);
        echo "Fehler: 'id' erforderlich.";
        exit;
    }
    $daten = ladeCSV($csvDatei);
    $daten = array_filter($daten, fn($zeile) => $zeile['id'] !== $params['id']);
    speichereCSV($csvDatei, $spalten, $daten);
    echo "OK";
    exit;
}

// POST
if ($method === 'POST') {
    // tag: falls leer, aktuellen Tag setzen (YYYY-MM-DD)
    if (empty($_POST['betriebstag'])) {
        $_POST['betriebstag'] = date('Y-m-d');
    } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $_POST['betriebstag'])) {
        http_response_code(400);
        echo "Fehler: 'betriebstag' muss im Format YYYY-MM-DD sein.";
        exit;
    }

    // zeit: muss im Format hh:mm sein
    if (!empty($_POST['startzeit']) && !preg_match('/^\d{2}:\d{2}$/', $_POST['startzeit'])) {
        http_response_code(400);
        echo "Fehler: 'startzeit' muss im Format hh:mm sein.";
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

    $daten[] = $neueZeile;
    speichereCSV($csvDatei, $spalten, $daten);
    echo "OK";
    exit;
}

http_response_code(405);
echo "Methode nicht erlaubt.";
exit;
?>
