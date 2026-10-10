// Direkt beim Laden die Eingabe mit aktuellem Datum füllen
const betriebstagInput = document.getElementById('betriebstagSelector');
const heute = new Date().toISOString().slice(0, 10);
betriebstagInput.value = heute;

// Uhrzeit & Datum aktualisieren
function updateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('de-DE');
  const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  document.getElementById('current-date').textContent = `Datum: ${date}`;
  document.getElementById('current-time').textContent = `Uhrzeit: ${time}`;
}
setInterval(updateTime, 1000);
updateTime();

// Verbindungssymbol simulieren (online/offline)
function simulateConnectionStatus() {
  const isOnline = navigator.onLine;
  const statusEl = document.getElementById('connection-status');
  statusEl.className = 'status-icon ' + (isOnline ? 'online' : 'offline');
  statusEl.title = isOnline ? 'Verbindung OK' : 'Keine Verbindung';
}
window.addEventListener('online', simulateConnectionStatus);
window.addEventListener('offline', simulateConnectionStatus);
simulateConnectionStatus();

// Profimodus Umschalten (Platzhalter)
document.getElementById('toggle-mode').addEventListener('click', () => {
  alert('Profimodus wurde umgeschaltet.');
});

// Einstellungen öffnen (Platzhalter)
document.getElementById('settings-btn').addEventListener('click', () => {
  alert('Einstellungen geöffnet.');
});

function createTrashIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "15");
  svg.setAttribute("height", "15");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M9 3v1H4v2h1v14a2 2 0 002 2h10a2 2 0 002-2V6h1V4h-5V3H9zm2 2h2v1h-2V5zM7 8h2v10H7V8zm4 0h2v10h-2V8zm4 0h2v10h-2V8z");

  svg.appendChild(path);
  return svg;
}

function createEditIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "15");
  svg.setAttribute("height", "15");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z");

  svg.appendChild(path);
  return svg;
}

function createClockIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "15");
  svg.setAttribute("height", "15");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z");

  svg.appendChild(path);
  return svg;
}

function createCheckIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "15");
  svg.setAttribute("height", "15");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z");

  svg.appendChild(path);
  return svg;
}

function differenzInMinuten(zeit1, zeit2) {
  const [h1, m1] = zeit1.split(':').map(Number);
  const [h2, m2] = zeit2.split(':').map(Number);

  const minuten1 = h1 * 60 + m1;
  const minuten2 = h2 * 60 + m2;

  var result = minuten2 - minuten1

  if(Number.isNaN(result)){
    return 0;
  }

  return result;
}

function istMehrAlsZehnMinutenVergangen(betriebstag, uhrzeit) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(betriebstag ?? '') || !/^\d{2}:\d{2}(?::\d{2})?$/.test(uhrzeit ?? '')) {
    return false;
  }

  const zeitpunkt = new Date(`${betriebstag}T${uhrzeit.length === 5 ? `${uhrzeit}:00` : uhrzeit}`);
  return !Number.isNaN(zeitpunkt.getTime()) && Date.now() - zeitpunkt.getTime() > 10 * 60 * 1000;
}
