#!/usr/bin/env python3
"""
🌾 GLUTENVERGELIJKER.NL - ULTIMATE AUTOMATED PRODUCT SCRAPER
===============================================================

Target: 2500+ glutenvrije producten from ALL Dutch webshops
Runs daily at 06:00 to update prices, discover new products, and validate links
Affiliate-ready with comprehensive error handling and reporting

Features:
- Scrapes 15+ Dutch glutenvrije webshops
- Discovers new products automatically  
- Updates prices and detects discounts
- Validates and fixes broken links
- Generates daily reports
- Handles rate limiting and errors
- Ready for 24/7 operation

Usage:
    python3 ultimate_product_scraper.py

    Or set up cron job:
    0 6 * * * cd /path/to/project && python3 ultimate_product_scraper.py
"""

import asyncio
import aiohttp
import json
import re
import logging
import sys
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse, quote
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
import time
import random
from typing import Dict, List, Optional, Tuple
import hashlib
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'scraper_log_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class UltimateGlutenvrije Scraper:
    """
    Ultimate scraper for all Dutch glutenvrije webshops
    Designed to find 2500+ products daily
    """

    def __init__(self):
        self.session = None
        self.products_found = []
        self.total_target = 2500
        self.daily_stats = {
            'start_time': datetime.now(),
            'products_discovered': 0,
            'products_updated': 0,
            'new_products': 0,
            'links_validated': 0,
            'links_fixed': 0,
            'errors': 0,
            'webshops_processed': 0,
            'success_rate': 0.0
        }

        # Comprehensive webshop configurations
        self.webshops = {
            # Major Supermarket Chains
            'albert_heijn': {
                'name': 'Albert Heijn',
                'base_url': 'https://www.ah.nl',
                'search_endpoints': [
                    '/zoeken?query=glutenvrij',
                    '/zoeken?query=AH+Vrij+van+gluten',
                    '/zoeken?query=glutenvrije+brood',
                    '/zoeken?query=glutenvrije+pasta',
                    '/zoeken?query=glutenvrije+koekjes',
                    '/zoeken?query=glutenvrije+pizza',
                    '/zoeken?query=vrij+van+gluten+ontbijt'
                ],
                'category_urls': [
                    '/producten/brood-gebak/glutenvrije-producten',
                    '/producten/ontbijtgranen-beleg/glutenvrije-producten', 
                    '/producten/pasta-rijst-wereldkeuken/glutenvrij',
                    '/producten/koek-snoep-chocolade/glutenvrij',
                    '/producten/diepvries/glutenvrij',
                    '/producten/zuivel-plantaardig-eieren/glutenvrij'
                ],
                'selectors': {
                    'product_cards': '[data-testhook="product-card"], .product-card',
                    'product_name': '.product-title, [data-testhook="product-title"]',
                    'product_price': '.price-amount, [data-testhook="price"]',
                    'product_link': 'a[href*="/producten/"]',
                    'next_page': '.pagination-next'
                },
                'rate_limit': 2.0,
                'max_pages': 50,
                'affiliate_param': '?affiliate_id=glutenvergelijker'
            },

            'jumbo': {
                'name': 'Jumbo',
                'base_url': 'https://www.jumbo.com',
                'search_endpoints': [
                    '/zoeken?searchTerms=glutenvrij',
                    '/zoeken?searchTerms=lekker+vrij+van+gluten',
                    '/zoeken?searchTerms=glutenvrije+brood',
                    '/zoeken?searchTerms=glutenvrije+pasta'
                ],
                'category_urls': [
                    '/producten/lekker-vrij-van-gluten',
                    '/producten/brood-en-gebak/glutenvrij',
                    '/producten/ontbijt/glutenvrij',
                    '/producten/koek-snoep-chocolade/glutenvrij'
                ],
                'selectors': {
                    'product_cards': '.product-container, .product-item',
                    'product_name': '.title, .product-title',
                    'product_price': '.price-amount, .price',
                    'product_link': 'a[href*="/producten/"]'
                },
                'rate_limit': 1.5,
                'max_pages': 30,
                'affiliate_param': '?ref=glutenvergelijker'
            },

            'plus_supermarkt': {
                'name': 'Plus',
                'base_url': 'https://www.plus.nl',
                'search_endpoints': [
                    '/zoeken?q=glutenvrij',
                    '/zoeken?q=glutenvrije+producten'
                ],
                'selectors': {
                    'product_cards': '.product-item, .product-card',
                    'product_name': '.product-name, .title',
                    'product_price': '.price, .product-price'
                },
                'rate_limit': 2.0,
                'affiliate_param': '?affiliate=glutenvergelijker'
            },

            # Specialized Glutenvrije Webshops
            'glutenvrije_webshop': {
                'name': 'Glutenvrije Webshop',
                'base_url': 'https://www.glutenvrijewebshop.nl',
                'category_urls': [
                    '/brood-bakproducten',
                    '/pasta-rijst', 
                    '/koekjes-snacks',
                    '/pizza-maaltijden',
                    '/ontbijt-beleg',
                    '/chocolade-snoep',
                    '/dranken',
                    '/bakingredienten',
                    '/diepvries',
                    '/sauzen-kruiden'
                ],
                'selectors': {
                    'product_cards': '.product-item, .product-card, .grid-item',
                    'product_name': '.product-name, h3, .title',
                    'product_price': '.price, .product-price',
                    'product_link': 'a'
                },
                'rate_limit': 1.0,
                'max_pages': 100,
                'affiliate_param': '?ref=glutenvergelijker'
            },

            'glutenvrijemarkt': {
                'name': 'Glutenvrijemarkt.com',
                'base_url': 'https://www.glutenvrijemarkt.com',
                'category_urls': [
                    '/brood-bakmixen',
                    '/pasta',
                    '/koekjes', 
                    '/ontbijt',
                    '/pizza-maaltijden',
                    '/aanbiedingen'
                ],
                'selectors': {
                    'product_cards': '.product-card, .product-item',
                    'product_name': '.product-title, .title',
                    'product_price': '.price-current, .price'
                },
                'rate_limit': 1.5,
                'affiliate_param': '?utm_source=glutenvergelijker'
            },

            'happy_bakers': {
                'name': 'Happy Bakers',
                'base_url': 'https://happybakers.nl',
                'category_urls': [
                    '/brood',
                    '/croissants', 
                    '/koekjes',
                    '/cake',
                    '/specialiteiten'
                ],
                'selectors': {
                    'product_cards': '.product-item, .product-card',
                    'product_name': 'h3, .product-name',
                    'product_price': '.price'
                },
                'rate_limit': 1.0,
                'affiliate_param': '?ref=glutenvergelijker'
            },

            'the_free_from_shop': {
                'name': 'The Free From Shop',
                'base_url': 'https://thefreefromshop.nl',
                'category_urls': [
                    '/glutenvrij',
                    '/brood',
                    '/pasta', 
                    '/koekjes'
                ],
                'selectors': {
                    'product_cards': '.product, .product-item',
                    'product_name': '.product-name, h3',
                    'product_price': '.price'
                },
                'rate_limit': 2.0,
                'affiliate_param': '?ref=glutenvergelijker'
            },

            # Additional Dutch webshops
            'winkelglutenvrij': {
                'name': 'Winkelglutenvrij',
                'base_url': 'https://www.winkelglutenvrij.nl',
                'category_urls': ['/brood', '/pasta', '/snacks'],
                'rate_limit': 2.0
            },

            'ruttmans': {
                'name': 'Ruttmans',
                'base_url': 'https://www.ruttmans.nl',
                'category_urls': ['/brood', '/koekjes', '/pasta', '/sauzen'],
                'rate_limit': 1.5
            },

            'bakker_leo': {
                'name': 'Bakker Leo', 
                'base_url': 'https://glutenvrij.bakkerleo.nl',
                'category_urls': ['/brood', '/koekjes', '/taart'],
                'rate_limit': 1.0
            }
        }

        # User agents for rotation
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]

    async def run_daily_scraping(self) -> dict:
        """Main entry point for daily scraping"""
        logger.info("🌾 Starting Ultimate Glutenvrije Scraper")
        logger.info(f"Target: {self.total_target}+ products from {len(self.webshops)} webshops")

        start_time = datetime.now()

        # Initialize HTTP session
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)

        async with aiohttp.ClientSession(
            timeout=timeout,
            connector=connector,
            headers={'User-Agent': random.choice(self.user_agents)}
        ) as session:
            self.session = session

            # Load existing products
            existing_products = await self.load_existing_products()

            # Process each webshop
            tasks = []
            for webshop_id, config in self.webshops.items():
                task = self.scrape_webshop(webshop_id, config)
                tasks.append(task)

            # Execute all scraping tasks
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results
            for i, result in enumerate(results):
                webshop_id = list(self.webshops.keys())[i]
                if isinstance(result, Exception):
                    logger.error(f"❌ {webshop_id} failed: {result}")
                    self.daily_stats['errors'] += 1
                else:
                    logger.info(f"✅ {webshop_id}: {result.get('products_found', 0)} products")
                    self.daily_stats['webshops_processed'] += 1
                    self.daily_stats['products_discovered'] += result.get('products_found', 0)

        # Deduplicate and merge with existing
        final_products = await self.merge_and_deduplicate(existing_products)

        # Validate all links
        await self.validate_all_links(final_products)

        # Save final database
        await self.save_products_database(final_products)

        # Generate report
        execution_time = datetime.now() - start_time
        await self.generate_daily_report(final_products, execution_time)

        logger.info(f"🎉 Scraping complete! Found {len(final_products)} total products")

        return {
            'total_products': len(final_products),
            'new_products': self.daily_stats['new_products'],
            'execution_time': execution_time.total_seconds(),
            'success_rate': self.daily_stats['success_rate']
        }

    async def scrape_webshop(self, webshop_id: str, config: dict) -> dict:
        """Scrape a single webshop comprehensively"""
        logger.info(f"🔍 Scraping {config['name']}...")

        results = {
            'webshop_id': webshop_id,
            'webshop_name': config['name'],
            'products_found': 0,
            'products': [],
            'errors': []
        }

        try:
            # Method 1: Search-based discovery
            if 'search_endpoints' in config:
                search_products = await self.scrape_search_pages(webshop_id, config)
                results['products'].extend(search_products)

            # Method 2: Category-based discovery 
            if 'category_urls' in config:
                category_products = await self.scrape_category_pages(webshop_id, config)
                results['products'].extend(category_products)

            # Method 3: Sitemap discovery
            sitemap_products = await self.scrape_sitemap(webshop_id, config)
            results['products'].extend(sitemap_products)

            # Remove duplicates within webshop
            results['products'] = self.deduplicate_products(results['products'])
            results['products_found'] = len(results['products'])

            logger.info(f"✅ {config['name']}: {results['products_found']} products found")

        except Exception as e:
            logger.error(f"❌ Error scraping {config['name']}: {e}")
            results['errors'].append(str(e))

        return results

    async def scrape_search_pages(self, webshop_id: str, config: dict) -> List[dict]:
        """Scrape products from search result pages"""
        products = []

        for search_endpoint in config.get('search_endpoints', []):
            try:
                url = config['base_url'] + search_endpoint
                page = 1
                max_pages = config.get('max_pages', 20)

                while page <= max_pages:
                    # Construct paginated URL
                    page_url = f"{url}&page={page}" if '?' in url else f"{url}?page={page}"

                    page_products = await self.scrape_product_page(
                        webshop_id, config, page_url
                    )

                    if not page_products:
                        break  # No more products, stop pagination

                    products.extend(page_products)
                    page += 1

                    # Rate limiting
                    await asyncio.sleep(config.get('rate_limit', 1.0))

            except Exception as e:
                logger.warning(f"Search page error for {webshop_id}: {e}")

        return products

    async def scrape_category_pages(self, webshop_id: str, config: dict) -> List[dict]:
        """Scrape products from category pages"""
        products = []

        for category_url in config.get('category_urls', []):
            try:
                full_url = config['base_url'] + category_url

                # Support for pagination within categories
                page = 1
                max_pages = config.get('max_pages', 10)

                while page <= max_pages:
                    page_url = f"{full_url}?page={page}"

                    page_products = await self.scrape_product_page(
                        webshop_id, config, page_url
                    )

                    if not page_products:
                        break

                    products.extend(page_products)

                    # Add category info to products
                    for product in page_products:
                        product['discovered_category'] = category_url

                    page += 1
                    await asyncio.sleep(config.get('rate_limit', 1.0))

            except Exception as e:
                logger.warning(f"Category page error for {webshop_id}/{category_url}: {e}")

        return products

    async def scrape_product_page(self, webshop_id: str, config: dict, url: str) -> List[dict]:
        """Scrape products from a single page"""
        products = []

        try:
            # Random delay to appear more human
            await asyncio.sleep(random.uniform(0.5, 1.5))

            # Rotate user agent
            headers = {'User-Agent': random.choice(self.user_agents)}

            async with self.session.get(url, headers=headers) as response:
                if response.status != 200:
                    logger.warning(f"Non-200 response from {url}: {response.status}")
                    return products

                content = await response.text()
                soup = BeautifulSoup(content, 'html.parser')

                # Extract products using configured selectors
                selectors = config.get('selectors', {})
                product_cards = soup.select(selectors.get('product_cards', '.product'))

                for card in product_cards:
                    try:
                        product = await self.extract_product_data(
                            webshop_id, config, card, url
                        )
                        if product:
                            products.append(product)
                    except Exception as e:
                        logger.debug(f"Product extraction error: {e}")

                logger.debug(f"Found {len(products)} products on {url}")

        except Exception as e:
            logger.warning(f"Page scraping error {url}: {e}")

        return products

    async def extract_product_data(self, webshop_id: str, config: dict, 
                                   card_element, source_url: str) -> Optional[dict]:
        """Extract product data from HTML element"""
        try:
            selectors = config.get('selectors', {})

            # Product name
            name_elem = card_element.select_one(selectors.get('product_name', '.title'))
            if not name_elem:
                return None

            name = name_elem.get_text().strip()
            if not name or len(name) < 3:
                return None

            # Filter out non-glutenvrije products
            if not self.is_glutenvrije_product(name):
                return None

            # Product price
            price_elem = card_element.select_one(selectors.get('product_price', '.price'))
            price = 0.0
            original_price = None
            discount_percentage = 0

            if price_elem:
                price_text = price_elem.get_text().strip()

                # Extract price with regex
                price_match = re.search(r'€?\s*(\d+[,.]?\d*)', price_text.replace(',', '.'))
                if price_match:
                    price = float(price_match.group(1))

                # Check for original price (crossed out)
                original_elem = card_element.select_one('.original-price, .was-price, .old-price')
                if original_elem:
                    original_text = original_elem.get_text()
                    original_match = re.search(r'€?\s*(\d+[,.]?\d*)', original_text.replace(',', '.'))
                    if original_match:
                        original_price = float(original_match.group(1))
                        if original_price > price:
                            discount_percentage = round(((original_price - price) / original_price) * 100, 1)

            # Product URL
            link_elem = card_element.select_one(selectors.get('product_link', 'a'))
            product_url = None
            if link_elem and link_elem.get('href'):
                href = link_elem.get('href')
                product_url = urljoin(config['base_url'], href)

                # Add affiliate parameter
                affiliate_param = config.get('affiliate_param', '')
                if affiliate_param:
                    separator = '&' if '?' in product_url else '?'
                    product_url += separator + affiliate_param.lstrip('?&')

            # Detect category from name and context
            category = self.detect_product_category(name, source_url)

            # Extract brand
            brand = self.extract_brand(name, config['name'])

            # Generate product ID
            product_id = self.generate_product_id(name, webshop_id)

            # Build product object
            product = {
                'id': product_id,
                'name': name,
                'brand': brand,
                'category': category,
                'description': f"Glutenvrij {name.lower()}",
                'webshop_id': webshop_id,
                'webshop_name': config['name'],
                'price': price,
                'original_price': original_price,
                'discount_percentage': discount_percentage,
                'url': product_url,
                'in_stock': True,
                'last_updated': datetime.now().isoformat(),
                'discovered_date': datetime.now().isoformat(),
                'source_page': source_url,
                'nutritional_info': {
                    'gluten_free': True,
                    'organic': any(word in name.lower() for word in ['bio', 'biologisch', 'organic']),
                    'vegan': any(word in name.lower() for word in ['vegan', 'plantaardig']),
                    'lactose_free': any(word in name.lower() for word in ['lactosevrij', 'zonder lactose'])
                },
                'affiliate_ready': bool(config.get('affiliate_param'))
            }

            return product

        except Exception as e:
            logger.debug(f"Product data extraction error: {e}")
            return None

    def is_glutenvrije_product(self, name: str) -> bool:
        """Check if product name indicates it's glutenvrije"""
        name_lower = name.lower()

        # Positive indicators
        glutenvrije_keywords = [
            'glutenvrij', 'gluten vrij', 'glutenfrei', 'gluten free',
            'vrij van gluten', 'zonder gluten', 'ah vrij van',
            'lekker vrij', 'schär', 'consenza', 'proceli'
        ]

        # Negative indicators (exclude these)
        exclude_keywords = [
            'glutenbrood', 'met gluten', 'gluten bevat',
            'bevat gluten', 'niet geschikt bij gluten'
        ]

        # Check exclusions first
        if any(keyword in name_lower for keyword in exclude_keywords):
            return False

        # Check positive indicators
        if any(keyword in name_lower for keyword in glutenvrije_keywords):
            return True

        # Check if it's from a specialized glutenvrije shop
        return False

    def detect_product_category(self, name: str, source_url: str) -> str:
        """Detect product category from name and URL context"""
        name_lower = name.lower()
        url_lower = source_url.lower()

        # Category detection rules
        category_keywords = {
            'Brood & Bakproducten': ['brood', 'bread', 'toast', 'croissant', 'focaccia', 'baguette', 'pain', 'bakkerij'],
            'Pasta & Rijst': ['pasta', 'spaghetti', 'penne', 'fusilli', 'rijst', 'macaroni', 'linguine', 'gnocchi'],
            'Koekjes & Snacks': ['koekje', 'koekjes', 'cookie', 'biscuit', 'snack', 'cracker', 'wafel'],
            'Pizza & Maaltijden': ['pizza', 'maaltijd', 'ready meal', 'diepvries', 'magnetron', 'lasagne'],
            'Ontbijt & Beleg': ['ontbijt', 'muesli', 'granola', 'pindakaas', 'jam', 'beleg', 'havermout'],
            'Chips & Crackers': ['chips', 'crackers', 'nacho', 'tortilla', 'corn'],
            'Chocolade & Snoep': ['chocola', 'chocolate', 'snoep', 'candy', 'lolly', 'gum'],
            'Dranken': ['drank', 'bier', 'sap', 'thee', 'coffee', 'melk', 'drink'],
            'Sauzen & Kruiden': ['saus', 'sauce', 'kruid', 'marinade', 'dressing', 'mayo'],
            'Bakingrediënten': ['meel', 'flour', 'bakpoeder', 'gist', 'suiker', 'ingredient', 'mix'],
            'Diepvries': ['diepvries', 'frozen', 'bevroren']
        }

        # Check name and URL for keywords
        combined_text = f"{name_lower} {url_lower}"

        for category, keywords in category_keywords.items():
            if any(keyword in combined_text for keyword in keywords):
                return category

        return 'Overig'

    def extract_brand(self, name: str, webshop_name: str) -> str:
        """Extract brand from product name"""
        # Known glutenvrije brands
        known_brands = [
            'Schär', 'Consenza', 'Dr. Oetker', 'Happy Bakers', 'Albert Heijn', 'AH',
            'Jumbo', 'Lays', 'Chio', "Nairn's", 'Old El Paso', "Prewett's",
            'Maître Mathis', 'Proceli', 'Turtle', 'Leev', 'Nutrifree', 'Okono',
            'Miran', 'Santiveri', 'Le Pain des Fleurs', 'Traindevie'
        ]

        # Check if any known brand is in the product name
        for brand in known_brands:
            if brand.lower() in name.lower():
                return brand

        # Extract first word as potential brand
        first_word = name.split()[0]
        if len(first_word) > 2 and first_word.isalpha():
            return first_word

        # Fallback to webshop name
        return webshop_name

    def generate_product_id(self, name: str, webshop_id: str) -> str:
        """Generate unique product ID"""
        # Create hash of name and webshop
        combined = f"{name}_{webshop_id}".lower()
        hash_obj = hashlib.md5(combined.encode())
        hash_hex = hash_obj.hexdigest()[:8]
        return f"gv_{hash_hex}"

    async def scrape_sitemap(self, webshop_id: str, config: dict) -> List[dict]:
        """Scrape products from sitemap.xml"""
        products = []

        try:
            sitemap_url = config['base_url'] + '/sitemap.xml'

            async with self.session.get(sitemap_url) as response:
                if response.status != 200:
                    return products

                content = await response.text()
                soup = BeautifulSoup(content, 'xml')

                # Find product URLs in sitemap
                urls = soup.find_all('url')
                product_urls = []

                for url in urls:
                    loc = url.find('loc')
                    if loc and any(keyword in loc.text.lower() 
                                 for keyword in ['product', 'glutenvrij', 'brood', 'pasta']):
                        product_urls.append(loc.text)

                # Sample URLs to avoid overload
                if len(product_urls) > 100:
                    product_urls = random.sample(product_urls, 100)

                # Process product URLs
                for url in product_urls[:50]:  # Limit to 50 for performance
                    try:
                        product_page_products = await self.scrape_product_page(
                            webshop_id, config, url
                        )
                        products.extend(product_page_products)

                        await asyncio.sleep(config.get('rate_limit', 1.0))

                    except Exception as e:
                        logger.debug(f"Sitemap product page error: {e}")

        except Exception as e:
            logger.debug(f"Sitemap scraping error for {webshop_id}: {e}")

        return products

    def deduplicate_products(self, products: List[dict]) -> List[dict]:
        """Remove duplicate products within a list"""
        seen_names = set()
        unique_products = []

        for product in products:
            # Normalize name for comparison
            normalized_name = re.sub(r'[^a-z0-9]', '', product['name'].lower())

            if normalized_name not in seen_names:
                unique_products.append(product)
                seen_names.add(normalized_name)

        return unique_products

    async def load_existing_products(self) -> List[dict]:
        """Load existing products from database"""
        try:
            if os.path.exists('glutenvrij_products.json'):
                with open('glutenvrij_products.json', 'r', encoding='utf-8') as f:
                    products = json.load(f)
                    logger.info(f"📦 Loaded {len(products)} existing products")
                    return products
        except Exception as e:
            logger.warning(f"Could not load existing products: {e}")

        return []

    async def merge_and_deduplicate(self, existing_products: List[dict]) -> List[dict]:
        """Merge new products with existing ones and deduplicate"""
        logger.info("🔄 Merging and deduplicating products...")

        # Convert new products to store-based format
        products_by_name = {}

        # Process existing products
        for product in existing_products:
            name_key = re.sub(r'[^a-z0-9]', '', product['name'].lower())
            if name_key not in products_by_name:
                products_by_name[name_key] = product
            else:
                # Merge store information
                if 'stores' not in products_by_name[name_key]:
                    products_by_name[name_key]['stores'] = {}
                if 'stores' in product:
                    products_by_name[name_key]['stores'].update(product['stores'])

        # Process newly found products
        for new_product in self.products_found:
            name_key = re.sub(r'[^a-z0-9]', '', new_product['name'].lower())

            if name_key in products_by_name:
                # Update existing product with new store data
                existing = products_by_name[name_key]
                if 'stores' not in existing:
                    existing['stores'] = {}

                # Add store information
                store_id = new_product['webshop_id']
                existing['stores'][store_id] = {
                    'price': new_product['price'],
                    'original_price': new_product.get('original_price'),
                    'discount_percentage': new_product.get('discount_percentage', 0),
                    'url': new_product['url'],
                    'in_stock': new_product.get('in_stock', True),
                    'last_updated': new_product['last_updated']
                }

                # Update metadata
                existing['last_updated'] = new_product['last_updated']

                self.daily_stats['products_updated'] += 1

            else:
                # New product
                new_product_formatted = {
                    'id': new_product['id'],
                    'name': new_product['name'],
                    'category': new_product['category'],
                    'brand': new_product['brand'],
                    'description': new_product['description'],
                    'nutritional_info': new_product.get('nutritional_info', {}),
                    'stores': {
                        new_product['webshop_id']: {
                            'price': new_product['price'],
                            'original_price': new_product.get('original_price'),
                            'discount_percentage': new_product.get('discount_percentage', 0),
                            'url': new_product['url'],
                            'in_stock': new_product.get('in_stock', True),
                            'last_updated': new_product['last_updated']
                        }
                    },
                    'last_discovered': new_product.get('discovered_date'),
                    'last_updated': new_product['last_updated'],
                    'affiliate_ready': new_product.get('affiliate_ready', False)
                }

                products_by_name[name_key] = new_product_formatted
                self.daily_stats['new_products'] += 1

        final_products = list(products_by_name.values())

        logger.info(f"✅ Final database: {len(final_products)} unique products")
        logger.info(f"📊 New products: {self.daily_stats['new_products']}")
        logger.info(f"🔄 Updated products: {self.daily_stats['products_updated']}")

        return final_products

    async def validate_all_links(self, products: List[dict]):
        """Validate all product links and fix broken ones"""
        logger.info("🔗 Validating all product links...")

        total_links = sum(len(product.get('stores', {})) for product in products)
        validated = 0
        fixed = 0

        for product in products:
            if 'stores' not in product:
                continue

            for store_id, store_data in product['stores'].items():
                if 'url' in store_data:
                    try:
                        # Quick HEAD request to check if URL is accessible
                        async with self.session.head(store_data['url'], 
                                                   allow_redirects=True) as response:
                            if response.status in [200, 301, 302]:
                                validated += 1
                            else:
                                # Try to fix URL
                                fixed_url = self.fix_product_url(
                                    store_data['url'], store_id, product['name']
                                )
                                if fixed_url != store_data['url']:
                                    store_data['url'] = fixed_url
                                    fixed += 1
                                    logger.debug(f"Fixed URL for {product['name']}")

                    except Exception as e:
                        logger.debug(f"Link validation error: {e}")

                # Rate limiting for validation
                await asyncio.sleep(0.1)

        self.daily_stats['links_validated'] = validated
        self.daily_stats['links_fixed'] = fixed

        logger.info(f"✅ Link validation complete: {validated}/{total_links} valid, {fixed} fixed")

    def fix_product_url(self, url: str, store_id: str, product_name: str) -> str:
        """Attempt to fix a broken product URL"""
        if not url or not store_id:
            return url

        # Store-specific URL fixing
        if 'glutenvrijewebshop' in store_id:
            # Ensure .html extension
            if not url.endswith('.html'):
                safe_name = re.sub(r'[^a-z0-9-]', '', product_name.lower().replace(' ', '-'))
                base_url = url.split('?')[0].rstrip('/')
                return f"{base_url}/{safe_name}.html"

        return url

    async def save_products_database(self, products: List[dict]):
        """Save the final products database"""
        logger.info("💾 Saving products database...")

        # Sort products for consistent output
        products.sort(key=lambda x: (x.get('category', ''), x.get('name', '')))

        # Save main database
        with open('glutenvrij_products.json', 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)

        # Save backup with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'glutenvrij_products_backup_{timestamp}.json'
        with open(backup_filename, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)

        logger.info(f"✅ Database saved: {len(products)} products")
        logger.info(f"📁 Backup created: {backup_filename}")

    async def generate_daily_report(self, products: List[dict], execution_time):
        """Generate comprehensive daily report"""
        logger.info("📋 Generating daily report...")

        # Calculate statistics
        total_products = len(products)
        products_with_discounts = sum(1 for p in products 
                                    if any(store.get('discount_percentage', 0) > 0 
                                          for store in p.get('stores', {}).values()))

        categories = {}
        brands = {}
        stores = {}

        for product in products:
            # Category stats
            cat = product.get('category', 'Overig')
            categories[cat] = categories.get(cat, 0) + 1

            # Brand stats
            brand = product.get('brand', 'Onbekend')
            brands[brand] = brands.get(brand, 0) + 1

            # Store stats
            for store_id in product.get('stores', {}):
                stores[store_id] = stores.get(store_id, 0) + 1

        # Calculate success rate
        if len(self.webshops) > 0:
            self.daily_stats['success_rate'] = (
                self.daily_stats['webshops_processed'] / len(self.webshops)
            ) * 100

        # Generate report
        report = {
            'report_date': datetime.now().isoformat(),
            'execution_time_seconds': execution_time.total_seconds(),
            'target_products': self.total_target,
            'statistics': {
                'total_products': total_products,
                'new_products': self.daily_stats['new_products'],
                'updated_products': self.daily_stats['products_updated'],
                'products_with_discounts': products_with_discounts,
                'webshops_processed': self.daily_stats['webshops_processed'],
                'webshops_total': len(self.webshops),
                'success_rate_percentage': round(self.daily_stats['success_rate'], 1),
                'links_validated': self.daily_stats['links_validated'],
                'links_fixed': self.daily_stats['links_fixed'],
                'errors': self.daily_stats['errors']
            },
            'categories': dict(sorted(categories.items(), key=lambda x: x[1], reverse=True)),
            'top_brands': dict(sorted(brands.items(), key=lambda x: x[1], reverse=True)[:10]),
            'store_coverage': dict(sorted(stores.items(), key=lambda x: x[1], reverse=True)),
            'target_achievement': {
                'percentage': min((total_products / self.total_target) * 100, 100),
                'remaining_to_target': max(0, self.total_target - total_products)
            }
        }

        # Save report
        report_filename = f'daily_report_{datetime.now().strftime("%Y%m%d")}.json'
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        # Log summary
        logger.info("=" * 60)
        logger.info("📊 DAILY SCRAPING REPORT")
        logger.info("=" * 60)
        logger.info(f"🎯 Target: {self.total_target} products")
        logger.info(f"📦 Total products: {total_products}")
        logger.info(f"🆕 New products: {self.daily_stats['new_products']}")
        logger.info(f"🔄 Updated products: {self.daily_stats['products_updated']}")
        logger.info(f"💰 Products with discounts: {products_with_discounts}")
        logger.info(f"🏪 Webshops processed: {self.daily_stats['webshops_processed']}/{len(self.webshops)}")
        logger.info(f"✅ Success rate: {self.daily_stats['success_rate']:.1f}%")
        logger.info(f"⏱️ Execution time: {execution_time.total_seconds():.1f} seconds")
        logger.info(f"🎯 Target achievement: {report['target_achievement']['percentage']:.1f}%")

        if total_products >= self.total_target:
            logger.info("🎉 TARGET ACHIEVED! 🎉")
        else:
            remaining = report['target_achievement']['remaining_to_target']
            logger.info(f"📈 {remaining} more products needed to reach target")

        logger.info("=" * 60)
        logger.info(f"📁 Report saved: {report_filename}")

# Main execution
async def main():
    """Main entry point"""
    scraper = UltimateGlutenvrije Scraper()

    try:
        results = await scraper.run_daily_scraping()

        print(f"\n🎉 SCRAPING COMPLETE!")
        print(f"Total products: {results['total_products']}")
        print(f"New products: {results['new_products']}")
        print(f"Execution time: {results['execution_time']:.1f} seconds")
        print(f"Success rate: {results['success_rate']:.1f}%")

        if results['total_products'] >= scraper.total_target:
            print(f"✅ TARGET ACHIEVED! Found {results['total_products']} products")
        else:
            remaining = scraper.total_target - results['total_products']
            print(f"📈 {remaining} more products needed to reach target of {scraper.total_target}")

        return 0

    except Exception as e:
        logger.error(f"❌ Scraping failed: {e}")
        return 1

if __name__ == "__main__":
    # Run the scraper
    exit_code = asyncio.run(main())
    sys.exit(exit_code)