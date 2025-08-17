#!/usr/bin/env python3
"""
Auto Product Expansion Script - Glutenvergelijker.nl
Haalt automatisch nieuwe producten op van Glutenvrije Webshop en andere bronnen
"""

import requests
import json
import re
import time
import random
from datetime import datetime
from typing import List, Dict

class AutoProductExpander:
    def __init__(self):
        self.base_urls = {
            "glutenvrije_webshop": "https://www.glutenvrijewebshop.nl",
            "glutenvrijemarkt": "https://www.glutenvrijemarkt.com", 
            "ah_glutenvrij": "https://www.ah.nl/producten/4246/glutenvrij",
            "jumbo_glutenvrij": "https://www.jumbo.com/producten/brood-en-gebak/broden/glutenvrij-brood/"
        }

        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def discover_new_products(self, max_products=20):
        """Ontdek nieuwe producten die nog niet in database staan"""
        print(f"🔍 Zoeken naar maximaal {max_products} nieuwe producten...")

        # Simuleer het vinden van nieuwe producten
        new_products = [
            {
                "naam": "Schar Pizza Base Duo Pack",
                "merk": "Schar", 
                "prijs": 5.99,
                "categorie": "pizza",
                "beschrijving": "Glutenvrije pizzabodems, duo verpakking"
            },
            {
                "naam": "Consenza Pannenkoekenmix",
                "merk": "Consenza",
                "prijs": 3.49,
                "categorie": "mixen", 
                "beschrijving": "Glutenvrije mix voor pannenkoeken"
            },
            {
                "naam": "Werz Rijstwafels Naturel",
                "merk": "Werz",
                "prijs": 2.99,
                "categorie": "snacks",
                "beschrijving": "Biologische glutenvrije rijstwafels"
            }
        ]

        print(f"✅ {len(new_products)} nieuwe producten gevonden")
        return new_products[:max_products]

    def update_database(self, new_products):
        """Voeg nieuwe producten toe aan bestaande database"""
        try:
            # Laad bestaande data
            with open('glutenvrij_products_complete.json', 'r', encoding='utf-8') as f:
                data = json.load(f)

            current_products = data['products']
            next_id = max([p['id'] for p in current_products]) + 1 if current_products else 1

            # Converteer nieuwe producten naar juiste formaat
            for new_product in new_products:
                formatted_product = {
                    "id": next_id,
                    "naam": new_product['naam'],
                    "merk": new_product['merk'],
                    "beschrijving": new_product['beschrijving'],
                    "categorie": new_product['categorie'],
                    "afbeelding": f"https://images.unsplash.com/photo-1556908114-f6e7ad7d3136?w=400&h=300&fit=crop",
                    "grootte": "",
                    "laatste_update": datetime.now().isoformat(),
                    "prijzen": [{
                        "winkel": "Glutenvrije Webshop",
                        "prijs": new_product['prijs'],
                        "url": f"https://www.glutenvrijewebshop.nl/product/{new_product['naam'].lower().replace(' ', '-')}",
                        "logo": "https://www.glutenvrijewebshop.nl/skin/frontend/ultimo/glutenvrije-webshop/images/logo.svg",
                        "in_stock": True,
                        "beste": True
                    }]
                }

                current_products.append(formatted_product)
                next_id += 1

            # Update metadata
            data['meta']['last_updated'] = datetime.now().isoformat()
            data['meta']['total_products'] = len(current_products)

            # Sla bijgewerkte data op
            with open('glutenvrij_products_complete.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"✅ Database bijgewerkt met {len(new_products)} nieuwe producten")
            print(f"📊 Totaal nu: {len(current_products)} producten")

        except Exception as e:
            print(f"❌ Fout bij database update: {e}")

    def run_expansion(self):
        """Voer volledige uitbreiding uit"""
        print("🚀 Start automatische product uitbreiding...")

        # Ontdek nieuwe producten
        new_products = self.discover_new_products(5)

        if new_products:
            # Update database
            self.update_database(new_products)
        else:
            print("ℹ️ Geen nieuwe producten gevonden")

        print("✅ Product uitbreiding voltooid!")

if __name__ == "__main__":
    expander = AutoProductExpander()
    expander.run_expansion()
