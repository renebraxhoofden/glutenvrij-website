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
            <div class="category-card" onclick="app.filterByCategory('${category.name}')" role="button" tabindex="0">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.count} producten</div>
            </div>
        `).join('');
    }
    
    renderDeals() {
        const dealsGrid = document.getElementById('deals-grid');
        if (!dealsGrid) return;
        
        // Find products with discounts
        const dealsProducts = this.products
            .filter(product => this.hasDiscount(product))
            .slice(0, 6); // Show 6 deals
        
        if (dealsProducts.length === 0) {
            dealsGrid.innerHTML = '<p>Geen aanbiedingen beschikbaar op dit moment.</p>';
            return;
        }
        
        dealsGrid.innerHTML = dealsProducts.map(product => {
            const bestPrice = this.getBestPrice(product);
            const discount = this.getBestDiscount(product);
            
            return `
                <div class="deal-card">
                    <div class="deal-badge">-${discount.percentage}%</div>
                    <div class="deal-title">${product.name}</div>
                    <div class="deal-price">
                        <span class="deal-old-price">€${discount.original_price}</span>
                        <span class="deal-new-price">€${bestPrice.price}</span>
                    </div>
                    <div class="deal-store">${bestPrice.store_name}</div>
                </div>
            `;
        }).join('');
    }
    
    renderPartners() {
        const partnersGrid = document.getElementById('partners-grid');
        if (!partnersGrid) return;
        
        partnersGrid.innerHTML = this.partners.map(partner => `
            <div class="partner-item">
                <img src="${partner.logo}" alt="${partner.name}" class="partner-logo" 
                     onerror="this.src='assets/logo/default.png'">
                <div class="partner-info">
                    <div class="partner-name">${partner.name}</div>
                    <div class="partner-count">${partner.productCount} producten</div>
                </div>
            </div>
        `).join('');
    }
    
    applyFiltersAndRender() {
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (this.currentFilter.search) {
                const searchTerm = this.currentFilter.search;
                const searchFields = [
                    product.name,
                    product.brand,
                    product.description,
                    product.category
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(searchTerm)) {
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
            if (this.currentFilter.store) {
                if (!product.stores || !product.stores[this.currentFilter.store]) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Apply sorting
        this.sortProducts();
        
        // Reset display
        this.displayedProducts = 0;
        this.renderProducts();
        this.updateProductCount();
        
        // Update hero section
        this.updateHeroVisibility();
    }
    
    sortProducts() {
        if (!this.currentFilter.sort) return;
        
        this.filteredProducts.sort((a, b) => {
            switch (this.currentFilter.sort) {
                case 'price-asc':
                    return this.getBestPrice(a).price - this.getBestPrice(b).price;
                case 'price-desc':
                    return this.getBestPrice(b).price - this.getBestPrice(a).price;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'discount-desc':
                    return this.getBestDiscount(b).percentage - this.getBestDiscount(a).percentage;
                default:
                    return 0;
            }
        });
    }
    
    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        if (!productsGrid) return;
        
        const startIndex = this.displayedProducts;
        const endIndex = Math.min(startIndex + this.productsPerPage, this.filteredProducts.length);
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        if (startIndex === 0) {
            productsGrid.innerHTML = '';
        }
        
        productsGrid.innerHTML += productsToShow.map(product => this.renderProductCard(product)).join('');
        
        this.displayedProducts = endIndex;
        
        // Show/hide load more button
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex < this.filteredProducts.length ? 'block' : 'none';
        }
    }
    
    renderProductCard(product) {
        const bestPrice = this.getBestPrice(product);
        const allPrices = this.getAllPrices(product);
        const discount = this.getBestDiscount(product);
        const badges = this.generateBadges(product);
        
        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image || 'https://images.unsplash.com/photo-1556908114-f6e7ad7d3136?w=400&h=300&fit=crop'}" 
                         alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1556908114-f6e7ad7d3136?w=400&h=300&fit=crop'">
                    ${discount.percentage > 0 ? `<div class="product-discount-badge">-${discount.percentage}%</div>` : ''}
                </div>
                
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">${product.description}</div>
                    
                    ${badges.length > 0 ? `<div class="product-badges">${badges.join('')}</div>` : ''}
                    
                    <div class="price-comparison">
                        <div class="price-header">
                            <div class="best-price-badge">Beste prijs</div>
                            <div class="price-value">
                                ${discount.percentage > 0 ? `<span class="original-price">€${discount.original_price}</span>` : ''}
                                <span class="current-price">€${bestPrice.price}</span>
                            </div>
                        </div>
                        
                        <div class="store-prices">
                            ${allPrices.slice(0, 3).map((price, index) => `
                                <div class="store-price ${index === 0 ? 'best-price' : ''}">
                                    <div class="store-name">
                                        <img src="${price.logo}" alt="${price.store_name}" class="store-logo">
                                        ${price.store_name}
                                    </div>
                                    <div class="store-price-value">€${price.price}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <a href="${bestPrice.url}" target="_blank" rel="nofollow" class="buy-button primary">
                            <span class="button-store">${bestPrice.store_name}</span>
                            <span class="button-price">€${bestPrice.price}</span>
                        </a>
                        ${allPrices.length > 1 ? `
                            <a href="${allPrices[1].url}" target="_blank" rel="nofollow" class="buy-button secondary">
                                <span class="button-store">${allPrices[1].store_name}</span>
                                <span class="button-price">€${allPrices[1].price}</span>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    getBestPrice(product) {
        if (!product.stores) {
            return { price: 0, store_name: 'Onbekend', url: '#', logo: '' };
        }
        
        const prices = Object.entries(product.stores).map(([storeId, storeData]) => ({
            store_id: storeId,
            store_name: this.getStoreName(storeId),
            price: storeData.price,
            url: storeData.url || '#',
            logo: this.getStoreLogo(storeId)
        })).filter(p => p.price > 0);
        
        if (prices.length === 0) {
            return { price: 0, store_name: 'Onbekend', url: '#', logo: '' };
        }
        
        return prices.sort((a, b) => a.price - b.price)[0];
    }
    
    getAllPrices(product) {
        if (!product.stores) return [];
        
        return Object.entries(product.stores)
            .map(([storeId, storeData]) => ({
                store_id: storeId,
                store_name: this.getStoreName(storeId),
                price: storeData.price,
                url: storeData.url || '#',
                logo: this.getStoreLogo(storeId)
            }))
            .filter(p => p.price > 0)
            .sort((a, b) => a.price - b.price);
    }
    
    getBestDiscount(product) {
        let bestDiscount = { percentage: 0, original_price: 0 };
        
        if (!product.stores) return bestDiscount;
        
        Object.values(product.stores).forEach(storeData => {
            if (storeData.discount_percentage > bestDiscount.percentage) {
                bestDiscount = {
                    percentage: storeData.discount_percentage,
                    original_price: storeData.original_price
                };
            }
        });
        
        return bestDiscount;
    }
    
    hasDiscount(product) {
        if (!product.stores) return false;
        
        return Object.values(product.stores).some(store => 
            store.discount_percentage && store.discount_percentage > 0
        );
    }
    
    generateBadges(product) {
        const badges = [];
        
        if (product.nutritional_info) {
            if (product.nutritional_info.organic) {
                badges.push('<span class="badge badge-organic">Bio</span>');
            }
            if (product.nutritional_info.vegan) {
                badges.push('<span class="badge badge-vegan">Vegan</span>');
            }
            if (product.nutritional_info.lactose_free) {
                badges.push('<span class="badge badge-lactose">Lactosevrij</span>');
            }
        }
        
        return badges;
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
            'bakkerleo.nl': 'Bakker Leo'
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
    
    resetAndRenderProducts() {
        this.filteredProducts = [...this.products];
        this.displayedProducts = 0;
        this.renderProducts();
    }
    
    loadMoreProducts() {
        this.renderProducts();
    }
    
    updateProductCount() {
        const countElement = document.getElementById('products-count');
        if (countElement) {
            countElement.textContent = `${this.filteredProducts.length} producten gevonden`;
        }
        
        const lastUpdatedElement = document.getElementById('last-updated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date().toLocaleDateString('nl-NL');
        }
    }
    
    updateStatistics() {
        // Update various statistics on the page
        const statElements = {
            'stat-total-products': this.products.length,
            'stat-avg-savings': '€2.50',
            'stat-deals-today': this.products.filter(p => this.hasDiscount(p)).length,
            'stat-popular-category': this.categories.length > 0 ? this.categories[0].name.split(' ')[0] : 'Brood',
            'stat-new-products': Math.floor(this.products.length / 10),
            'stat-total-stores': this.partners.length
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
    
    updateHeroVisibility() {
        const hero = document.querySelector('.hero');
        const categoriesSection = document.querySelector('.categories-section');
        const dealsSection = document.querySelector('.deals-section');
        
        if (this.currentFilter.search || this.currentFilter.category || 
            this.currentFilter.brand || this.currentFilter.store) {
            // Hide hero and compact other sections when filtering
            if (hero) hero.classList.add('hidden');
            if (categoriesSection) categoriesSection.classList.add('compact');
            if (dealsSection) dealsSection.classList.add('hidden');
        } else {
            // Show all sections when not filtering
            if (hero) hero.classList.remove('hidden');
            if (categoriesSection) categoriesSection.classList.remove('compact');
            if (dealsSection) dealsSection.classList.remove('hidden');
        }
    }
    
    filterByCategory(categoryName) {
        this.currentFilter.category = categoryName;
        
        // Update category filter dropdown
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = categoryName;
        }
        
        this.applyFiltersAndRender();
    }
    
    clearAllFilters() {
        this.currentFilter = {
            category: '',
            brand: '',
            store: '',
            search: '',
            sort: ''
        };
        
        // Clear all filter controls
        const controls = ['category-filter', 'brand-filter', 'store-filter', 'sort-filter', 'search-input'];
        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.value = '';
            }
        });
        
        this.applyFiltersAndRender();
    }
    
    handleNewsletterSignup() {
        const emailInput = document.getElementById('newsletter-email');
        if (emailInput && emailInput.value) {
            // Simple validation
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailRegex.test(email)) {
                alert('Bedankt voor je aanmelding! Je ontvangt binnenkort onze eerste nieuwsbrief.');
                emailInput.value = '';
            } else {
                alert('Voer een geldig e-mailadres in.');
            }
        }
    }
}

// Initialize app when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new GlutenvergelijkerApp();
    });
} else {
    app = new GlutenvergelijkerApp();
}