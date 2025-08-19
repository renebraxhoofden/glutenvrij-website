// Glutenvergelijker.nl - Verbeterde Data Loader (Performance geoptimaliseerd)
// Voorkomt flitsing en zorgt voor smooth loading experience

(function() {
    'use strict';
    
    console.log('🌾 Glutenvergelijker.nl Data Loader starting...');
    
    // Global data storage
    window.glutenvrijeProducten = [];
    window.glutenvrijeCategories = [];
    window.glutenvrijeStats = {};
    
    // Configuration
    const DATA_CONFIG = {
        productFile: 'glutenvrij_products_corrected.json', // Use corrected data
        maxRetries: 3,
        retryDelay: 1000,
        cacheTimeout: 3600000, // 1 hour
        enableCache: true
    };
    
    // Performance tracking
    const performance = {
        startTime: Date.now(),
        cacheHit: false,
        dataSize: 0,
        loadTime: 0
    };
    
    // Cache management with better error handling
    function getCachedData() {
        if (!DATA_CONFIG.enableCache) return null;
        
        try {
            const cached = localStorage.getItem('glutenvrije_cache_v2'); // v2 for corrected data
            const cacheTime = localStorage.getItem('glutenvrije_cache_time_v2');
            
            if (cached && cacheTime) {
                const age = Date.now() - parseInt(cacheTime);
                if (age < DATA_CONFIG.cacheTimeout) {
                    console.log('📦 Loading from cache...');
                    performance.cacheHit = true;
                    return JSON.parse(cached);
                }
            }
        } catch (error) {
            console.warn('Cache error:', error);
            // Clear corrupted cache
            localStorage.removeItem('glutenvrije_cache_v2');
            localStorage.removeItem('glutenvrije_cache_time_v2');
        }
        
        return null;
    }
    
    function setCachedData(data) {
        if (!DATA_CONFIG.enableCache) return;
        
        try {
            localStorage.setItem('glutenvrije_cache_v2', JSON.stringify(data));
            localStorage.setItem('glutenvrije_cache_time_v2', Date.now().toString());
            console.log('💾 Data cached successfully');
        } catch (error) {
            console.warn('Cache save error:', error);
        }
    }
    
    // Progressive loading indicator
    function updateLoadingProgress(stage, progress = 0) {
        const stages = {
            'loading': 'Producten laden...',
            'processing': 'Data verwerken...',
            'categorizing': 'Categorieën maken...',
            'finalizing': 'Afmaken...',
            'complete': 'Gereed!'
        };
        
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            const text = loadingElement.querySelector('p');
            if (text) {
                text.textContent = stages[stage] || 'Laden...';
            }
        }
        
        // Update progress bar if exists
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    // Load data with enhanced retry logic and progress tracking
    async function loadProductData(attempt = 1) {
        console.log(`📊 Loading product data (attempt ${attempt})...`);
        updateLoadingProgress('loading', 20);
        
        try {
            // Try cache first on first attempt
            if (attempt === 1) {
                const cachedData = getCachedData();
                if (cachedData) {
                    updateLoadingProgress('processing', 60);
                    await processProductData(cachedData);
                    return;
                }
            }
            
            updateLoadingProgress('loading', 40);
            
            // Fetch from server with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
            
            const response = await fetch(DATA_CONFIG.productFile + '?v=' + Date.now(), {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Invalid content type - expected JSON');
            }
            
            updateLoadingProgress('loading', 70);
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format - expected array');
            }
            
            performance.dataSize = JSON.stringify(data).length;
            console.log(`✅ Loaded ${data.length} products from server (${Math.round(performance.dataSize / 1024)}KB)`);
            
            // Cache the data
            setCachedData(data);
            
            updateLoadingProgress('processing', 80);
            
            // Process the data
            await processProductData(data);
            
        } catch (error) {
            console.error(`❌ Failed to load data (attempt ${attempt}):`, error);
            
            if (error.name === 'AbortError') {
                console.error('Request timed out');
            }
            
            if (attempt < DATA_CONFIG.maxRetries) {
                console.log(`🔄 Retrying in ${DATA_CONFIG.retryDelay}ms...`);
                updateLoadingProgress('loading', 10);
                
                setTimeout(() => {
                    loadProductData(attempt + 1);
                }, DATA_CONFIG.retryDelay);
            } else {
                // Final fallback - use minimal sample data
                console.log('🔧 Using fallback sample data...');
                updateLoadingProgress('processing', 50);
                await processProductData(getFallbackData());
            }
        }
    }
    
    // Enhanced data processing with validation
    async function processProductData(products) {
        console.log(`🔄 Processing ${products.length} products...`);
        updateLoadingProgress('processing', 85);
        
        // Validate product data structure
        const validProducts = products.filter(product => {
            return product && 
                   product.id && 
                   product.name && 
                   product.category && 
                   product.brand &&
                   product.stores &&
                   Object.keys(product.stores).length > 0;
        });
        
        if (validProducts.length !== products.length) {
            console.warn(`⚠️ Filtered out ${products.length - validProducts.length} invalid products`);
        }
        
        // Store globally
        window.glutenvrijeProducten = validProducts;
        
        updateLoadingProgress('categorizing', 90);
        
        // Generate categories with better organization
        const categoryMap = new Map();
        validProducts.forEach(product => {
            if (product.category) {
                const existing = categoryMap.get(product.category) || 0;
                categoryMap.set(product.category, existing + 1);
            }
        });
        
        window.glutenvrijeCategories = Array.from(categoryMap.entries())
            .map(([name, count]) => ({
                name,
                count,
                icon: getCategoryIcon(name)
            }))
            .sort((a, b) => b.count - a.count); // Sort by product count
        
        // Generate comprehensive statistics
        window.glutenvrijeStats = generateStatistics(validProducts);
        
        updateLoadingProgress('finalizing', 95);
        
        // Performance metrics
        performance.loadTime = Date.now() - performance.startTime;
        
        console.log(`✅ Data processing complete:`);
        console.log(` - ${validProducts.length} valid products`);
        console.log(` - ${window.glutenvrijeCategories.length} categories`);
        console.log(` - ${Object.keys(getUniqueStores(validProducts)).length} stores`);
        console.log(` - Load time: ${performance.loadTime}ms`);
        console.log(` - Cache hit: ${performance.cacheHit}`);
        
        updateLoadingProgress('complete', 100);
        
        // Small delay for smooth transition
        setTimeout(() => {
            // Dispatch event to notify app
            const event = new CustomEvent('glutenvrijeDataLoaded', {
                detail: {
                    products: window.glutenvrijeProducten,
                    categories: window.glutenvrijeCategories,
                    stats: window.glutenvrijeStats,
                    performance: performance
                }
            });
            
            document.dispatchEvent(event);
            window.dispatchEvent(event);
        }, 200);
    }
    
    // Enhanced statistics generation
    function generateStatistics(products) {
        const stats = {
            totalProducts: products.length,
            categories: {},
            brands: {},
            stores: {},
            discountedProducts: 0,
            averagePrice: 0,
            priceRange: { min: Infinity, max: 0 },
            nutritionalInfo: {
                glutenFree: 0,
                organic: 0,
                vegan: 0,
                lactoseFree: 0
            },
            lastUpdated: new Date().toLocaleDateString('nl-NL'),
            performance: performance
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
            
            // Nutritional info
            if (product.nutritional_info) {
                if (product.nutritional_info.gluten_free) stats.nutritionalInfo.glutenFree++;
                if (product.nutritional_info.organic) stats.nutritionalInfo.organic++;
                if (product.nutritional_info.vegan) stats.nutritionalInfo.vegan++;
                if (product.nutritional_info.lactose_free) stats.nutritionalInfo.lactoseFree++;
            }
            
            // Stores and prices
            if (product.stores) {
                Object.entries(product.stores).forEach(([storeId, storeData]) => {
                    stats.stores[storeId] = (stats.stores[storeId] || 0) + 1;
                    
                    if (storeData.price && storeData.in_stock) {
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
        
        // Fix infinite values
        if (stats.priceRange.min === Infinity) stats.priceRange.min = 0;
        
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
    
    // Enhanced fallback data with realistic products
    function getFallbackData() {
        console.log('🔧 Using realistic fallback data...');
        return [
            {
                "id": "fallback_001",
                "name": "Schär Meesterbakkers Wit Brood",
                "category": "Brood & Bakproducten",
                "brand": "Schär",
                "description": "Glutenvrij wit brood - fallback data",
                "image": "assets/products/fallback.jpg",
                "nutritional_info": {
                    "gluten_free": true,
                    "organic": false,
                    "lactose_free": false,
                    "vegan": false
                },
                "stores": {
                    "ah.nl": {
                        "price": 3.49,
                        "url": "#",
                        "in_stock": false,
                        "last_updated": new Date().toISOString().split('T')[0]
                    }
                },
                "last_discovered": new Date().toISOString().split('T')[0],
                "affiliate_ready": false,
                "auto_discovered": false
            }
        ];
    }
    
    // Initialize data loading with error boundary
    function initialize() {
        try {
            console.log('🚀 Initializing Glutenvergelijker.nl data system...');
            
            // Add loading class to body
            document.body.classList.add('loading-data');
            
            // Add progress indicator to loading div
            const loadingDiv = document.getElementById('loading');
            if (loadingDiv && !loadingDiv.querySelector('.loading-progress-container')) {
                const progressHTML = `
                    <div class="loading-progress-container">
                        <div class="loading-progress" style="width: 0%; height: 4px; background: var(--primary-color); transition: width 0.3s ease; border-radius: 2px; margin-top: 1rem;"></div>
                    </div>
                `;
                loadingDiv.insertAdjacentHTML('beforeend', progressHTML);
            }
            
            // Start loading
            loadProductData();
            
            // Remove loading class when done
            document.addEventListener('glutenvrijeDataLoaded', (event) => {
                document.body.classList.remove('loading-data');
                document.body.classList.add('data-loaded');
                
                console.log('🎉 All data loaded and ready!');
                console.log('📊 Performance metrics:', event.detail.performance);
                
                // Animate out loading indicator
                const loadingDiv = document.getElementById('loading');
                if (loadingDiv) {
                    loadingDiv.style.opacity = '0';
                    setTimeout(() => {
                        loadingDiv.style.display = 'none';
                    }, 300);
                }
            });
            
        } catch (error) {
            console.error('💥 Critical error during initialization:', error);
            
            // Emergency fallback
            setTimeout(() => {
                processProductData(getFallbackData());
            }, 1000);
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();
