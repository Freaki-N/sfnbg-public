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
$fahrzeugfelder = ['triebwagen', 'beiwagen_1', 'beiwagen_2'];

// CSV einlesen
$fp = fopen($csvDatei, 'r');
if ($fp === false) {
    http_response_code(500);
    echo "Fahrten-Datei kann nicht geöffnet werden.";
    exit;
}
$header = fgetcsv($fp);
$originalHeader = $header;
if (!in_array('block_id', $header, true)) {
    $header[] = 'block_id';
}
$daten = [];
$fahrtIndex = null;

while (($zeile = fgetcsv($fp)) !== false) {
    $eintrag = array_merge(
        array_fill_keys($header, ''),
        array_combine($originalHeader, $zeile)
    );
    $daten[] = $eintrag;
    if ($eintrag['id'] === $feldId) {
        $fahrtIndex = count($daten) - 1;
    }
}
fclose($fp);

if ($fahrtIndex === null) {
    http_response_code(404);
    echo "Keine passende Fahrt gefunden.";
    exit;
}

$fahrtVorher = $daten[$fahrtIndex];
$updated = false;
foreach ($aktualisierbareFelder as $feld) {
    if (isset($_POST[$feld])) {
        $daten[$fahrtIndex][$feld] = $_POST[$feld];
        $updated = true;
    }
}

if (!$updated) {
    http_response_code(404);
    echo "Keine Daten zum Aktualisieren gefunden.";
    exit;
}

$hatFahrzeug = static function ($fahrt) use ($fahrzeugfelder) {
    foreach ($fahrzeugfelder as $feld) {
        $fahrzeug = trim((string)($fahrt[$feld] ?? ''));
        if ($fahrzeug !== '' && $fahrzeug !== '-') {
            return true;
        }
    }
    return false;
};

$blockId = trim((string)($fahrtVorher['block_id'] ?? ''));
$betriebstag = (string)($fahrtVorher['betriebstag'] ?? '');
$neueFahrzeugkonfiguration = [];
foreach ($fahrzeugfelder as $feld) {
    $neueFahrzeugkonfiguration[$feld] = $daten[$fahrtIndex][$feld] ?? '';
}

if (
    !$hatFahrzeug($fahrtVorher)
    && $hatFahrzeug($daten[$fahrtIndex])
    && $blockId !== ''
    && $betriebstag !== ''
) {
    foreach ($daten as $index => &$eintrag) {
        if (
            $index !== $fahrtIndex
            && ($eintrag['block_id'] ?? '') === $blockId
            && ($eintrag['betriebstag'] ?? '') === $betriebstag
            && !$hatFahrzeug($eintrag)
        ) {
            foreach ($neueFahrzeugkonfiguration as $feld => $fahrzeug) {
                $eintrag[$feld] = $fahrzeug;
            }
        }
    }
    unset($eintrag);
}

$fp = fopen($csvDatei, 'w');
if ($fp === false) {
    http_response_code(500);
    echo "Fahrten-Datei kann nicht zum Schreiben geöffnet werden.";
    exit;
}
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
?>
