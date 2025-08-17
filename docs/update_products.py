#!/usr/bin/env python3
"""
Glutenvrij Product Price Updater
Automatically updates product prices from various Dutch supermarkets
"""

import json
import requests
import random
from datetime import datetime
import time
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import our scraper classes
from glutenvrij_scraper import GlutenFreeProductScraper, structure_products_for_website

def main():
    """Main update function"""
    print("🚀 Starting Glutenvrij Product Update")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Initialize updater
    updater = AutomaticProductUpdater()

    # Load existing data
    old_data = updater.load_existing_data()

    # Update products
    new_data = updater.update_products()

    # Check for price changes
    if old_data:
        changes = updater.get_price_changes(old_data, new_data)

        if changes:
            print(f"\n💰 {len(changes)} prijswijzigingen gedetecteerd:")
            for change in changes[:5]:  # Show first 5
                direction = "📈" if change['verandering_pct'] > 0 else "📉"
                print(f"  {direction} {change['product']} bij {change['winkel']}: "
                      f"€{change['oude_prijs']} → €{change['nieuwe_prijs']} "
                      f"({change['verandering_pct']:+.1f}%)")
        else:
            print("\n✅ Geen significante prijswijzigingen")

    print("\n🎯 Update succesvol voltooid!")

if __name__ == "__main__":
    main()
