<?php
//$csvDatei = '/var/www/vhosts/nuernberg1999.de/WP_Backend/fahrten.csv';
$csvDatei = __DIR__ . '/../../../../data/WP_Backend/fahrten.csv';
$feldId = $_POST['id'] ?? null;

if (empty($feldId)) {
    http_response_code(400);
    echo "Fehler: 'id' ist erforderlich.";
    exit;
}

// Mögliche Felder, die aktualisiert werden dürfen
$aktualisierbareFelder = ['abfahrtszeit_prognose', 'triebwagen', 'beiwagen_1', 'beiwagen_2', 'sonderinfo'];

// CSV einlesen
$fp = fopen($csvDatei, 'r');
$header = fgetcsv($fp);
$daten = [];
$updated = false;

while (($zeile = fgetcsv($fp)) !== false) {
    $eintrag = array_combine($header, $zeile);

    if ($eintrag['id'] === $feldId) {
        foreach ($aktualisierbareFelder as $feld) {
            if (isset($_POST[$feld])) {
                $eintrag[$feld] = $_POST[$feld];
                $updated = true;
            }
        }
    }

    $daten[] = $eintrag;
}
fclose($fp);

// Wenn aktualisiert, zurückschreiben
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
    echo "Keine passende Fahrt oder keine Daten zum Aktualisieren gefunden.";
}
?>
