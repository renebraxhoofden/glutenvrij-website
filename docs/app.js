// Glutenvergelijker.nl - Main Application
// Supports 2500+ products with automatic updates and affiliate links

class GlutenvergelijkerApp {
    constructor() {
        // Core data
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.stats = {};
        this.partners = [];

        // UI state
        this.currentFilter = {
            category: '',
            brand: '',
            store: '',
            search: '',
            sort: ''
        };

        this.displayedProducts = 0;
        this.productsPerPage = 24;
        this.isLoading = false;

        // Initialize when data is loaded
        this.init();
    }

    async init() {
        console.log('🌾 Initializing Glutenvergelijker.nl App...');

        // Wait for data to load
        if (window.glutenvrijeProducten && window.glutenvrijeProducten.length > 0) {
            this.onDataLoaded();
        } else {
            document.addEventListener('glutenvrijeDataLoaded', () => {
                this.onDataLoaded();
            });
        }
    }

    onDataLoaded() {
        console.log('📊 Data loaded, starting app...');

        // Load data
        this.products = window.glutenvrijeProducten || [];
        this.categories = window.glutenvrijeCategories || [];
        this.stats = window.glutenvrijeStats || {};

        console.log(`✅ App initialized with ${this.products.length} products`);

        // Setup UI
        this.setupEventListeners();
        this.setupPartners();
        this.renderCategories();
        this.renderDeals();
        this.resetAndRenderProducts();
        this.updateStatistics();
        this.updateProductCount();

        // Hide loading indicator
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';

        console.log('🎉 Glutenvergelijker.nl ready!');
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilter.search = e.target.value.toLowerCase().trim();
                    this.applyFiltersAndRender();
                }, 300);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.applyFiltersAndRender();
            });
        }

        // Filter controls
        this.setupFilterControl('category-filter', 'category');
        this.setupFilterControl('brand-filter', 'brand');  
        this.setupFilterControl('store-filter', 'store');
        this.setupFilterControl('sort-filter', 'sort');

        // Clear filters
        const clearFilters = document.getElementById('clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }

        // Newsletter signup
        const newsletterBtn = document.getElementById('newsletter-btn');
        if (newsletterBtn) {
            newsletterBtn.addEventListener('click', () => {
                this.handleNewsletterSignup();
            });
        }
    }

    setupFilterControl(elementId, filterType) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', (e) => {
                this.currentFilter[filterType] = e.target.value;
                this.applyFiltersAndRender();
            });
        }
    }

    setupPartners() {
        // Get unique stores from products
        const storeMap = new Map();
        this.products.forEach(product => {
            if (product.stores) {
                Object.keys(product.stores).forEach(storeId => {
                    if (!storeMap.has(storeId)) {
                        storeMap.set(storeId, {
                            id: storeId,
                            name: this.getStoreName(storeId),
                            logo: this.getStoreLogo(storeId),
                            productCount: 0
                        });
                    }
                    storeMap.get(storeId).productCount++;
                });
            }
        });

        this.partners = Array.from(storeMap.values())
            .sort((a, b) => b.productCount - a.productCount);

        this.renderPartners();
    }

    renderCategories() {
        const categoriesGrid = document.getElementById('categories-grid');
        if (!categoriesGrid) return;

        // Sort categories by product count
        const sortedCategories = [...this.categories]
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Show top 8 categories

        categoriesGrid.innerHTML = sortedCategories.map(category => `
            <div class="category-card" data-category="${category.name}" 
                 onclick="app.selectCategory('${category.name}')" 
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
                this.categories
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(cat => `<option value="${cat.name}">${cat.name} (${cat.count})</option>`)
                    .join('');
        }

        // Brand filter
        const brands = [...new Set(this.products.map(p => p.brand))]
            .filter(brand => brand)
            .sort();

        const brandFilter = document.getElementById('brand-filter');
        if (brandFilter) {
            brandFilter.innerHTML = '<option value="">Alle merken</option>' +
                brands.map(brand => {
                    const count = this.products.filter(p => p.brand === brand).length;
                    return `<option value="${brand}">${brand} (${count})</option>`;
                }).join('');
        }

        // Store filter
        const storeFilter = document.getElementById('store-filter');
        if (storeFilter) {
            storeFilter.innerHTML = '<option value="">Alle winkels</option>' +
                this.partners.map(partner => 
                    `<option value="${partner.id}">${partner.name} (${partner.productCount})</option>`
                ).join('');
        }
    }

    renderDeals() {
        const dealsGrid = document.getElementById('deals-grid');
        if (!dealsGrid) return;

        // Find products with discounts
        const dealsProducts = this.products
            .filter(product => this.hasDiscount(product))
            .sort((a, b) => this.getHighestDiscount(b) - this.getHighestDiscount(a))
            .slice(0, 6);

        if (dealsProducts.length === 0) {
            document.getElementById('deals-section').style.display = 'none';
            return;
        }

        dealsGrid.innerHTML = dealsProducts.map(product => {
            const bestStore = this.findBestPriceStore(product);
            const discount = this.getHighestDiscount(product);

            return `
                <div class="deal-card">
                    <div class="deal-badge">-${discount}%</div>
                    <div class="deal-content">
                        <h4 class="deal-title">${product.name}</h4>
                        <div class="deal-price">
                            <span class="deal-old-price">€${bestStore[1].original_price}</span>
                            <span class="deal-new-price">€${bestStore[1].price}</span>
                        </div>
                        <div class="deal-store">${this.getStoreName(bestStore[0])}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    selectCategory(categoryName) {
        this.currentFilter.category = categoryName;
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) categoryFilter.value = categoryName;
        this.applyFiltersAndRender();

        // Scroll to products
        document.getElementById('products-container').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    applyFiltersAndRender() {
        this.filterProducts();
        this.toggleHeroSection();
        this.resetAndRenderProducts();
        this.updateProductsTitle();
        this.updateProductCount();
    }

    filterProducts() {
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (this.currentFilter.search) {
                const searchTerm = this.currentFilter.search;
                const searchable = [
                    product.name,
                    product.brand,
                    product.category,
                    product.description
                ].join(' ').toLowerCase();

                if (!searchable.includes(searchTerm)) {
                    return false;
                }
            }

            // Category filter
            if (this.currentFilter.category && product.category !== this.currentFilter.category) {
                return false;
            }

            // Brand filter
            if (this.currentFilter.brand && product.brand !== this.currentFilter.brand) {
                return false;
            }

            // Store filter
            if (this.currentFilter.store && !product.stores[this.currentFilter.store]) {
                return false;
            }

            return true;
        });

        this.sortProducts();
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
                this.filteredProducts.sort((a, b) => this.getHighestDiscount(b) - this.getHighestDiscount(a));
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => new Date(b.last_discovered || 0) - new Date(a.last_discovered || 0));
                break;
            default:
                // Default: sort by relevance (discounts first, then alphabetical)
                this.filteredProducts.sort((a, b) => {
                    const aDiscount = this.hasDiscount(a) ? 1 : 0;
                    const bDiscount = this.hasDiscount(b) ? 1 : 0;
                    if (aDiscount !== bDiscount) return bDiscount - aDiscount;
                    return a.name.localeCompare(b.name);
                });
        }
    }

    resetAndRenderProducts() {
        this.displayedProducts = 0;
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = '';
        }
        this.loadMoreProducts();
    }

    loadMoreProducts() {
        const productsGrid = document.getElementById('products-grid');
        const loadMoreBtn = document.getElementById('load-more-btn');

        if (!productsGrid) return;

        const startIndex = this.displayedProducts;
        const endIndex = Math.min(startIndex + this.productsPerPage, this.filteredProducts.length);

        if (startIndex >= this.filteredProducts.length) {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        // Show loading state
        this.isLoading = true;
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Laden...';
            loadMoreBtn.disabled = true;
        }

        // Simulate loading delay for better UX
        setTimeout(() => {
            const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

            productsToShow.forEach(product => {
                const productCard = this.createProductCard(product);
                productsGrid.insertAdjacentHTML('beforeend', productCard);
            });

            this.displayedProducts = endIndex;

            // Update load more button
            if (loadMoreBtn) {
                if (endIndex >= this.filteredProducts.length) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.textContent = `Meer producten laden (${this.filteredProducts.length - endIndex} over)`;
                    loadMoreBtn.disabled = false;
                    loadMoreBtn.style.display = 'block';
                }
            }

            this.isLoading = false;

            // Update count
            this.updateProductCount();

        }, 300);
    }

    createProductCard(product) {
        const stores = Object.entries(product.stores || {});
        const bestStore = this.findBestPriceStore(product);
        const hasDiscountFlag = this.hasDiscount(product);
        const highestDiscount = this.getHighestDiscount(product);

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'">` : 
                        this.getCategoryIcon(product.category)
                    }
                    ${hasDiscountFlag ? `<div class="product-discount-badge">-${highestDiscount}%</div>` : ''}
                </div>

                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-brand">${product.brand || 'Onbekend merk'}</div>
                    ${product.description ? `<div class="product-description">${product.description}</div>` : ''}

                    <div class="product-badges">
                        ${product.nutritional_info?.organic ? '<span class="badge badge-organic">Bio</span>' : ''}
                        ${product.nutritional_info?.vegan ? '<span class="badge badge-vegan">Vegan</span>' : ''}
                        ${product.nutritional_info?.lactose_free ? '<span class="badge badge-lactose">Lactosevrij</span>' : ''}
                    </div>

                    <div class="product-pricing">
                        ${this.renderPriceComparison(product, bestStore)}
                        ${this.renderProductActions(product, bestStore, stores)}
                    </div>
                </div>
            </div>
        `;
    }

    renderPriceComparison(product, bestStore) {
        const stores = Object.entries(product.stores || {});
        const [bestStoreId, bestStoreData] = bestStore;

        return `
            <div class="price-comparison">
                <div class="price-header">
                    <span class="best-price-badge">Beste prijs</span>
                    <div class="price-value">
                        ${bestStoreData.original_price ? 
                            `<span class="original-price">€${bestStoreData.original_price.toFixed(2)}</span>` : ''
                        }
                        <span class="current-price">€${bestStoreData.price.toFixed(2)}</span>
                        ${bestStoreData.discount_percentage ? 
                            `<span class="discount-badge">-${bestStoreData.discount_percentage}%</span>` : ''
                        }
                    </div>
                </div>

                ${stores.length > 1 ? `
                    <div class="store-prices">
                        ${stores
                            .sort((a, b) => a[1].price - b[1].price)
                            .map(([storeId, storeData]) => `
                                <div class="store-price ${storeId === bestStoreId ? 'best-price' : ''}">
                                    <div class="store-name">
                                        <img src="${this.getStoreLogo(storeId)}" alt="${this.getStoreName(storeId)}" class="store-logo" onerror="this.style.display='none'">
                                        <span>${this.getStoreName(storeId)}</span>
                                    </div>
                                    <div class="store-price-value">€${storeData.price.toFixed(2)}</div>
                                </div>
                            `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderProductActions(product, bestStore, stores) {
        const [bestStoreId, bestStoreData] = bestStore;
        const otherStores = stores.filter(([id]) => id !== bestStoreId).slice(0, 2);

        return `
            <div class="product-actions">
                <a href="${bestStoreData.url}" target="_blank" rel="noopener nofollow" 
                   class="buy-button primary" 
                   onclick="app.trackClick('${product.id}', '${bestStoreId}', 'primary')">
                    <span class="button-store">Koop bij ${this.getStoreName(bestStoreId)}</span>
                    <span class="button-price">€${bestStoreData.price.toFixed(2)}</span>
                </a>

                ${otherStores.map(([storeId, storeData]) => `
                    <a href="${storeData.url}" target="_blank" rel="noopener nofollow" 
                       class="buy-button secondary"
                       onclick="app.trackClick('${product.id}', '${storeId}', 'secondary')">
                        <span class="button-store">${this.getStoreName(storeId)}</span>
                        <span class="button-price">€${storeData.price.toFixed(2)}</span>
                    </a>
                `).join('')}
            </div>
        `;
    }

    toggleHeroSection() {
        const heroSection = document.getElementById('hero-section');
        const categoriesContainer = document.getElementById('categories-container');
        const dealsSection = document.getElementById('deals-section');

        if (this.hasActiveFilters()) {
            // Hide hero and deals, compact categories when filtering
            if (heroSection) heroSection.classList.add('hidden');
            if (categoriesContainer) categoriesContainer.classList.add('compact');
            if (dealsSection) dealsSection.classList.add('hidden');
        } else {
            // Show hero and deals, normal categories when no filters
            if (heroSection) heroSection.classList.remove('hidden');
            if (categoriesContainer) categoriesContainer.classList.remove('compact');
            if (dealsSection) dealsSection.classList.remove('hidden');
        }
    }

    hasActiveFilters() {
        return this.currentFilter.search || 
               this.currentFilter.category || 
               this.currentFilter.brand ||
               this.currentFilter.store ||
               this.currentFilter.sort;
    }

    clearAllFilters() {
        // Reset filter state
        this.currentFilter = {
            category: '',
            brand: '',
            store: '',
            search: '',
            sort: ''
        };

        // Reset UI elements
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';

        ['category-filter', 'brand-filter', 'store-filter', 'sort-filter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });

        // Re-render
        this.applyFiltersAndRender();
    }

    updateProductsTitle() {
        const title = document.getElementById('products-title');
        if (!title) return;

        if (this.currentFilter.category) {
            title.textContent = `${this.currentFilter.category} (${this.filteredProducts.length} producten)`;
        } else if (this.hasActiveFilters()) {
            title.textContent = `Zoekresultaten (${this.filteredProducts.length} producten)`;
        } else {
            title.textContent = `Alle Producten`;
        }
    }

    updateProductCount() {
        const countElement = document.getElementById('products-count');
        if (countElement) {
            if (this.hasActiveFilters()) {
                countElement.textContent = `${this.displayedProducts} van ${this.filteredProducts.length} producten getoond`;
            } else {
                countElement.textContent = `${this.displayedProducts} van ${this.products.length} producten getoond`;
            }
        }
    }

    updateStatistics() {
        // Update hero stats
        const totalProductsEl = document.getElementById('total-products');
        const dailyDealsEl = document.getElementById('daily-deals');

        if (totalProductsEl) {
            totalProductsEl.textContent = `${this.products.length}+`;
        }

        const dealsCount = this.products.filter(p => this.hasDiscount(p)).length;
        if (dailyDealsEl) {
            dailyDealsEl.textContent = `${dealsCount}+`;
        }

        // Update detailed stats
        const avgSavingsEl = document.getElementById('avg-savings');
        const productsOnSaleEl = document.getElementById('products-on-sale');
        const popularCategoryEl = document.getElementById('popular-category');
        const newProductsEl = document.getElementById('new-products');
        const totalProductsStatEl = document.getElementById('total-products-stat');

        if (avgSavingsEl) {
            const avgSavings = this.calculateAverageSavings();
            avgSavingsEl.textContent = `€${avgSavings.toFixed(2)}`;
        }

        if (productsOnSaleEl) {
            productsOnSaleEl.textContent = dealsCount.toString();
        }

        if (popularCategoryEl) {
            const popularCategory = this.findPopularCategory();
            popularCategoryEl.textContent = popularCategory.name;

            const popularCategoryCountEl = document.getElementById('popular-category-count');
            if (popularCategoryCountEl) {
                popularCategoryCountEl.textContent = `${popularCategory.count} producten`;
            }
        }

        if (newProductsEl) {
            const newCount = this.products.filter(p => {
                if (!p.last_discovered) return false;
                const discovered = new Date(p.last_discovered);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return discovered > weekAgo;
            }).length;
            newProductsEl.textContent = newCount.toString();
        }

        if (totalProductsStatEl) {
            totalProductsStatEl.textContent = `${this.products.length}+`;
        }

        // Update last updated
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = this.stats.lastUpdated || 'vandaag';
        }
    }

    renderPartners() {
        const partnersGrid = document.getElementById('partners-grid');
        if (!partnersGrid) return;

        partnersGrid.innerHTML = this.partners.map(partner => `
            <div class="partner-item" data-store="${partner.id}">
                <img src="${partner.logo}" alt="${partner.name}" class="partner-logo" 
                     onerror="this.style.display='none'">
                <div class="partner-info">
                    <div class="partner-name">${partner.name}</div>
                    <div class="partner-count">${partner.productCount} producten</div>
                </div>
            </div>
        `).join('');
    }

    handleNewsletterSignup() {
        const emailInput = document.getElementById('newsletter-email');
        const btn = document.getElementById('newsletter-btn');

        if (!emailInput || !btn) return;

        const email = emailInput.value.trim();

        if (!email || !email.includes('@')) {
            alert('Voer een geldig e-mailadres in');
            return;
        }

        // Simulate signup
        btn.textContent = 'Inschrijven...';
        btn.disabled = true;

        setTimeout(() => {
            alert('Bedankt voor je inschrijving! Je ontvangt binnenkort de eerste nieuwsbrief.');
            emailInput.value = '';
            btn.textContent = 'Ingeschreven ✓';

            setTimeout(() => {
                btn.textContent = 'Inschrijven';
                btn.disabled = false;
            }, 3000);
        }, 1000);
    }

    // Utility functions
    findBestPriceStore(product) {
        if (!product.stores) return ['unknown', { price: 0, url: '#' }];

        const stores = Object.entries(product.stores);
        return stores.reduce((best, current) => {
            return current[1].price < best[1].price ? current : best;
        });
    }

    getLowestPrice(product) {
        if (!product.stores) return Infinity;
        const prices = Object.values(product.stores).map(store => store.price);
        return prices.length > 0 ? Math.min(...prices) : Infinity;
    }

    hasDiscount(product) {
        if (!product.stores) return false;
        return Object.values(product.stores).some(store => store.discount_percentage > 0);
    }

    getHighestDiscount(product) {
        if (!product.stores) return 0;
        const discounts = Object.values(product.stores).map(store => store.discount_percentage || 0);
        return Math.max(...discounts);
    }

    calculateAverageSavings() {
        let totalSavings = 0;
        let count = 0;

        this.products.forEach(product => {
            if (product.stores) {
                Object.values(product.stores).forEach(store => {
                    if (store.original_price && store.price && store.original_price > store.price) {
                        totalSavings += store.original_price - store.price;
                        count++;
                    }
                });
            }
        });

        return count > 0 ? totalSavings / count : 0;
    }

    findPopularCategory() {
        if (this.categories.length === 0) return { name: 'Brood', count: 0 };

        const sorted = [...this.categories].sort((a, b) => b.count - a.count);
        return sorted[0];
    }

    getStoreName(storeId) {
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
            'bakkerleo.nl': 'Bakker Leo',
            'bfreez.nl': 'BFreez'
        };
        return storeNames[storeId] || storeId.replace('.nl', '').replace('.com', '');
    }

    getStoreLogo(storeId) {
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

    getCategoryIcon(category) {
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

    trackClick(productId, storeId, type) {
        // Track clicks for analytics and affiliate conversion
        console.log(`🔗 Product click: ${productId} → ${storeId} (${type})`);

        // Send to analytics (implement your tracking here)
        if (window.gtag) {
            gtag('event', 'product_click', {
                'product_id': productId,
                'store_id': storeId,
                'click_type': type
            });
        }

        // Track for affiliate conversion
        if (window.affiliateTracker) {
            window.affiliateTracker.track(productId, storeId, type);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GlutenvergelijkerApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlutenvergelijkerApp;
}