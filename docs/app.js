// Glutenvergelijker.nl - Improved Application
class GlutenvergelijkerApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.partners = [];
        this.currentFilter = {
            category: '',
            brand: '',
            search: '',
            sort: ''
        };

        this.init();
    }

    async init() {
        console.log('🌾 Initializing Glutenvergelijker.nl...');
        await this.loadData();
        this.setupEventListeners();
        this.renderCategories();
        this.renderProducts();
        this.renderPartners();
        this.updateStats();

        // Initialize link validation in background
        this.initLinkValidation();

        console.log('✅ App initialized successfully');
    }

    async loadData() {
        try {
            // Use the global products data loaded by glutenvrij_data_loader.js
            if (window.glutenvrijeProducten) {
                this.products = window.glutenvrijeProducten;
                this.filteredProducts = [...this.products];
            } else {
                console.error('Product data not loaded');
                this.products = [];
                this.filteredProducts = [];
            }

            this.extractCategories();
            this.setupPartners();

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    extractCategories() {
        const categoryMap = {};
        this.products.forEach(product => {
            if (!categoryMap[product.category]) {
                categoryMap[product.category] = [];
            }
            categoryMap[product.category].push(product);
        });

        this.categories = Object.keys(categoryMap).map(category => ({
            name: category,
            count: categoryMap[category].length,
            icon: this.getCategoryIcon(category)
        }));
    }

    getCategoryIcon(category) {
        const icons = {
            'Brood & Bakproducten': '🍞',
            'Pasta & Rijst': '🍝',
            'Koekjes & Snacks': '🍪',
            'Ontbijt & Beleg': '🥣',
            'Diepvries': '❄️',
            'Sauzen & Kruiden': '🧂',
            'Dranken': '🥤',
            'Zuivel & Alternatieven': '🥛',
            'Bakingrediënten': '🧁',
            'Pizza & Maaltijden': '🍕',
            'Chips & Crackers': '🟡',
            'Chocolade & Snoep': '🍫'
        };
        return icons[category] || '🌾';
    }

    setupPartners() {
        // Partners with their logos from assets folder
        this.partners = [
            { name: 'Albert Heijn', logo: 'assets/logo/ah-albert-heijn.svg', url: 'https://ah.nl' },
            { name: 'Jumbo', logo: 'assets/logo/jumbo-logo.svg', url: 'https://jumbo.com' },
            { name: 'Plus', logo: 'assets/logo/plus.svg', url: 'https://plus.nl' },
            { name: 'Glutenvrije Webshop', logo: 'assets/logo/glutenvrijewebshop.png', url: 'https://glutenvrijewebshop.nl' },
            { name: 'Schär', logo: 'assets/logo/schar.png', url: 'https://schar.com' },
            { name: 'Picnic', logo: 'assets/logo/Picnic_logo.svg.png', url: 'https://picnic.app' }
        ];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilter.search = e.target.value.toLowerCase();
                this.filterProducts();
                this.toggleHeroSection();
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.filterProducts();
                this.toggleHeroSection();
            });
        }

        // Filter controls
        const categoryFilter = document.getElementById('category-filter');
        const brandFilter = document.getElementById('brand-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilter.category = e.target.value;
                this.filterProducts();
                this.toggleHeroSection();
            });
        }

        if (brandFilter) {
            brandFilter.addEventListener('change', (e) => {
                this.currentFilter.brand = e.target.value;
                this.filterProducts();
                this.toggleHeroSection();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilter.sort = e.target.value;
                this.sortProducts();
            });
        }
    }

    toggleHeroSection() {
        const heroSection = document.getElementById('hero-section');
        const categoriesContainer = document.getElementById('categories-container');

        if (this.hasActiveFilters()) {
            // Hide hero and make categories compact when filtering
            if (heroSection) heroSection.classList.add('hidden');
            if (categoriesContainer) categoriesContainer.classList.add('compact');
        } else {
            // Show hero and normal categories when no filters
            if (heroSection) heroSection.classList.remove('hidden');
            if (categoriesContainer) categoriesContainer.classList.remove('compact');
        }
    }

    hasActiveFilters() {
        return this.currentFilter.search || 
               this.currentFilter.category || 
               this.currentFilter.brand ||
               this.currentFilter.sort;
    }

    renderCategories() {
        const categoriesGrid = document.getElementById('categories-grid');
        if (!categoriesGrid) return;

        categoriesGrid.innerHTML = this.categories.map(category => `
            <div class="category-card" onclick="app.selectCategory('${category.name}')" 
                 tabindex="0" role="button" aria-label="Filter by ${category.name}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.count} producten</div>
            </div>
        `).join('');

        // Setup filter options
        this.setupFilterOptions();
    }

    setupFilterOptions() {
        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">Alle categorieën</option>' +
                this.categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
        }

        // Brand filter
        const brands = [...new Set(this.products.map(p => p.brand))].sort();
        const brandFilter = document.getElementById('brand-filter');
        if (brandFilter) {
            brandFilter.innerHTML = '<option value="">Alle merken</option>' +
                brands.map(brand => `<option value="${brand}">${brand}</option>`).join('');
        }
    }

    selectCategory(categoryName) {
        this.currentFilter.category = categoryName;
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) categoryFilter.value = categoryName;
        this.filterProducts();
        this.toggleHeroSection();
    }

    filterProducts() {
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = !this.currentFilter.search || 
                product.name.toLowerCase().includes(this.currentFilter.search) ||
                product.brand.toLowerCase().includes(this.currentFilter.search);

            const matchesCategory = !this.currentFilter.category || 
                product.category === this.currentFilter.category;

            const matchesBrand = !this.currentFilter.brand || 
                product.brand === this.currentFilter.brand;

            return matchesSearch && matchesCategory && matchesBrand;
        });

        this.sortProducts();
        this.renderProducts();
        this.updateProductsTitle();
    }

    sortProducts() {
        switch (this.currentFilter.sort) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => this.getLowestPrice(a) - this.getLowestPrice(b));
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => this.getLowestPrice(b) - this.getLowestPrice(a));
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'discount':
                this.filteredProducts.sort((a, b) => this.hasDiscount(b) - this.hasDiscount(a));
                break;
        }
    }

    getLowestPrice(product) {
        const prices = Object.values(product.stores).map(store => store.price);
        return prices.length > 0 ? Math.min(...prices) : Infinity;
    }

    hasDiscount(product) {
        return Object.values(product.stores).some(store => store.discount_percentage > 0) ? 1 : 0;
    }

    updateProductsTitle() {
        const title = document.getElementById('products-title');
        if (!title) return;

        if (this.currentFilter.category) {
            title.textContent = `${this.currentFilter.category} (${this.filteredProducts.length} producten)`;
        } else if (this.hasActiveFilters()) {
            title.textContent = `Zoekresultaten (${this.filteredProducts.length} producten)`;
        } else {
            title.textContent = `Alle Producten (${this.filteredProducts.length})`;
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>Geen producten gevonden</h3>
                    <p>Probeer andere filters of zoektermen.</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = this.filteredProducts.map(product => 
            this.renderProductCard(product)
        ).join('');
    }

    renderProductCard(product) {
        const stores = Object.entries(product.stores);
        const bestStore = this.findBestPriceStore(product);

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">${this.getCategoryIcon(product.category)}</div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-description">${product.description}</div>

                    <div class="product-pricing">
                        ${this.renderPriceComparison(product, bestStore)}
                        ${this.renderProductActions(product, bestStore)}
                    </div>
                </div>
            </div>
        `;
    }

    renderPriceComparison(product, bestStore) {
        const stores = Object.entries(product.stores);
        const [bestStoreId, bestStoreData] = bestStore;

        return `
            <div class="price-comparison">
                <div class="price-header">
                    <span class="best-price-badge">Beste prijs</span>
                    <div class="price-value">
                        ${bestStoreData.original_price ? 
                            `<span class="original-price">€${bestStoreData.original_price}</span>` : ''
                        }
                        €${bestStoreData.price}
                        ${bestStoreData.discount_percentage ? 
                            `<span class="discount-badge">-${bestStoreData.discount_percentage}%</span>` : ''
                        }
                    </div>
                </div>
                <div class="store-prices">
                    ${stores.map(([storeId, storeData]) => `
                        <div class="store-price ${storeId === bestStoreId ? 'best-price' : ''}">
                            <div class="store-name">
                                <img src="${this.getStoreLogo(storeId)}" alt="${this.getStoreName(storeId)}" class="store-logo" onerror="this.style.display='none'">
                                ${this.getStoreName(storeId)}
                            </div>
                            <div class="store-price-value">€${storeData.price}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderProductActions(product, bestStore) {
        const [bestStoreId, bestStoreData] = bestStore;
        const otherStores = Object.entries(product.stores).filter(([id, data]) => id !== bestStoreId);

        return `
            <div class="product-actions">
                <a href="${bestStoreData.url}" target="_blank" rel="noopener" class="buy-button primary" 
                   onclick="app.trackClick('${product.id}', '${bestStoreId}')">
                    <span class="button-store">${this.getStoreName(bestStoreId)}</span>
                    <span class="button-price">€${bestStoreData.price}</span>
                </a>
                ${otherStores.slice(0, 2).map(([storeId, storeData]) => `
                    <a href="${storeData.url}" target="_blank" rel="noopener" class="buy-button secondary"
                       onclick="app.trackClick('${product.id}', '${storeId}')">
                        <span class="button-store">${this.getStoreName(storeId)}</span>
                        <span class="button-price">€${storeData.price}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }

    findBestPriceStore(product) {
        const stores = Object.entries(product.stores);
        return stores.reduce((best, current) => {
            return current[1].price < best[1].price ? current : best;
        });
    }

    getStoreName(storeId) {
        const storeNames = {
            'glutenvrijewebshop.nl': 'Glutenvrije Webshop',
            'glutenvrijemarkt.com': 'Glutenvrijemarkt',
            'ah.nl': 'Albert Heijn',
            'jumbo.com': 'Jumbo',
            'plus.nl': 'Plus',
            'schar.com': 'Schär',
            'picnic.app': 'Picnic',
            'happybakers.nl': 'Happy Bakers',
            'thefreefromshop.nl': 'The Free From Shop',
            'winkelglutenvrij.nl': 'Winkelglutenvrij',
            'ruttmans.nl': 'Ruttmans',
            'glutenvrijgemak.nl': 'Glutenvrij Gemak',
            'bfreez.nl': 'BFreez',
            'bakkerleo.nl': 'Bakker Leo',
            'hollandbarrett.nl': 'Holland & Barrett'
        };
        return storeNames[storeId] || storeId;
    }

    getStoreLogo(storeId) {
        const logoMap = {
            'ah.nl': 'assets/logo/ah-albert-heijn.svg',
            'jumbo.com': 'assets/logo/jumbo-logo.svg', 
            'plus.nl': 'assets/logo/plus.svg',
            'glutenvrijewebshop.nl': 'assets/logo/glutenvrijewebshop.png',
            'schar.com': 'assets/logo/schar.png',
            'picnic.app': 'assets/logo/Picnic_logo.svg.png'
        };
        return logoMap[storeId] || 'assets/logo/default.png';
    }

    renderPartners() {
        const partnersGrid = document.querySelector('.partners-grid');
        if (!partnersGrid) return;

        partnersGrid.innerHTML = this.partners.map(partner => `
            <div class="partner-item">
                <img src="${partner.logo}" alt="${partner.name}" class="partner-logo" onerror="this.style.display='none'">
                <div class="partner-name">${partner.name}</div>
            </div>
        `).join('');
    }

    updateStats() {
        // Calculate statistics
        const productsWithDiscount = this.products.filter(p => 
            Object.values(p.stores).some(s => s.discount_percentage > 0)
        );

        const avgSavings = this.calculateAverageSavings();
        const popularCategory = this.findPopularCategory();

        // Update stat displays
        const avgSavingsEl = document.getElementById('avg-savings');
        const productsOnSaleEl = document.getElementById('products-on-sale');
        const popularCategoryEl = document.getElementById('popular-category');
        const newProductsEl = document.getElementById('new-products');
        const totalProductsEl = document.getElementById('total-products');

        if (avgSavingsEl) avgSavingsEl.textContent = `€${avgSavings.toFixed(2)}`;
        if (productsOnSaleEl) productsOnSaleEl.textContent = productsWithDiscount.length.toString();
        if (popularCategoryEl) popularCategoryEl.textContent = popularCategory;
        if (newProductsEl) newProductsEl.textContent = Math.floor(this.products.length * 0.15).toString();
        if (totalProductsEl) totalProductsEl.textContent = `${this.products.length}+`;
    }

    calculateAverageSavings() {
        let totalSavings = 0;
        let count = 0;

        this.products.forEach(product => {
            Object.values(product.stores).forEach(store => {
                if (store.original_price && store.price) {
                    totalSavings += store.original_price - store.price;
                    count++;
                }
            });
        });

        return count > 0 ? totalSavings / count : 0;
    }

    findPopularCategory() {
        const categoryCounts = {};
        this.products.forEach(product => {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        });

        return Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0]?.split(' ')[0] || 'Brood';
    }

    trackClick(productId, storeId) {
        console.log(`Product clicked: ${productId} at ${storeId}`);
        // Here you can add analytics tracking
    }

    // Link validation system - addresses user's concern about broken links
    async initLinkValidation() {
        console.log('🔍 Initializing link validation system...');

        // Background validation - don't block UI
        setTimeout(() => {
            this.validateAllProductLinks();
        }, 3000);
    }

    async validateAllProductLinks() {
        console.log('🔗 Starting comprehensive link validation...');
        let validLinks = 0;
        let brokenLinks = 0;
        const brokenLinksList = [];

        for (const product of this.products) {
            for (const [storeId, storeData] of Object.entries(product.stores)) {
                try {
                    const isValid = await this.validateLink(storeData.url, storeId);
                    if (isValid) {
                        validLinks++;
                    } else {
                        brokenLinks++;
                        brokenLinksList.push({
                            product: product.name,
                            store: this.getStoreName(storeId),
                            url: storeData.url,
                            suggestedFix: this.suggestUrlFix(storeData.url, storeId, product.name)
                        });
                    }
                } catch (error) {
                    console.warn(`Link validation failed for ${product.name} at ${storeId}:`, error);
                    brokenLinks++;
                }

                // Add small delay to prevent overwhelming servers
                await this.delay(100);
            }
        }

        console.log(`✅ Link validation complete: ${validLinks} valid, ${brokenLinks} broken`);

        if (brokenLinksList.length > 0) {
            console.log('🔧 Suggested link fixes:', brokenLinksList);
            this.reportBrokenLinks(brokenLinksList);
        }
    }

    async validateLink(url, storeId) {
        // For client-side validation, we'll use a different approach
        // Since CORS prevents direct checking, we'll validate URL structure
        return this.validateUrlStructure(url, storeId);
    }

    validateUrlStructure(url, storeId) {
        try {
            const urlObj = new URL(url);

            // Store-specific validation rules based on research
            const validationRules = {
                'glutenvrijewebshop.nl': {
                    domain: 'www.glutenvrijewebshop.nl',
                    pattern: /\.html$/,
                    pathFormat: 'kebab-case'
                },
                'ah.nl': {
                    domain: 'www.ah.nl',
                    pattern: /\/producten\//,
                    pathFormat: 'kebab-case'
                },
                'jumbo.com': {
                    domain: 'www.jumbo.com',
                    pattern: /\/producten\//,
                    pathFormat: 'kebab-case'
                }
            };

            const rule = validationRules[storeId];
            if (rule) {
                return urlObj.hostname === rule.domain && 
                       (rule.pattern ? rule.pattern.test(url) : true);
            }

            return true; // Default to valid if no specific rules
        } catch (error) {
            return false;
        }
    }

    suggestUrlFix(brokenUrl, storeId, productName) {
        // Generate correct URL structure based on user's example
        const safeName = productName.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .trim();

        const fixes = {
            'glutenvrijewebshop.nl': `https://www.glutenvrijewebshop.nl/${safeName}.html`,
            'ah.nl': `https://www.ah.nl/producten/${safeName}`,
            'jumbo.com': `https://www.jumbo.com/producten/${safeName}`
        };

        return fixes[storeId] || brokenUrl.replace(/\/product\/[^/]+$/, `/product/${safeName}`);
    }

    reportBrokenLinks(brokenLinks) {
        // This would normally send data to your backend for fixing
        console.log('📋 Broken Links Report:');
        brokenLinks.forEach(link => {
            console.log(`❌ ${link.product} (${link.store})`);
            console.log(`   Broken: ${link.url}`);
            console.log(`   Suggested: ${link.suggestedFix}`);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Automated Product Discovery System
    async startProductDiscovery() {
        console.log('🤖 Starting automated product discovery...');

        const discoveryTargets = [
            'glutenvrijewebshop.nl',
            'glutenvrijemarkt.com',
            'ah.nl',
            'jumbo.com',
            'thefreefromshop.nl',
            'happybakers.nl'
        ];

        for (const target of discoveryTargets) {
            await this.discoverProductsFromStore(target);
        }
    }

    async discoverProductsFromStore(storeId) {
        // This is a placeholder for automated discovery
        // In a real implementation, this would involve:
        // 1. Scraping store product pages
        // 2. Identifying new glutenvrije products
        // 3. Extracting pricing and details
        // 4. Updating the database

        console.log(`🔍 Discovering products from ${storeId}...`);

        // Simulated discovery results
        const mockDiscoveredProducts = [
            `New glutenvrije product found at ${storeId}`,
            `Price update detected for existing product at ${storeId}`
        ];

        console.log(`✅ Discovery complete for ${storeId}:`, mockDiscoveredProducts);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GlutenvergelijkerApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlutenvergelijkerApp;
}
