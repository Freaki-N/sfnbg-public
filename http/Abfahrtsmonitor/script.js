// Liste mit Wagennummern und den dazugehörigen Bildern
const wagenListe = [
  { nummer: "111", bild: "/icons/SW_T2.PNG" },
  { nummer: "144", bild: "/icons/SW_T4M.PNG" },
  { nummer: "204", bild: "/icons/SW_T2.PNG" },
  { nummer: "250", bild: "/icons/SW_T4.PNG" },
  { nummer: "305", bild: "/icons/SW_GT6.PNG" },
  { nummer: "363", bild: "/icons/SW_N8S.PNG" },
  { nummer: "701", bild: "/icons/SW_T2.PNG" },
  { nummer: "867", bild: "/icons/SW_T2.PNG" },
  { nummer: "876", bild: "/icons/SW_T2.PNG" },
  { nummer: "877", bild: "/icons/SW_T2.PNG" },
  { nummer: "910", bild: "/icons/SW_T2.PNG" },
  { nummer: "336", bild: "/icons/SW_B2.PNG" },
  { nummer: "1023", bild: "/icons/SW_B2.PNG" },
  { nummer: "1116", bild: "/icons/SW_B2.PNG" },
  { nummer: "1251", bild: "/icons/SW_B2.PNG" },
  { nummer: "1252", bild: "/icons/SW_B2.PNG" },
  { nummer: "1258", bild: "/icons/SW_B2.PNG" },
  { nummer: "1278", bild: "/icons/SW_B2.PNG" },
  { nummer: "1304", bild: "/icons/SW_B2.PNG" },
  { nummer: "1556", bild: "/icons/SW_B4.PNG" },
  { nummer: "1581", bild: "/icons/SW_B4.PNG" }
];

const LOGO_BUS = "/icons/bus_30x30.png";
const LOGO_TRAM = "/icons/tram_30x30.png";
const SYMBOL_BUS = "/icons/vehicle_bus_yellow_66x32.png";
const SYMBOL_TRAM = "/icons/vehicle_tram_yellow_66x32.png";

// Beispiel-Funktion: Bild anhand der Wagennummer suchen
function findeBild(nummer) {
  const wagen = wagenListe.find(item => item.nummer === nummer);
  return wagen ? wagen.bild : "/icons/standard_platzhalter.PNG";
}

function getHost() {
    return window.location.origin;
}

function getSelectedBetriebstag() {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('betriebstag') || params.get('date');
    if (p && /^\d{4}-\d{2}-\d{2}$/.test(p)) return p;

    const now = new Date();
    return (
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0")
    );
}

function getUrlFlag(name) {
    const params = new URLSearchParams(window.location.search);
    const v = params.get(name);
    if (!v) return false;
    return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
}

function parseTimeToDate(timeString) {
    if (!timeString) return null;

    // Unterstützt ISO oder HH:mm:ss
    let date = new Date(timeString);

    if (isNaN(date)) {
        const now = new Date();
        const parts = timeString.split(":");
        if (parts.length >= 2) {
            date = new Date();
            date.setHours(parts[0], parts[1], parts[2] || 0, 0);
        }
    }

    return date;
}

function getRelevantDeparture(fahrt) {
    return (
        fahrt.abfahrtszeit_ist ||
        fahrt.abfahrtszeit_prognose ||
        fahrt.abfahrtszeit
    );
}

function isDepartureValid(fahrt) {
    const now = new Date();

    const ist = fahrt.abfahrtszeit_ist;
    const prognose = fahrt.abfahrtszeit_prognose;
    const plan = fahrt.abfahrtszeit;

    let date = parseTimeToDate(ist || prognose || plan);
    if (!date) return false;

    if (ist) {
        // bis Ende der Minute sichtbar
        date.setSeconds(59, 999);
    } else {
        // +2 Minuten bei Prognose oder Plan
        date = new Date(date.getTime() + 2 * 60000);
    }

    return date >= now;
}

function formatDeparture(timeString, showPlannedOnly) {
    const date = parseTimeToDate(timeString);
    if (!date) return document.createTextNode("-");

    if (showPlannedOnly) {
        return document.createTextNode(date.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
        }));
    }

    const now = new Date();
    const diffMs = date - now;
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin <= 0) {
        const spanElem = document.createElement("span");
        spanElem.setAttribute("class", "blink-tram");
        spanElem.textContent = "0 Min.";
        return spanElem;
    }

    // Wenn mehr als 60 Minuten → Uhrzeit anzeigen
    if (diffMin > 60) {
        return document.createTextNode(date.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit"
        }));
    }

    return document.createTextNode(diffMin + " Min.");
}

// Vorbereitung für zukünftige Icons
function buildVehicleIcons(fahrt) {
    const icons = [];
    
    const span = document.createElement('span')

    const imgTriebwagen = document.createElement('img');  
    const imgBeiwagen1 = document.createElement('img');  
    const imgBeiwagen2 = document.createElement('img');  
    //img.alt = "Test";
    //symbolCell.appendChild(img);

    imgTriebwagen.src = findeBild(fahrt.triebwagen);
    imgBeiwagen1.src = findeBild(fahrt.beiwagen_1);
    imgBeiwagen2.src = findeBild(fahrt.beiwagen_2);


    /*if (fahrt.triebwagen == "250") {
        
        icons.push("🚋");
    }
    if (fahrt.beiwagen_1  == "1581") {
        imgBeiwagen1.src = PATH_ICONS + "250.PNG";
        icons.push("➕");
    }
    if (fahrt.beiwagen_2) {
        icons.push("➕");
    }*/

    if("/icons/standard_platzhalter.PNG" === imgTriebwagen.src) {
        imgTriebwagen.style.display = "none";
    }       
    if("/icons/standard_platzhalter.PNG" === imgBeiwagen1.src) {
        imgBeiwagen1.style.display = "none";
    }   
    if("/icons/standard_platzhalter.PNG" === imgBeiwagen2.src) {
        imgBeiwagen2.style.display = "none";
    }   

    span.appendChild(imgBeiwagen2);
    span.appendChild(imgBeiwagen1);
    span.appendChild(imgTriebwagen);

    //return icons.join(" ");
    return span;
}

function renderTable(data) {
    const tbody = document.getElementById("table-body");
    tbody.textContent = "";

    const selectedBetriebstag = getSelectedBetriebstag();
    const keepDepartures = getUrlFlag('keep') || getUrlFlag('keepDepartures') || getUrlFlag('stay') || getUrlFlag('persist');
    const hideLineNumber = getUrlFlag('hideLiniennummer') || getUrlFlag('hideLineNumber') || getUrlFlag('hideLine');

    if (keepDepartures) {
        data = data.filter(fahrt => fahrt.betriebstag === selectedBetriebstag);
    } else {
        data = data.filter(fahrt => isDepartureValid(fahrt));
    }

    data.sort((a, b) => {
        const timeA = parseTimeToDate(keepDepartures ? a.abfahrtszeit || getRelevantDeparture(a) : getRelevantDeparture(a));
        const timeB = parseTimeToDate(keepDepartures ? b.abfahrtszeit || getRelevantDeparture(b) : getRelevantDeparture(b));

        if (!timeA && !timeB) return 0;
        if (!timeA) return 1;
        if (!timeB) return -1;

        return timeA - timeB;
    });

    data.forEach(fahrt => {
        const tr = document.createElement("tr");

        const line = document.createElement("td");
        line.className = "line col-line";
        const imgTram = document.createElement("img")
        imgTram.src = ["507", "521", "768", "833", "135", "Postbus"].includes(fahrt.triebwagen) ? LOGO_BUS : LOGO_TRAM;
        line.appendChild(imgTram);
        const lineNumber = String(fahrt.liniennummer || "").trim();
        if (!hideLineNumber && lineNumber && lineNumber !== "0") {
            line.appendChild(document.createTextNode(" "));
            line.appendChild(document.createTextNode(lineNumber));
        }
        //line.textContent = fahrt.liniennummer;

        const direction = document.createElement("td");
        direction.className = "col-direction";
        direction.textContent = fahrt.ziel;

        const info = document.createElement("td");
        info.className = "col-info";
        
        // Erstelle inneren Span für Marquee-Animation
        const infoText = document.createElement("span");
        infoText.className = "col-info-text";
        if (fahrt.sonderinfo != "") {
            infoText.textContent = "+++ " + fahrt.sonderinfo + " +++";
        } else {
            infoText.textContent = fahrt.sonderinfo || "";
        }
        info.appendChild(infoText);

        // Prüfe ob Text überläuft und setze Marquee wenn nötig
        setTimeout(() => {
            if (infoText.scrollWidth > info.clientWidth) {
                infoText.setAttribute("data-overflow", "true");
            }
        }, 0);

        const vehicles = document.createElement("td");
        vehicles.className = "col-vehicles";
        vehicles.appendChild(buildVehicleIcons(fahrt));

        const departure = document.createElement("td");
        departure.className = "departure col-departure";
        const displayTime = keepDepartures ? (fahrt.abfahrtszeit || getRelevantDeparture(fahrt)) : getRelevantDeparture(fahrt);
        departure.appendChild(formatDeparture(displayTime, keepDepartures));

        tr.appendChild(line);
        tr.appendChild(direction);
        tr.appendChild(info);
        tr.appendChild(vehicles);
        tr.appendChild(departure);

        if (fahrt.betriebstag === selectedBetriebstag) {
            tbody.appendChild(tr);
        }
        
    });
}

async function loadData() {
    try {
        const optionen = {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json'
            }
        };
        const response = await fetch(API_URL_FAHRTEN, optionen);

        const contentType = response.headers.get("content-type");

        let data;

        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // CSV fallback
            const text = await response.text();
            data = parseCSV(text);
        }

        renderTable(data);

    } catch (err) {
        console.error("Fehler beim Laden:", err);
    }
}

// Initial + Refresh alle 30s
loadData();
setInterval(loadData, 30000);