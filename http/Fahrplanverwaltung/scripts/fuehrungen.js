// Eventlistener, um bei Änderung neu zu laden
betriebstagInput.addEventListener('change', () => {
  ladeFuehrungen();
});

const fuehrungenVergangenheitAusblenden = document.getElementById('fuehrungenVergangenheitAusblenden');
fuehrungenVergangenheitAusblenden.addEventListener('change', () => {
  ladeFuehrungen();
});

setInterval(() => {
  if (fuehrungenVergangenheitAusblenden.checked) {
    ladeFuehrungen().catch(error => console.error('Führungen konnten nicht aktualisiert werden:', error));
  }
}, 30 * 1000);

function oeffneFuehrungModal() {
  const modal = document.getElementById('fuehrungModal');
  modal.style.display = 'flex';
}

function schliesseFuehrungModal() {
  document.getElementById('fuehrungModal').style.display = 'none';
}

async function ladeFuehrungen() {
  const res = await fetch(API_URL + 'fuehrungen/');
  const text = await res.text();
  const daten = text.startsWith('{') || text.startsWith('[')
    ? JSON.parse(text)
    : csvZuJson(text);

  const aktuellerTag = betriebstagInput.value; // YYYY-MM-DD

  const gefilterteFuehrungen = daten.filter(fuehrung => {
    return fuehrung.betriebstag === aktuellerTag
      && (!fuehrungenVergangenheitAusblenden.checked
        || !istMehrAlsZehnMinutenVergangen(fuehrung.betriebstag, fuehrung.startzeit));
  });

  gefilterteFuehrungen.sort((a, b) => {
    const zeitA = a.startzeit.split(':').map(Number);
    const zeitB = b.startzeit.split(':').map(Number);

    const minutenA = zeitA[0] * 60 + zeitA[1];
    const minutenB = zeitB[0] * 60 + zeitB[1];

    return minutenA - minutenB;
  });

  const tbody = document.querySelector('#fuehrungenTabelle tbody');
  tbody.innerHTML = '';
  gefilterteFuehrungen.forEach(fuehrung => {
    const tr = document.createElement('tr');

    //const tdBetriebstag = document.createElement('td');
    //tdBetriebstag.textContent = fuehrung.betriebstag;
    const tdLoeschen = document.createElement('td');
    const loeschenBtn = document.createElement('button');
    loeschenBtn.appendChild(createTrashIcon());
    loeschenBtn.addEventListener('click', () => loescheFuehrung(fuehrung.id));
    tdLoeschen.appendChild(loeschenBtn);
    tr.appendChild(tdLoeschen);

    const tdAbfuehrungszeit = document.createElement('td');
    tdAbfuehrungszeit.textContent = fuehrung.startzeit;
    tr.appendChild(tdAbfuehrungszeit);


    const tdAbweichung = document.createElement('td');
    tdAbweichung.textContent = fuehrung.abweichung ?? '-';
    tr.appendChild(tdAbweichung);

    const tdAktionen = document.createElement('td');

    const abweichungBtn = document.createElement('button');

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Fuehrung bestätigen';
    //confirmBtn.addEventListener('click', () => meldeAbweichung(fuehrung.id));
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

async function loescheFuehrung(id) {
  if (!confirm('Führung wirklich löschen?')) return;
  await fetch(API_URL + 'fuehrungen/', {
    method: 'DELETE',
    body: `id=${encodeURIComponent(id)}`
  });
  ladeFuehrungen();
}

document.getElementById('neueFuehrungBtn').addEventListener('click', () => {
    oeffneModal(document.getElementById('fuehrungModal'));
    document.getElementById('fuehrung-betriebstag').value = betriebstagInput.value;
});

function resetFuehrungForm(){
  document.getElementById('fuehrungForm').reset();

  const fuehrungBetriebstagInput = document.getElementById('fuehrung-betriebstag');
  //const today = new Date().toISOString().slice(0, 10);
  fuehrungBetriebstagInput.value = betriebstagInput.value;
}

document.getElementById('neueFuehrungAbbrechenBtn').addEventListener('click', () => {
    resetFuehrungForm();
    schliesseModal();
});

document.getElementById('fuehrungForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams();
    [...form.elements].forEach(el => {
        if (el.name) data.append(el.name, el.value);
    });
    await fetch(API_URL + 'fuehrungen/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data,
    });
    form.reset();
    resetFuehrungForm();
    
    schliesseModal(); 
    ladeFuehrungen();
});

resetFuehrungForm();

ladeFuehrungen();

