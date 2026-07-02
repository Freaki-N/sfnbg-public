// Eventlistener, um bei Änderung neu zu laden
betriebstagInput.addEventListener('change', () => {
  ladeSondertexte();
});

async function ladeSondertexte() {
  const res = await fetch(API_URL + 'sondertexte/');
  const text = await res.text();
  const daten = text.startsWith('{') || text.startsWith('[')
    ? JSON.parse(text)
    : csvZuJson(text);

  const aktuellerTag = betriebstagInput.value; // YYYY-MM-DD

  const gefilterteSondertexte = daten.filter(sondertext => sondertext.betriebstag === aktuellerTag);

  gefilterteSondertexte.sort((a, b) => {
    const zeitA = a.startzeit.split(':').map(Number);
    const zeitB = b.startzeit.split(':').map(Number);

    const minutenA = zeitA[0] * 60 + zeitA[1];
    const minutenB = zeitB[0] * 60 + zeitB[1];

    return minutenA - minutenB;
  });

  const tbody = document.querySelector('#sondertexteTabelle tbody');
  tbody.textContent = '';
  gefilterteSondertexte.forEach(sondertext => {
    const tr = document.createElement('tr');

    //const tdBetriebstag = document.createElement('td');
    //tdBetriebstag.textContent = sondertext.betriebstag;
    const tdLoeschen = document.createElement('td');
    const loeschenBtn = document.createElement('button');
    loeschenBtn.appendChild(createTrashIcon());
    loeschenBtn.addEventListener('click', () => loescheSondertext(sondertext.id));
    tdLoeschen.appendChild(loeschenBtn);
    tr.appendChild(tdLoeschen);

    const tdStartzeit = document.createElement('td');
    tdStartzeit.textContent = sondertext.startzeit;
    tr.appendChild(tdStartzeit);

    const tdLinie = document.createElement('td');
    tdLinie.textContent = sondertext.liniennummer;
    tr.appendChild(tdLinie);

    const tdErsteZeile = document.createElement('td');
    tdErsteZeile.textContent = sondertext.zeile1;
    tr.appendChild(tdErsteZeile);

    const tdZweiteZeile = document.createElement('td');
    tdZweiteZeile.textContent = sondertext.zeile2;
    tr.appendChild(tdZweiteZeile);

    const tdSonderzeichen = document.createElement('td');
    tdSonderzeichen.textContent = sondertext.sonderzeichen;
    tr.appendChild(tdSonderzeichen);


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

async function loescheSondertext(id) {
  if (!confirm('Sondertext wirklich löschen?')) return;
  await fetch(API_URL + 'sondertexte/', {
    method: 'DELETE',
    body: `id=${encodeURIComponent(id)}`
  });
  ladeSondertexte();
}

function resetSondertextForm(){
  document.getElementById('sondertextForm').reset();

  const sondertextBetriebstagInput = document.getElementById('sondertext-betriebstag');
  //const today = new Date().toISOString().slice(0, 10);
  sondertextBetriebstagInput.value = betriebstagInput.value;
}

document.getElementById('neuerSondertextBtn').addEventListener('click', () => {
    oeffneModal(document.getElementById('sondertextModal'));
    document.getElementById('sondertext-betriebstag').value = betriebstagInput.value;
});

document.getElementById('neueSondertextAbbrechenBtn').addEventListener('click', () => {
    resetSondertextForm();
    schliesseModal();
});

document.getElementById('sondertextForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const data = new URLSearchParams();
    [...form.elements].forEach(el => {
        if (el.name) data.append(el.name, el.value);
    });
    await fetch(API_URL + 'sondertexte/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data,
    });
    form.reset();
    resetSondertextForm();
    schliesseModal(); 
    ladeSondertexte();
});

resetSondertextForm();

ladeSondertexte();



