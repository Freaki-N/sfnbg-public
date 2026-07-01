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

FAHRT_BURGRING = {"ziel": "Burgring", "liniennummer": 0, "sonderzeichen": 22, "sonderinfo": "", "triebwagen": "521", "beiwagen_1": "", "beiwagen_2": ""}
FAHRT_ST_PETER = {"ziel": "Kleiner Rundkurs", "liniennummer": 0, "sonderzeichen": 0, "sonderinfo": "", "triebwagen": "135", "beiwagen_1": "", "beiwagen_2": ""}

ABFAHRTEN_ST_PETER = [
    (datetime(2000, 1, 1, 10, 15) + timedelta(minutes=30 * i)).strftime("%H:%M")
    for i in range(14)
]
ABFAHRTEN_BURGRING = [
    (datetime(2000, 1, 1, 10, 0) + timedelta(minutes=10 * i)).strftime("%H:%M")
    for i in range(43)
]

def generate():
    betriebstag_samstag = "2026-07-04"
    betriebstag_sonntag = "2026-07-05"

    fahrten_url = ENDPOINTS["fahrten"]
    #sondertexte_url = ENDPOINTS["sondertexte"]

    print("OK" if delete_record(fahrten_url, betriebstag_samstag) else "Error")
    print("OK" if delete_record(fahrten_url, betriebstag_sonntag) else "Error")

    fahrten_template_samstag = [
        {"abfahrtszeit": t3, **FAHRT_BURGRING}
        for t3 in ABFAHRTEN_BURGRING] + [

        {"abfahrtszeit": t4, **FAHRT_ST_PETER}
        for t4 in ABFAHRTEN_ST_PETER]

    #print(json.dumps(fahrten_template_samstag, indent=2))
    #print(json.dumps(fahrten_template_sonntag, indent=2))

    for fahrt in fahrten_template_samstag:
        payload = {
            "betriebstag": betriebstag_samstag,
            **fahrt
        }

        while True:
            try:
                post(fahrten_url, json=payload, headers=HEADERS_POST)
                break
            except Exception as e:
                print(f"Error posting data: {e}. Retrying in 5 seconds...")
                time.sleep(5)

    for fahrt in fahrten_template_samstag:
        payload = {
            "betriebstag": betriebstag_sonntag,
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
