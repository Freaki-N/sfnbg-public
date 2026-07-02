<?php
date_default_timezone_set('Europe/Berlin');

$csvFile = '/var/www/vhosts/nuernberg1999.de/WP_Backend/mikrocontroller.csv';

function leseCSV($file) {
    if (!file_exists($file)) return [];
    $daten = [];
    $zeilen = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $header = str_getcsv(array_shift($zeilen));
    foreach ($zeilen as $zeile) {
        $werte = str_getcsv($zeile);
        $daten[] = array_combine($header, $werte);
    }
    return $daten;
}

function schreibeCSV($file, $daten) {
    $f = fopen($file, 'w');
    fputcsv($f, array_keys($daten[0]));
    foreach ($daten as $zeile) {
        fputcsv($f, $zeile);
    }
    fclose($f);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mac = $_POST['mac_adresse'] ?? '';
    if (!$mac) exit;

    $daten = leseCSV($csvFile);
    $gefunden = false;
    $jetzt = date('Y-m-d H:i:s');

    foreach ($daten as &$ds) {
        if ($ds['mac_adresse'] === $mac) {
            $ds['prozessorzeit'] = $_POST['prozessorzeit'] ?? '';
            $ds['status'] = $_POST['status'] ?? '';
            $ds['linie'] = $_POST['linie'] ?? '';
            $ds['sonderzeichen'] = $_POST['sonderzeichen'] ?? '';
            $ds['ziel_oben'] = $_POST['ziel_oben'] ?? '';
            $ds['ziel_unten'] = $_POST['ziel_unten'] ?? '';
            $ds['letzte_meldung'] = $jetzt;
            $gefunden = true;
            break;
        }
    }

    if (!$gefunden) {
        $daten[] = [
            'mac_adresse' => $mac,
            'prozessorzeit' => $_POST['prozessorzeit'] ?? '',
            'status' => $_POST['status'] ?? '',
            'letzte_meldung' => $jetzt,
            'name' => '',
            'linie' => $_POST['linie'] ?? '',
            'sonderzeichen' => $_POST['sonderzeichen'] ?? '',
            'ziel_oben' => $_POST['ziel_oben'] ?? '',
            'ziel_unten' => $_POST['ziel_unten'] ?? ''
        ];

    }

    schreibeCSV($csvFile, $daten);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    $daten = leseCSV($csvFile);
    $jetzt = time();
    foreach ($daten as &$ds) {
        $lm = strtotime($ds['letzte_meldung'] ?? '1970-01-01 00:00:00');
        $ds['online'] = ($jetzt - $lm <= 120);
    }
    echo json_encode($daten);
    exit;
}
?>
