import requests
import csv
import os
import time
import json
from datetime import datetime, date, timedelta

#BASE_URL = "http://display1/api"
BASE_URL = "http://localhost/api"
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

FAHRT_JUGENDSTIL = {"ziel": "Christuskirche", "liniennummer": 17, "sonderzeichen": 0, "sonderinfo": "", "triebwagen": "701", "beiwagen_1": "1023", "beiwagen_2": ""}
FAHRT_ZEPPELIN = {"ziel": "Moegeldorf", "liniennummer": 19, "sonderzeichen": 0, "sonderinfo": "", "triebwagen": "144", "beiwagen_1": "336", "beiwagen_2": ""}
FAHRT_BURGRING_TRAM = {"ziel": "Burgring", "liniennummer": 15, "sonderzeichen": 22, "sonderinfo": "", "triebwagen": "111", "beiwagen_1": "1304", "beiwagen_2": ""}
FAHRT_BURGRING_TRAM_KURZFAHRT = {"abfahrtszeit": "17:20", "ziel": "Hauptbahnhof", "liniennummer": 15, "sonderzeichen": 22, "sonderinfo": "Kurzfahrt", "triebwagen": "", "beiwagen_1": "", "beiwagen_2": ""}
FAHRT_BURGRING = {"ziel": "Burgring", "liniennummer": 0, "sonderzeichen": 22, "sonderinfo": "", "triebwagen": "521", "beiwagen_1": "", "beiwagen_2": ""}
FAHRT_ST_PETER = {"ziel": "Rundfahrt St. Peter", "liniennummer": 0, "sonderzeichen": 0, "sonderinfo": "", "triebwagen": "135", "beiwagen_1": "", "beiwagen_2": ""}
FAHRT_AUSSTELLUNG_LANG = {"ziel": "Frankenstr.", "liniennummer": 0, "sonderzeichen": 0, "sonderinfo": "Shuttlebus zur Fahrzeugausstellung", "triebwagen": "521", "beiwagen_1": "", "beiwagen_2": ""}
FAHRT_AUSSTELLUNG_KURZ = {"ziel": "Doku-Zentrum", "liniennummer": 0, "sonderzeichen": 0, "sonderinfo": "Shuttlebus zur Fahrzeugausstellung", "triebwagen": "768", "beiwagen_1": "", "beiwagen_2": ""}

ABFAHRTEN_BURGRING_TRAM_SAMSTAG_SONNTAG = ["10:20","11:20","12:20","13:20","14:20","15:20","16:20"]
ABFAHRTEN_JUGENDSTIL_SAMSTAG = ["10:40","11:40","12:40","13:40","14:40","15:40","16:40"]
ABFAHRTEN_ST_PETER_SAMSTAG = ["10:10", "11:10", "12:10", "13:10", "14:10", "15:10", "16:10"]
ABFAHRTEN_ZEPPELIN_SAMSTAG = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"]
ABFAHRTEN_BURGRING_SAMSTAG = ["10:50","11:50","12:50","13:50","14:50","15:50","16:50"]

ABFAHRTEN_ZEPPELIN_SONNTAG = ["14:00","15:00","16:00","17:00"]
ABFAHRTEN_JUGENDSTIL_SONNTAG = ["13:40","14:40","15:40","16:40"]
ABFAHRTEN_BURGRING_SONNTAG = ["13:50","14:50","15:50","16:50"]
ABFAHRTEN_ST_PETER_SONNTAG = ["14:30", "15:30", "16:30"]
ABFAHRTEN_AUSSTELLUNG_LANG = ["10:10", "10:30", "10:50", "11:10", "11:30", "11:50", "12:10", "12:30", "12:50"]
ABFAHRTEN_AUSSTELLUNG_KURZ = ["10:00", "10:20", "10:40", "11:00", "11:20", "11:40", "12:00", "12:20", "12:40", "13:00"]

def generate():
    betriebstag_samstag = "2026-07-04"
    betriebstag_sonntag = "2026-07-05"

    fahrten_url = ENDPOINTS["fahrten"]
    #sondertexte_url = ENDPOINTS["sondertexte"]

    print("OK" if delete_record(fahrten_url, betriebstag_samstag) else "Error")
    print("OK" if delete_record(fahrten_url, betriebstag_sonntag) else "Error")

    fahrten_template_samstag = [
        {"abfahrtszeit": t1, **FAHRT_JUGENDSTIL}
        for t1 in ABFAHRTEN_JUGENDSTIL_SAMSTAG] + [

        {"abfahrtszeit": t2, **FAHRT_ZEPPELIN}
        for t2 in ABFAHRTEN_ZEPPELIN_SAMSTAG] + [

        {"abfahrtszeit": t3, **FAHRT_BURGRING}
        for t3 in ABFAHRTEN_BURGRING_SAMSTAG] + [

        {"abfahrtszeit": t4, **FAHRT_ST_PETER}
        for t4 in ABFAHRTEN_ST_PETER_SAMSTAG] + [

        {"abfahrtszeit": t20, **FAHRT_BURGRING_TRAM}
        for t20 in ABFAHRTEN_BURGRING_TRAM_SAMSTAG_SONNTAG]
    
    fahrten_template_samstag.append(FAHRT_BURGRING_TRAM_KURZFAHRT)

    fahrten_template_sonntag = [
        {"abfahrtszeit": t5, **FAHRT_JUGENDSTIL}
        for t5 in ABFAHRTEN_JUGENDSTIL_SONNTAG] + [

        {"abfahrtszeit": t6, **FAHRT_ZEPPELIN}
        for t6 in ABFAHRTEN_ZEPPELIN_SONNTAG] + [

        {"abfahrtszeit": t7, **FAHRT_BURGRING}
        for t7 in ABFAHRTEN_BURGRING_SONNTAG] + [

        {"abfahrtszeit": t8, **FAHRT_ST_PETER}
        for t8 in ABFAHRTEN_ST_PETER_SONNTAG] + [

        {"abfahrtszeit": t9, **FAHRT_AUSSTELLUNG_LANG}
        for t9 in ABFAHRTEN_AUSSTELLUNG_LANG] + [

        {"abfahrtszeit": t10, **FAHRT_AUSSTELLUNG_KURZ}
        for t10 in ABFAHRTEN_AUSSTELLUNG_KURZ] + [

        {"abfahrtszeit": t21, **FAHRT_BURGRING_TRAM}
        for t21 in ABFAHRTEN_BURGRING_TRAM_SAMSTAG_SONNTAG]
    
    fahrten_template_sonntag.append(FAHRT_BURGRING_TRAM_KURZFAHRT)

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

    for fahrt in fahrten_template_sonntag:
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