// Eventlistener, um bei Änderung neu zu laden
betriebstagInput.addEventListener('change', () => {
  ladeFahrten();
});

const triebwagen = ["-", "111", "144", "204", "250", "305", "363", "701", "867", "876", "877", "910", "10xx", "11xx", "12xx", "20xx", "507", "521", "768", "833", "135", "Postbus"];
const beiwagen_1 = ["-", "336", "1023", "1166", "1251", "1252", "1258", "1278", "1304", "1556", "1581"];
const beiwagen_2 = ["-", "1251", "1252", "1258", "1278", "1304"];

function setFahrtBearbeitenForm(fahrt){
  document.getElementById('fahrtForm').reset();

  const fahrtVerspaetungInput = document.getElementById('fahrt-verspaetung');
  fahrtVerspaetungInput.value = fahrt.abfahrtszeit_prognose;

  if(fahrt.abfahrtszeit_prognose == "" || fahrt.abfahrtszeit_prognose == undefined)
    fahrtVerspaetungInput.value = fahrt.abfahrtszeit;

  const fahrtIdInput = document.getElementById('fahrt-bearbeiten-id');
  fahrtIdInput.value = fahrt.id;

  const selectTriebwagen = document.getElementById("sel-triebwagen");
  const selectBeiwagen1 = document.getElementById("sel-beiwagen-1");
  const selectBeiwagen2 = document.getElementById("sel-beiwagen-2");

  selectTriebwagen.textContent = "";
  selectBeiwagen1.textContent = "";
  selectBeiwagen2.textContent = "";

  triebwagen.forEach(nr => {
    const option = document.createElement("option");
    option.value = nr;
    option.textContent = nr;
    if(fahrt.triebwagen == nr){
      option.selected = true;
    }
    selectTriebwagen.appendChild(option);
  });

  beiwagen_1.forEach(nr => {
    const option = document.createElement("option");
    option.value = nr;
    option.textContent = nr;
    if(fahrt.beiwagen_1 == nr){
      option.selected = true;
    }
    selectBeiwagen1.appendChild(option);
  });

  beiwagen_2.forEach(nr => {
    const option = document.createElement("option");
    option.value = nr;
    option.textContent = nr;
    if(fahrt.beiwagen_2 == nr){
      option.selected = true;
    }
    selectBeiwagen2.appendChild(option);
  });

  const sonderinfoInput = document.getElementById('edit-sonderinfo');
  sonderinfoInput.value = fahrt.sonderinfo ?? ''; 
}

async function ladeFahrten() {
  const res = await fetch(API_URL + 'fahrten/');
  const text = await res.text();
  const daten = text.startsWith('{') || text.startsWith('[')
    ? JSON.parse(text)
    : parseCSV(text);

  const aktuellerTag = betriebstagInput.value; // YYYY-MM-DD

  const gefilterteFahrten = daten.filter(fahrt => fahrt.betriebstag === aktuellerTag);

  gefilterteFahrten.sort((a, b) => {
    const zeitA = a.abfahrtszeit.split(':').map(Number);
    const zeitB = b.abfahrtszeit.split(':').map(Number);

    const minutenA = zeitA[0] * 60 + zeitA[1];
    const minutenB = zeitB[0] * 60 + zeitB[1];

    return minutenA - minutenB;
  });

  const tbody = document.querySelector('#fahrtenTabelle tbody');
  tbody.textContent = '';
  gefilterteFahrten.forEach(fahrt => {
    const tr = document.createElement('tr');

    //const tdBetriebstag = document.createElement('td');
    //tdBetriebstag.textContent = fahrt.betriebstag;
    const tdLoeschen = document.createElement('td');
    const loeschenBtn = document.createElement('button');
    loeschenBtn.appendChild(createTrashIcon());
    loeschenBtn.addEventListener('click', () => loescheFahrt(fahrt.id));
    tdLoeschen.appendChild(loeschenBtn);
    tr.appendChild(tdLoeschen);

    const tdAbfahrtszeit = document.createElement('td');
    const spanAbweichung = document.createElement('td');
    var abfahrtszeit_prognose = differenzInMinuten(fahrt.abfahrtszeit, fahrt.abfahrtszeit_prognose)
    if(abfahrtszeit_prognose >= 0)
      abfahrtszeit_prognose = "+" + abfahrtszeit_prognose;
    spanAbweichung.textContent = abfahrtszeit_prognose ?? "-";
    
    //tr.appendChild(tdAbweichung);
    // Farbliche Codierung basierend auf Abweichungsgröße
    const minuten = parseInt(abfahrtszeit_prognose);
    if (minuten === 0 || isNaN(minuten)) {
      tdAbfahrtszeit.classList.add('deviation-none');
    } else if (minuten > 0 && minuten <= 5) {
      tdAbfahrtszeit.classList.add('deviation-small');
    } else if (minuten > 5 && minuten <= 15) {
      tdAbfahrtszeit.classList.add('deviation-medium');
    } else if (minuten > 15) {
      tdAbfahrtszeit.classList.add('deviation-large');
    } else if (minuten < 0 && minuten >= -5) {
      tdAbfahrtszeit.classList.add('deviation-early-small');
    } else if (minuten < -5) {
      tdAbfahrtszeit.classList.add('deviation-early-large');
    }

    tdAbfahrtszeit.textContent = fahrt.abfahrtszeit + " " + abfahrtszeit_prognose;
    //tdAbfahrtszeit.appendChild(spanAbweichung);
    tr.appendChild(tdAbfahrtszeit);

    const tdLinie = document.createElement('td');
    tdLinie.textContent = fahrt.liniennummer;
    tr.appendChild(tdLinie);

    const tdZiel = document.createElement('td');
    tdZiel.textContent = fahrt.ziel;
    tr.appendChild(tdZiel);

    
    const tdSonderinfo = document.createElement('td');
    tdSonderinfo.textContent = fahrt.sonderinfo ?? "-";
    tr.appendChild(tdSonderinfo);

    const tdAktionen = document.createElement('td');

    const abweichungBtn = document.createElement('button');
    abweichungBtn.appendChild(createClockIcon());
    abweichungBtn.addEventListener('click', () => {
      setFahrtBearbeitenForm(fahrt);
      oeffneModal(document.getElementById('fahrtBearbeitenModal'))
    });
    tdAktionen.appendChild(abweichungBtn);

    const confirmBtn = document.createElement('button');
    confirmBtn.appendChild(createCheckIcon());
    confirmBtn.addEventListener('click', () => bestätigeAbfahrt(fahrt.id));

    if(fahrt.abfahrtszeit_ist == "")
      tdAktionen.appendChild(confirmBtn);

    tr.appendChild(tdAktionen);
    tbody.appendChild(tr);
    });
}

function csvZuJson(csv) {
  const [header, ...rows] = csv.trim().split('\n');
  const keys = header.split(',');
  return rows.map(row => {
    const values = row.split(',');
    return Object.fromEntries(keys.map((k, i) => [k.trim(), values[i].trim()]));
  });
}

async function loescheFahrt(id) {
  if (!confirm('Fahrt wirklich löschen?')) return;
  await fetch(API_URL + 'fahrten/', {
    method: 'DELETE',
    body: `id=${encodeURIComponent(id)}`
  });
  ladeFahrten();
}

function bestätigeAbfahrt(id) {
  fetch(API_URL + 'fahrten/bestaetigen/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `id=${encodeURIComponent(id)}`,
  });
  ladeFahrten();
}

function resetFahrtForm(){
  document.getElementById('fahrtForm').reset();

  const fahrtBetriebstagInput = document.getElementById('abf-betriebstag');
  //const today = new Date().toISOString().slice(0, 10);
  fahrtBetriebstagInput.value = betriebstagInput.value;
}

document.getElementById('fahrtBearbeitenAbbrechenBtn').addEventListener('click', () => {
    //resetFahrtForm();
    schliesseModal();
});

document.getElementById('neueFahrtBtn').addEventListener('click', () => {
    oeffneModal(document.getElementById('fahrtModal'));
    document.getElementById('abf-betriebstag').value = betriebstagInput.value;
});

document.getElementById('neueFahrtAbbrechenBtn').addEventListener('click', () => {
    resetFahrtForm();
    schliesseModal();
});

document.getElementById('fahrtForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams();
    [...form.elements].forEach(el => {
        if (el.name) data.append(el.name, el.value);
    });
    await fetch(API_URL + 'fahrten/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data,
    });
    form.reset();
    resetFahrtForm();
    schliesseModal(); 
    ladeFahrten();
});

document.getElementById('fahrtBearbeitenForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams();
    [...form.elements].forEach(el => {
        if (el.name) data.append(el.name, el.value);
    });
    await fetch(API_URL + 'fahrten/bearbeiten/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data,
    });
    form.reset();
    schliesseModal(); 
    ladeFahrten();
});

resetFahrtForm();

ladeFahrten();



