<<<<<<< HEAD
// Glutenvergelijker.nl - Enhanced Data Loader
// This loads all product data and makes it available to the main app

(function() {
    'use strict';

    console.log('🌾 Glutenvergelijker.nl Data Loader starting...');

    // Global data storage
    window.glutenvrijeProducten = [];
    window.glutenvrijeCategories = [];
    window.glutenvrijeStats = {};

    // Configuration
    const DATA_CONFIG = {
        productFile: 'glutenvrij_products.json',
        maxRetries: 3,
        retryDelay: 1000,
        cacheTimeout: 3600000 // 1 hour
    };

    // Cache management
    function getCachedData() {
        try {
            const cached = localStorage.getItem('glutenvrije_cache');
            const cacheTime = localStorage.getItem('glutenvrije_cache_time');

            if (cached && cacheTime) {
                const age = Date.now() - parseInt(cacheTime);
                if (age < DATA_CONFIG.cacheTimeout) {
                    console.log('📦 Loading from cache...');
                    return JSON.parse(cached);
                }
            }
        } catch (error) {
            console.warn('Cache error:', error);
        }
        return null;
    }

    function setCachedData(data) {
        try {
            localStorage.setItem('glutenvrije_cache', JSON.stringify(data));
            localStorage.setItem('glutenvrije_cache_time', Date.now().toString());
        } catch (error) {
            console.warn('Cache save error:', error);
        }
    }

    // Load data with retry logic
    async function loadProductData(attempt = 1) {
        console.log(`📊 Loading product data (attempt ${attempt})...`);

        try {
            // Try cache first
            const cachedData = getCachedData();
            if (cachedData && attempt === 1) {
                processProductData(cachedData);
                return;
            }

            // Fetch from server
            const response = await fetch(DATA_CONFIG.productFile + '?v=' + Date.now());

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid content type - expected JSON');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format - expected array');
            }

            console.log(`✅ Loaded ${data.length} products from server`);

            // Cache the data
            setCachedData(data);

            // Process the data
            processProductData(data);

        } catch (error) {
            console.error(`❌ Failed to load data (attempt ${attempt}):`, error);

            if (attempt < DATA_CONFIG.maxRetries) {
                console.log(`🔄 Retrying in ${DATA_CONFIG.retryDelay}ms...`);
                setTimeout(() => {
                    loadProductData(attempt + 1);
                }, DATA_CONFIG.retryDelay);
            } else {
                // Final fallback - use minimal sample data
                console.log('🔧 Using fallback sample data...');
                processProductData(getFallbackData());
            }
        }
    }

    // Process and organize the loaded data
    function processProductData(products) {
        console.log(`🔄 Processing ${products.length} products...`);

        // Store globally
        window.glutenvrijeProducten = products;

        // Generate categories
        const categoryMap = new Map();
        products.forEach(product => {
            if (product.category) {
                const existing = categoryMap.get(product.category) || 0;
                categoryMap.set(product.category, existing + 1);
            }
        });

        window.glutenvrijeCategories = Array.from(categoryMap.entries()).map(([name, count]) => ({
            name,
            count,
            icon: getCategoryIcon(name)
        }));

        // Generate statistics
        window.glutenvrijeStats = generateStatistics(products);

        console.log(`✅ Data processing complete:`);
        console.log(`   - ${products.length} products`);
        console.log(`   - ${window.glutenvrijeCategories.length} categories`);
        console.log(`   - ${Object.keys(getUniqueStores(products)).length} stores`);

        // Dispatch event to notify app
        const event = new CustomEvent('glutenvrijeDataLoaded', {
            detail: {
                products: window.glutenvrijeProducten,
                categories: window.glutenvrijeCategories,
                stats: window.glutenvrijeStats
            }
        });

        document.dispatchEvent(event);
        window.dispatchEvent(event);
    }

    // Generate comprehensive statistics
    function generateStatistics(products) {
        const stats = {
            totalProducts: products.length,
            categories: {},
            brands: {},
            stores: {},
            discountedProducts: 0,
            averagePrice: 0,
            priceRange: { min: Infinity, max: 0 },
            lastUpdated: new Date().toLocaleDateString('nl-NL')
        };

        let totalPrice = 0;
        let priceCount = 0;

        products.forEach(product => {
            // Categories
            if (product.category) {
                stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
            }

            // Brands
            if (product.brand) {
                stats.brands[product.brand] = (stats.brands[product.brand] || 0) + 1;
            }

            // Stores and prices
            if (product.stores) {
                Object.entries(product.stores).forEach(([storeId, storeData]) => {
                    stats.stores[storeId] = (stats.stores[storeId] || 0) + 1;

                    if (storeData.price) {
                        totalPrice += storeData.price;
                        priceCount++;

                        stats.priceRange.min = Math.min(stats.priceRange.min, storeData.price);
                        stats.priceRange.max = Math.max(stats.priceRange.max, storeData.price);

                        if (storeData.discount_percentage > 0) {
                            stats.discountedProducts++;
                        }
                    }
                });
            }
        });

        stats.averagePrice = priceCount > 0 ? (totalPrice / priceCount) : 0;

        return stats;
    }

    // Get unique stores from products
    function getUniqueStores(products) {
        const stores = {};
        products.forEach(product => {
            if (product.stores) {
                Object.keys(product.stores).forEach(storeId => {
                    if (!stores[storeId]) {
                        stores[storeId] = {
                            id: storeId,
                            name: getStoreName(storeId),
                            logo: getStoreLogo(storeId)
                        };
                    }
                });
            }
        });
        return stores;
    }

    // Store name mapping
    function getStoreName(storeId) {
        const storeNames = {
            'ah.nl': 'Albert Heijn',
            'jumbo.com': 'Jumbo',
            'plus.nl': 'Plus',
            'glutenvrijewebshop.nl': 'Glutenvrije Webshop',
            'glutenvrijemarkt.com': 'Glutenvrijemarkt',
            'happybakers.nl': 'Happy Bakers',
            'thefreefromshop.nl': 'The Free From Shop',
            'winkelglutenvrij.nl': 'Winkelglutenvrij',
            'ruttmans.nl': 'Ruttmans',
            'bakkerleo.nl': 'Bakker Leo'
        };
        return storeNames[storeId] || storeId.replace('.nl', '').replace('.com', '');
    }

    // Store logo mapping
    function getStoreLogo(storeId) {
        const logoMap = {
            'ah.nl': 'assets/logo/ah-albert-heijn.svg',
            'jumbo.com': 'assets/logo/jumbo-logo.svg',
            'plus.nl': 'assets/logo/plus.svg',
            'glutenvrijewebshop.nl': 'assets/logo/glutenvrijewebshop.png',
            'glutenvrijemarkt.com': 'assets/logo/glutenvrijemarkt.png',
            'happybakers.nl': 'assets/logo/happybakers.png'
        };
        return logoMap[storeId] || 'assets/logo/default.png';
    }

    // Category icons
    function getCategoryIcon(category) {
        const icons = {
            'Brood & Bakproducten': '🍞',
            'Pasta & Rijst': '🍝', 
            'Koekjes & Snacks': '🍪',
            'Pizza & Maaltijden': '🍕',
            'Ontbijt & Beleg': '🥣',
            'Chips & Crackers': '🟡',
            'Chocolade & Snoep': '🍫',
            'Dranken': '🥤',
            'Bakingrediënten': '🧁',
            'Sauzen & Kruiden': '🧂',
            'Diepvries': '❄️',
            'Overig': '🌾'
        };
        return icons[category] || '🌾';
    }

    // Fallback data in case loading fails completely
    function getFallbackData() {
        return [
            {
                id: "fallback_001",
                name: "Glutenvrij Sample Product",
                category: "Brood & Bakproducten", 
                brand: "Sample Brand",
                description: "Sample product - data loading failed",
                stores: {
                    "sample.nl": {
                        price: 3.99,
                        url: "#",
                        in_stock: false
                    }
                }
            }
        ];
    }

    // Initialize data loading
    function initialize() {
        console.log('🚀 Initializing Glutenvergelijker.nl data system...');

        // Add loading class to body
        document.body.classList.add('loading-data');

        // Start loading
        loadProductData();

        // Remove loading class when done
        document.addEventListener('glutenvrijeDataLoaded', () => {
            document.body.classList.remove('loading-data');
            document.body.classList.add('data-loaded');
            console.log('🎉 All data loaded and ready!');
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
=======
// Data loader for glutenvrije products
(function() {
    'use strict';

    console.log('📊 Loading glutenvrije product data...');

    // This will be replaced with actual data loading
    // For now, create some sample data based on our research
    window.glutenvrijeProducten = [];

    // Load products from JSON file
    fetch('glutenvrij_products.json')
        .then(response => response.json())
        .then(data => {
            window.glutenvrijeProducten = data;
            console.log(`✅ Loaded ${data.length} glutenvrije products`);

            // Dispatch custom event to notify app that data is ready
            const dataLoadedEvent = new CustomEvent('glutenvrijeDataLoaded', {
                detail: { products: data }
            });
            window.dispatchEvent(dataLoadedEvent);
        })
        .catch(error => {
            console.error('❌ Failed to load product data:', error);
            // Fallback to empty array
            window.glutenvrijeProducten = [];
        });
})();
>>>>>>> 909cf92530d253560f444a222af47ccdbfedab83
