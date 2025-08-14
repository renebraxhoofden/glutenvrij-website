# Mijn eerste prijs-ophaal programma!

# Een lijst met producten en prijzen
producten = [
    {
        "naam": "Schär Wit Brood",
        "prijzen": {
            "Albert Heijn": 3.19,
            "Jumbo": 3.29,
            "Glutenvrijemarkt": 2.95
        }
    },
    {
        "naam": "Consenza Pasta",
        "prijzen": {
            "Albert Heijn": 2.49,
            "Jumbo": 2.39,
            "Glutenvrijemarkt": 2.29
        }
    }
]

# Zoek de goedkoopste prijs voor elk product
for product in producten:
    naam = product["naam"]
    prijzen = product["prijzen"]
    
    # Vind de goedkoopste winkel
    goedkoopste_winkel = min(prijzen, key=prijzen.get)
    goedkoopste_prijs = prijzen[goedkoopste_winkel]
    
    print(f"🍞 {naam}")
    print(f"💰 Beste deal: €{goedkoopste_prijs} bij {goedkoopste_winkel}")
    print("---")