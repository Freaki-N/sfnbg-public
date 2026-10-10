if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => navigator.serviceWorker.getRegistrations())
    .then(registrations => Promise.all(registrations
      .filter(registration =>
        registration.scope === `${location.origin}/offline/` &&
        registration.active &&
        registration.active.scriptURL === `${location.origin}/offline/service-worker.js`)
      .map(registration => registration.unregister())))
    .catch(error => console.error('Service-Worker-Registrierung fehlgeschlagen:', error));
}

let connectionCheckInProgress = false;

function isOfflinePath() {
  return location.pathname === '/offline' || location.pathname.startsWith('/offline/');
}

function showOfflinePage() {
  if (isOfflinePath() || document.getElementById('offline-view')) {
    return;
  }

  const offlineView = document.createElement('main');
  offlineView.id = 'offline-view';
  offlineView.innerHTML = `
    <div class="offline-box">
      <h1>Keine Verbindung</h1>
      <p>Die Webseite ist momentan nicht erreichbar.</p>
      <button id="start-server" type="button">Server starten</button>
      <p id="shelly-status" role="status" aria-live="polite"></p>
      <button type="button">Erneut versuchen</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #offline-view {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #111;
      color: white;
      font: 16px Arial, sans-serif;
      text-align: center;
    }
    #offline-view .offline-box { max-width: 500px; }
    #offline-view h1 { margin-bottom: 20px; font-size: 42px; }
    #offline-view p { opacity: 0.8; }
    #offline-view button { padding: 10px 16px; cursor: pointer; }
  `;

  offlineView.querySelector('#start-server').addEventListener('click', startShellyPlug);
  offlineView.querySelector('button:last-of-type').addEventListener('click', checkServerConnection);
  document.head.appendChild(style);
  document.body.appendChild(offlineView);
}

async function startShellyPlug(event) {
  const button = event.currentTarget;
  const status = document.getElementById('shelly-status');
  button.disabled = true;
  status.textContent = 'ShellyPlug wird angefragt...';

  try {
    const response = await fetch('http://shellyplugs3-9070694d5594.local/relay/0?turn=on', {
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.ison === true) {
      status.textContent = 'Der ShellyPlug hat den Kontakt eingeschaltet.';
    } else if (result.ison === false) {
      status.textContent = 'Der ShellyPlug antwortet, aber der Kontakt ist nicht eingeschaltet.';
    } else {
      throw new Error('Die Shelly-Antwort enthält keinen gültigen Kontaktstatus.');
    }
  } catch (error) {
    status.textContent = `ShellyPlug-Anfrage fehlgeschlagen: ${error.message}`;
  } finally {
    button.disabled = false;
  }
}

async function checkServerConnection() {
  if (isOfflinePath() || connectionCheckInProgress) {
    return;
  }

  if (!navigator.onLine) {
    showOfflinePage();
    return;
  }

  connectionCheckInProgress = true;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) {
      showOfflinePage();
    } else if (document.getElementById('offline-view')) {
      location.reload();
    }
  } catch {
    showOfflinePage();
  } finally {
    window.clearTimeout(timeout);
    connectionCheckInProgress = false;
  }
}

window.addEventListener('offline', showOfflinePage);
window.addEventListener('online', checkServerConnection);
window.setInterval(checkServerConnection, 15000);
checkServerConnection();
