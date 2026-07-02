<?php
date_default_timezone_set('Europe/Berlin');

//$csvDatei = '/var/www/vhosts/nuernberg1999.de/WP_Backend/fahrten.csv';
$csvDatei = __DIR__ . '/../../../../data/WP_Backend/fahrten.csv';
$feldId = $_POST['id'] ?? null;
$jetzt = date('H:i');
$heute = date('Y-m-d');

if (empty($feldId)) {
    http_response_code(400);
    echo "Fehler: 'id' ist erforderlich.";
    exit;
}

// CSV einlesen
$fp = fopen($csvDatei, 'r');
$header = fgetcsv($fp);
$daten = [];
$updated = false;

while (($zeile = fgetcsv($fp)) !== false) {
    $eintrag = array_combine($header, $zeile);
    
    if ($eintrag['id'] === $feldId) {
        if ($eintrag['betriebstag'] === $heute && $eintrag['abfahrtszeit'] <= $jetzt) {
            $eintrag['abfahrtszeit_ist'] = $jetzt;
            $updated = true;
        }
    }

    $daten[] = $eintrag;
}
fclose($fp);

// Wenn aktualisiert, neu speichern
if ($updated) {
    $fp = fopen($csvDatei, 'w');
    fputcsv($fp, $header);
    foreach ($daten as $eintrag) {
        $reihe = [];
        foreach ($header as $feld) {
            $reihe[] = $eintrag[$feld] ?? '';
        }
        fputcsv($fp, $reihe);
    }
    fclose($fp);
    echo "OK";
} else {
    http_response_code(404);
    echo "Keine gültige Fahrt zum Aktualisieren gefunden.";
}
?>
