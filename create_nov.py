import requests
import csv
import os
import time
import json
from datetime import datetime, date, timedelta

BASE_URL = "http://display1/api"
#BASE_URL = "http://localhost/api"
#BASE_URL = "http://api.nuernberg1999.de/WerkPeter"
HEADERS_DELETE = {}
HEADERS_GET = {"Content-Type": "application/json", "Accept": "text/csv"}
HEADERS_POST = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "*/*"}
STATE_FILE = "generated_year.txt"

ENDPOINTS = {
    "fahrten": f"{BASE_URL}/fahrten/index.php",
    "sondertexte": f"{BASE_URL}/sondertexte/",
    "fuehrungen": f"{BASE_URL}/fuehrungen/",
}

# -------------------------
# Helper functions
# -------------------------

def delete_record(endpoint, betriebstag):
    r = requests.delete(endpoint, data={"betriebstag": betriebstag}, headers=HEADERS_DELETE)
    print(f"DELETE {endpoint} {betriebstag} - Status: {r.status_code}")
    print(f"Response: {r.text}")
    return r.status_code == 200

def post(url, json, headers):
    dataStr = ""
    for obj in json:
        dataStr += f"{obj}={json[obj]}&"
    response = requests.post(url, data=json, headers=headers)
    respText = response.text.replace('\n', '\\n')
    print(f"POST {url} {response.status_code}: {respText}")
    time.sleep(0.1)

FAHRT_SHUTTLE_1 = {"ziel": "Ofenwerk", "block_id": "75.1", "liniennummer": 0, "sonderzeichen": 0, "sonderinfo": "Shuttle zur Ausstellung 1. Modell-Bahn-Nürnberg", "triebwagen": "", "beiwagen_1": "", "beiwagen_2": ""}
FAHRT_SHUTTLE_2 = {"ziel": "Ofenwerk", "block_id": "75.2", "liniennummer": 0, "sonderzeichen": 0, "sonderinfo": "Shuttle zur Ausstellung 1. Modell-Bahn-Nürnberg", "triebwagen": "", "beiwagen_1": "", "beiwagen_2": ""}

FAHRT_BURGRING_TRAM = {"ziel": "Burgring", "block_id": "15.1", "liniennummer": 15, "sonderzeichen": 22, "sonderinfo": "", "triebwagen": "", "beiwagen_1": "", "beiwagen_2": ""}
FAHRT_BURGRING_TRAM_KURZFAHRT = {"abfahrtszeit": "17:20", "ziel": "Hauptbahnhof", "block_id": "15.1", "liniennummer": 15, "sonderzeichen": 22, "sonderinfo": "Kurzfahrt", "triebwagen": "", "beiwagen_1": "", "beiwagen_2": ""}

ABFAHRTEN_BURGRING_TRAM_SAMSTAG_SONNTAG = ["10:20","11:20","12:20","13:20","14:20","15:20","16:20"]

ABFAHRTEN_SHUTTLE_1 = [
    (datetime(2000, 1, 1, 10, 0) + timedelta(hours=i)).strftime("%H:%M")
    for i in range(8)
]
ABFAHRTEN_SHUTTLE_2 = [
    (datetime(2000, 1, 1, 10, 30) + timedelta(hours=i)).strftime("%H:%M")
    for i in range(8)
]


def generate():
    betriebstag_samstag = "2026-11-07"
    betriebstag_sonntag = "2026-11-08"

    fahrten_url = ENDPOINTS["fahrten"]
    #sondertexte_url = ENDPOINTS["sondertexte"]

    print("OK" if delete_record(fahrten_url, betriebstag_samstag) else "Error")
    print("OK" if delete_record(fahrten_url, betriebstag_sonntag) else "Error")

    fahrten_template = [
        {"abfahrtszeit": time, **FAHRT_SHUTTLE_1}
        for time in ABFAHRTEN_SHUTTLE_1
    ] + [
        {"abfahrtszeit": time, **FAHRT_SHUTTLE_2}
        for time in ABFAHRTEN_SHUTTLE_2
    ] + [
        {"abfahrtszeit": t21, **FAHRT_BURGRING_TRAM}
        for t21 in ABFAHRTEN_BURGRING_TRAM_SAMSTAG_SONNTAG
    ]

    fahrten_template.append(FAHRT_BURGRING_TRAM_KURZFAHRT)

    for betriebstag in (betriebstag_samstag, betriebstag_sonntag):
        for fahrt in fahrten_template:
            payload = {
                "betriebstag": betriebstag,
                **fahrt
            }

            while True:
                try:
                    post(fahrten_url, json=payload, headers=HEADERS_POST)
                    break
                except Exception as e:
                    print(f"Error posting data: {e}. Retrying in 5 seconds...")
                    time.sleep(5)

    print("Generation complete")


# -------------------------
# Main
# -------------------------

if __name__ == "__main__":
    generate()
