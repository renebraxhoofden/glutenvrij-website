import requests, json, datetime
from bs4 import BeautifulSoup

PRODUCTEN = {
    "Schar brood": "https://glutenvrijemarkt.com/schar-meesterbakkers-brood-wit",
    "Consenza pasta": "https://glutenvrijemarkt.com/consenza-fusilli-pasta"
}

resultaten = {}

for naam, url in PRODUCTEN.items():
    r = requests.get(url, timeout=10)
    soup = BeautifulSoup(r.text, 'html.parser')
    prijs_tag = soup.select_one('.price')  # Dit moet je straks aanpassen als het niet klopt
    prijs = prijs_tag.text.strip().replace('€','') if prijs_tag else 'N.v.t.'
    try:
        resultaten[naam] = float(prijs.replace(',','.'))
    except:
        resultaten[naam] = prijs

with open('prijzen.json','w') as f:
    json.dump({
        "datum": datetime.date.today().isoformat(),
        "prijzen": resultaten
    }, f, indent=2)

print("✅ prijzen.json geüpdatet")
