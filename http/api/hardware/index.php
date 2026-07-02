<?php
//$zielDatei = '/var/www/vhosts/nuernberg1999.de/WP_Backend/hardware.csv';
$zielDatei = __DIR__ . '/../../../data/WP_Backend/hardware.csv';
$spalten = [
    'typ',
    'liniennummer',
    'sonderzeichen',
    'ziel_oben',
    'ziel_unten',
    'sonderinfo',
    'abfahrtszeit',
    'max_vorlauf',
    'betriebstag',
    'verkehrstage',
    'abfahrtszeit_prognose',
    'abfahrtszeit_ist'
];

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

function mappeZeilen($quelle, $typ, $zuordnung, $spalten) {
    $ergebnis = [];
    foreach ($quelle as $eintrag) {
        $zeile = array_fill_keys($spalten, '');
        $zeile['typ'] = $typ;
        foreach ($zuordnung as $quelleFeld => $zielFeld) {
            if (isset($eintrag[$quelleFeld])) {
                $zeile[$zielFeld] = $eintrag[$quelleFeld];
            }
        }
        $ergebnis[] = $zeile;
    }
    return $ergebnis;
}

$filter = $_GET['filter'] ?? 'heute';
$heute = date('Y-m-d');

//$fahrten = ladeCSV('/var/www/vhosts/nuernberg1999.de/WP_Backend/fahrten.csv');
//$fuehrungen = ladeCSV('/var/www/vhosts/nuernberg1999.de/WP_Backend/fuehrungen.csv');
//$sondertexte = ladeCSV('/var/www/vhosts/nuernberg1999.de/WP_Backend/sondertexte.csv');

$fahrten = ladeCSV(__DIR__ . '/../../../data/WP_Backend/fahrten.csv');
$fuehrungen = ladeCSV(__DIR__ . '/../../../data/WP_Backend/fuehrungen.csv');
$sondertexte = ladeCSV(__DIR__ . '/../../../data/WP_Backend/sondertexte.csv');

$alle = [];

$alle = array_merge($alle, mappeZeilen($fahrten, '0', [
    'abfahrtszeit' => 'abfahrtszeit',
    'liniennummer' => 'liniennummer',
    'sonderzeichen' => 'sonderzeichen',
    'ziel' => 'ziel_oben',
    'betriebstag' => 'betriebstag',
    'abfahrtszeit_prognose' => 'abfahrtszeit_prognose',
    'abfahrtszeit_ist' => 'abfahrtszeit_ist'
], $spalten));

$alle = array_merge($alle, mappeZeilen($fuehrungen, '2', [
    'startzeit' => 'abfahrtszeit',
    'betriebstag' => 'betriebstag',
    'sonderinfo' => 'sonderinfo'
], $spalten));

$alle = array_merge($alle, mappeZeilen($sondertexte, '1', [
    'startzeit' => 'abfahrtszeit',
    'betriebstag' => 'betriebstag',
    'sonderinfo' => 'sonderinfo',
    'zeile1' => 'ziel_oben',
    'zeile2' => 'ziel_unten',
    'liniennummer' => 'liniennummer',
    'sonderzeichen' => 'sonderzeichen'
], $spalten));

// Filter anwenden
if ($filter === 'heute') {
    $alle = array_filter($alle, function($zeile) use ($heute) {
        return empty($zeile['betriebstag']) || $zeile['betriebstag'] === $heute;
    });
}

// CSV-Datei schreiben
$fp = fopen($zielDatei, 'w');
fputcsv($fp, $spalten, ",", '"', "\\");
foreach ($alle as $zeile) {
    $reihe = [];
    foreach ($spalten as $feld) {
        $reihe[] = $zeile[$feld];
    }
    fputcsv($fp, $reihe, ",", '"', "\\");
}
fclose($fp);

// CSV-Datei zurückgeben
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="hardware.csv"');
readfile($zielDatei);
exit;
?>
