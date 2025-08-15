
// glutenvrij_data_loader.js - Laadt echte productdata
class GlutenvrijDataLoader {
    constructor() {
        this.dataUrl = './glutenvrij_products.json';
        this.data = null;
        this.lastLoaded = null;
    }

    async loadData() {
        try {
            console.log('🔄 Loading glutenvrij product data...');
            const response = await fetch(this.dataUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.data = await response.json();
            this.lastLoaded = new Date();

            console.log(`✅ Loaded ${this.data.meta.total_products} products from ${this.data.meta.total_stores} stores`);
            console.log(`📅 Data last updated: ${this.data.meta.last_updated}`);

            return this.data;
        } catch (error) {
            console.error('❌ Error loading glutenvrij data:', error);

            // Fallback to demo data if JSON fails
            console.log('🔄 Falling back to demo data...');
            return this.getDemoData();
        }
    }

    getDemoData() {
        // Fallback demo data (same as current hardcoded data)
        return {
            "meta": {
                "last_updated": new Date().toISOString(),
                "total_products": 6,
                "total_stores": 4,
                "version": "demo"
            },
            "stores": [
                {
                    "id": "albert_heijn",
                    "naam": "Albert Heijn",
                    "logo": "https://logos-world.net/wp-content/uploads/2020/11/Albert-Heijn-Logo.png",
                    "url": "https://ah.nl"
                },
                {
                    "id": "jumbo", 
                    "naam": "Jumbo",
                    "logo": "https://logos-world.net/wp-content/uploads/2020/11/Jumbo-Logo.png",
                    "url": "https://jumbo.com"
                }
            ],
            "categories": [
                {
                    "slug": "alle",
                    "naam": "Alle producten",
                    "image": "https://images.unsplash.com/photo-1556908114-f6e7ad7d3136?w=300&h=200&fit=crop"
                },
                {
                    "slug": "brood",
                    "naam": "Brood & Bakkerij", 
                    "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop"
                }
            ],
            "products": [
                {
                    "id": 1,
                    "naam": "Demo Glutenvrij Brood",
                    "merk": "Demo",
                    "beschrijving": "Demo product - real data loading failed",
                    "categorie": "brood",
                    "afbeelding": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
                    "prijzen": [
                        {
                            "winkel": "Albert Heijn",
                            "prijs": 3.59,
                            "url": "https://ah.nl",
                            "logo": "https://logos-world.net/wp-content/uploads/2020/11/Albert-Heijn-Logo.png",
                            "beste": true
                        }
                    ]
                }
            ]
        };
    }

    getProducts(category = null) {
        if (!this.data) return [];

        let products = this.data.products;

        if (category && category !== 'alle') {
            products = products.filter(p => p.categorie === category);
        }

        return products;
    }

    getCategories() {
        return this.data ? this.data.categories : [];
    }

    getStores() {
        return this.data ? this.data.stores : [];
    }

    searchProducts(query) {
        if (!this.data || !query) return this.data.products;

        const searchTerm = query.toLowerCase();
        return this.data.products.filter(product => 
            product.naam.toLowerCase().includes(searchTerm) ||
            product.merk.toLowerCase().includes(searchTerm) ||
            product.beschrijving.toLowerCase().includes(searchTerm) ||
            product.categorie.toLowerCase().includes(searchTerm)
        );
    }

    sortProducts(products, sortBy = 'name') {
        const sorted = [...products];

        switch(sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => {
                    const priceA = Math.min(...a.prijzen.map(p => p.prijs));
                    const priceB = Math.min(...b.prijzen.map(p => p.prijs));
                    return priceA - priceB;
                });
            case 'price-high':
                return sorted.sort((a, b) => {
                    const priceA = Math.min(...a.prijzen.map(p => p.prijs));
                    const priceB = Math.min(...b.prijzen.map(p => p.prijs));
                    return priceB - priceA;
                });
            case 'name':
            default:
                return sorted.sort((a, b) => a.naam.localeCompare(b.naam));
        }
    }
}

// Global instance
window.glutenvrijData = new GlutenvrijDataLoader();

// Auto-load data when script loads
document.addEventListener('DOMContentLoaded', async () => {
    await window.glutenvrijData.loadData();

    // Trigger custom event when data is loaded
    const event = new CustomEvent('glutenvrijDataLoaded', {
        detail: window.glutenvrijData.data
    });
    document.dispatchEvent(event);
});
