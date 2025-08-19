// Glutenvergelijker.nl - Verbeterde App (Flits-problemen opgelost)
// Ondersteunt 2500+ producten met smooth UI en betere performance

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
        
        // Performance optimizations
        this.searchTimeout = null;
        this.renderTimeout = null;
        this.lastRenderTime = 0;
        
        // Initialize when data is loaded
        this.init();
    }

    async init() {
        console.log('🌾 Initializing Glutenvergelijker.nl App...');
        
        // Show loading state immediately
        this.showLoadingState();
        
        // Wait for data to load
        if (window.glutenvrijeProducten && window.glutenvrijeProducten.length > 0) {
            await this.onDataLoaded();
        } else {
            document.addEventListener('glutenvrijeDataLoaded', async () => {
                await this.onDataLoaded();
            });
        }
    }

    showLoadingState() {
        // Prevent flash of unstyled content
        const mainSections = [
            'categories-section',
            'deals-section', 
            'products-section'
        ];
        
        mainSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.opacity = '0';
                section.style.transition = 'opacity 0.3s ease';
                section.innerHTML = `
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Producten laden...</p>
                    </div>
                `;
            }
        });
    }

    async onDataLoaded() {
        console.log('📊 Data loaded, starting app...');
        
        // Load data
        this.products = window.glutenvrijeProducten || [];
        this.categories = window.glutenvrijeCategories || [];
        this.stats = window.glutenvrijeStats || {};
        
        console.log(`✅ App initialized with ${this.products.length} products`);
        
        // Setup UI with smooth transitions
        await this.setupUIWithTransitions();
        
        // Hide global loading indicator
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }
        
        console.log('🎉 Glutenvergelijker.nl ready!');
    }

    async setupUIWithTransitions() {
        // Setup event listeners first
        this.setupEventListeners();
        this.setupPartners();
        
        // Render sections with staggered animations
        await this.renderWithDelay('categories', () => this.renderCategories());
        await this.renderWithDelay('deals', () => this.renderDeals());
        await this.renderWithDelay('products', () => {
            this.resetAndRenderProducts();
            this.updateStatistics();
            this.updateProductCount();
        });
        
        // Show sections with smooth fade-in
        this.fadeInSections();
    }

    async renderWithDelay(section, renderFunction) {
        return new Promise(resolve => {
            setTimeout(() => {
                renderFunction();
                resolve();
            }, 100); // Small delay for smooth experience
        });
    }

    fadeInSections() {
        const sections = [
            'categories-section',
            'deals-section',
            'products-section'
        ];
        
        sections.forEach((sectionId, index) => {
            const section = document.getElementById(sectionId);
            if (section) {
                setTimeout(() => {
                    section.style.opacity = '1';
                }, index * 150); // Staggered fade-in
            }
        });
    }

    setupEventListeners() {
        // Search functionality with proper debouncing
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                // Clear previous timeout
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }
                
                // Debounce search
                this.searchTimeout = setTimeout(() => {
                    this.currentFilter.search = e.target.value.toLowerCase().trim();
                    this.applyFiltersAndRenderSmooth();
                }, 300);
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.applyFiltersAndRenderSmooth();
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
                this.clearAllFiltersSmooth();
            });
        }
        
        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProductsSmooth();
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
                this.applyFiltersAndRenderSmooth();
            });
        }
    }

    // Smooth filtering with loading state
    applyFiltersAndRenderSmooth() {
        // Prevent multiple rapid calls
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }
        
        this.renderTimeout = setTimeout(() => {
            this.applyFiltersAndRender();
        }, 100);
    }

    applyFiltersAndRender() {
        // Show subtle loading indicator
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.style.opacity = '0.6';
            productsGrid.style.transition = 'opacity 0.2s ease';
        }
        
        // Apply filters
        this.filteredProducts = this.products.filter(product => {
            const matchesCategory = !this.currentFilter.category || 
                product.category === this.currentFilter.category;
            const matchesBrand = !this.currentFilter.brand || 
                product.brand === this.currentFilter.brand;
            const matchesStore = !this.currentFilter.store || 
                (product.stores && product.stores[this.currentFilter.store]);
            const matchesSearch = !this.currentFilter.search || 
                product.name.toLowerCase().includes(this.currentFilter.search) ||
                product.description.toLowerCase().includes(this.currentFilter.search);
            
            return matchesCategory && matchesBrand && matchesStore && matchesSearch;
        });
        
        // Sort products
        this.sortProducts();
        
        // Reset display counter
        this.displayedProducts = 0;
        
        // Render with smooth transition
        setTimeout(() => {
            this.renderProducts();
            this.updateProductCount();
            
            // Restore opacity
            if (productsGrid) {
                productsGrid.style.opacity = '1';
            }
        }, 150);
    }

    // Improved rendering with DocumentFragment for better performance
    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        
        // Use DocumentFragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();
        
        const endIndex = Math.min(
            this.displayedProducts + this.productsPerPage,
            this.filteredProducts.length
        );
        
        for (let i = this.displayedProducts; i < endIndex; i++) {
            const product = this.filteredProducts[i];
            const productElement = this.createProductElement(product);
            fragment.appendChild(productElement);
        }
        
        // Single DOM update
        if (this.displayedProducts === 0) {
            productsGrid.innerHTML = '';
        }
        productsGrid.appendChild(fragment);
        
        this.displayedProducts = endIndex;
        this.updateLoadMoreButton();
    }

    createProductElement(product) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card';
        productDiv.style.opacity = '0';
        productDiv.style.transform = 'translateY(20px)';
        productDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        const bestPrice = this.getBestPrice(product);
        const discount = this.getBestDiscount(product);
        
        productDiv.innerHTML = `
            <div class="product-image">
                🌾
                ${discount > 0 ? `<div class="product-discount-badge">-${discount}%</div>` : ''}
            </div>
            <div class="product-info">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-brand">${product.brand}</p>
                <p class="product-description">${product.description}</p>
                
                <div class="product-badges">
                    ${product.nutritional_info?.organic ? '<span class="badge badge-organic">Bio</span>' : ''}
                    ${product.nutritional_info?.vegan ? '<span class="badge badge-vegan">Vegan</span>' : ''}
                    ${product.nutritional_info?.lactose_free ? '<span class="badge badge-lactose">Lactosevrij</span>' : ''}
                </div>
                
                <div class="price-comparison">
                    <div class="price-header">
                        <span class="best-price-badge">Beste prijs</span>
                        <div class="price-value">
                            ${bestPrice.originalPrice ? `<span class="original-price">€${bestPrice.originalPrice.toFixed(2)}</span>` : ''}
                            <span class="current-price">€${bestPrice.price.toFixed(2)}</span>
                            ${bestPrice.discount > 0 ? `<span class="discount-badge">-${bestPrice.discount}%</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="store-prices">
                        ${this.renderStorePrices(product)}
                    </div>
                </div>
                
                <div class="product-actions">
                    <a href="${bestPrice.url}" 
                       class="buy-button primary" 
                       target="_blank" 
                       rel="noopener">
                        <span class="button-store">Beste deal</span>
                        <span class="button-price">€${bestPrice.price.toFixed(2)}</span>
                    </a>
                </div>
            </div>
        `;
        
        // Animate in after DOM insertion
        setTimeout(() => {
            productDiv.style.opacity = '1';
            productDiv.style.transform = 'translateY(0)';
        }, 50);
        
        return productDiv;
    }

    renderStorePrices(product) {
        if (!product.stores) return '';
        
        const storePrices = Object.entries(product.stores)
            .filter(([_, storeData]) => storeData.in_stock)
            .sort((a, b) => a[1].price - b[1].price)
            .slice(0, 3); // Show top 3 cheapest
        
        return storePrices.map(([storeId, storeData], index) => {
            const storeName = this.getStoreName(storeId);
            const isLowestPrice = index === 0;
            
            return `
                <div class="store-price ${isLowestPrice ? 'best-price' : ''}">
                    <span class="store-name">
                        <img src="${this.getStoreLogo(storeId)}" alt="${storeName}" class="store-logo">
                        ${storeName}
                    </span>
                    <span class="store-price-value">€${storeData.price.toFixed(2)}</span>
                </div>
            `;
        }).join('');
    }

    // Smooth clear filters
    clearAllFiltersSmooth() {
        // Visual feedback
        const filterElements = [
            'category-filter',
            'brand-filter', 
            'store-filter',
            'sort-filter',
            'search-input'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.transform = 'scale(0.95)';
                element.style.transition = 'transform 0.1s ease';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    if (element.tagName === 'INPUT') {
                        element.value = '';
                    } else {
                        element.value = '';
                    }
                }, 100);
            }
        });
        
        // Clear filters
        this.currentFilter = {
            category: '',
            brand: '',
            store: '',
            search: '',
            sort: ''
        };
        
        setTimeout(() => {
            this.applyFiltersAndRender();
        }, 200);
    }

    // Smooth load more
    loadMoreProductsSmooth() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Laden...';
        }
        
        setTimeout(() => {
            this.renderProducts();
            
            if (loadMoreBtn) {
                loadMoreBtn.disabled = false;
                loadMoreBtn.textContent = 'Meer producten laden';
            }
        }, 300);
    }

    // Helper methods (unchanged but optimized)
    getBestPrice(product) {
        if (!product.stores) return { price: 0, url: '#', discount: 0 };
        
        let bestPrice = Infinity;
        let bestStore = null;
        let bestDiscount = 0;
        
        for (const [storeId, storeData] of Object.entries(product.stores)) {
            if (storeData.in_stock && storeData.price < bestPrice) {
                bestPrice = storeData.price;
                bestStore = { storeId, ...storeData };
                bestDiscount = storeData.discount_percentage || 0;
            }
        }
        
        return {
            price: bestPrice,
            originalPrice: bestStore?.original_price,
            url: bestStore?.url || '#',
            discount: bestDiscount,
            store: bestStore?.storeId
        };
    }

    getBestDiscount(product) {
        if (!product.stores) return 0;
        
        return Math.max(...Object.values(product.stores)
            .map(store => store.discount_percentage || 0));
    }

    getStoreName(storeId) {
        const storeNames = {
            'ah.nl': 'Albert Heijn',
            'jumbo.com': 'Jumbo',
            'plus.nl': 'Plus',
            'glutenvrijewebshop.nl': 'Glutenvrije Webshop',
            'glutenvrijemarkt.com': 'Glutenvrijemarkt',
            'happybakers.nl': 'Happy Bakers',
            'thefreefromshop.nl': 'The Free From Shop'
        };
        return storeNames[storeId] || storeId.replace('.nl', '').replace('.com', '');
    }

    getStoreLogo(storeId) {
        const logoMap = {
            'ah.nl': 'assets/logo/ah-albert-heijn.svg',
            'jumbo.com': 'assets/logo/jumbo-logo.svg',
            'plus.nl': 'assets/logo/plus.svg',
            'glutenvrijewebshop.nl': 'assets/logo/glutenvrijewebshop.png',
            'glutenvrijemarkt.com': 'assets/logo/glutenvrijemarkt.png'
        };
        return logoMap[storeId] || 'assets/logo/default.png';
    }

    // Remaining methods simplified for space...
    sortProducts() {
        const sortType = this.currentFilter.sort;
        
        switch (sortType) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => 
                    this.getBestPrice(a).price - this.getBestPrice(b).price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => 
                    this.getBestPrice(b).price - this.getBestPrice(a).price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'brand':
                this.filteredProducts.sort((a, b) => a.brand.localeCompare(b.brand));
                break;
            default:
                // Default: newest first
                break;
        }
    }

    updateProductCount() {
        const countElement = document.getElementById('products-count');
        if (countElement) {
            const total = this.filteredProducts.length;
            const displayed = Math.min(this.displayedProducts, total);
            countElement.textContent = `${displayed} van ${total} producten`;
        }
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        const loadMoreContainer = document.querySelector('.load-more-container');
        
        if (loadMoreBtn && loadMoreContainer) {
            if (this.displayedProducts >= this.filteredProducts.length) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
            }
        }
    }

    resetAndRenderProducts() {
        this.filteredProducts = [...this.products];
        this.displayedProducts = 0;
        this.sortProducts();
        this.renderProducts();
    }

    renderCategories() {
        const categoriesGrid = document.getElementById('categories-grid');
        if (!categoriesGrid) return;

        const sortedCategories = [...this.categories]
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        const fragment = document.createDocumentFragment();
        
        sortedCategories.forEach((category, index) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-card';
            categoryElement.style.animationDelay = `${index * 0.1}s`;
            categoryElement.innerHTML = `
                <div class="category-icon">${category.icon}</div>
                <h4 class="category-name">${category.name}</h4>
                <p class="category-count">${category.count} producten</p>
            `;
            
            categoryElement.addEventListener('click', () => {
                this.currentFilter.category = category.name;
                const categoryFilter = document.getElementById('category-filter');
                if (categoryFilter) categoryFilter.value = category.name;
                this.applyFiltersAndRenderSmooth();
            });
            
            fragment.appendChild(categoryElement);
        });
        
        categoriesGrid.appendChild(fragment);
    }

    renderDeals() {
        const dealsGrid = document.getElementById('deals-grid');
        if (!dealsGrid) return;

        const dealsProducts = this.products
            .filter(product => this.getBestDiscount(product) > 0)
            .sort((a, b) => this.getBestDiscount(b) - this.getBestDiscount(a))
            .slice(0, 6);

        if (dealsProducts.length === 0) {
            dealsGrid.innerHTML = '<p class="no-deals">Geen aanbiedingen beschikbaar op dit moment.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        
        dealsProducts.forEach((product, index) => {
            const bestPrice = this.getBestPrice(product);
            const discount = this.getBestDiscount(product);
            
            const dealElement = document.createElement('div');
            dealElement.className = 'deal-card';
            dealElement.style.animationDelay = `${index * 0.1}s`;
            dealElement.innerHTML = `
                <div class="deal-badge">-${discount}%</div>
                <h4 class="deal-title">${product.name}</h4>
                <div class="deal-price">
                    ${bestPrice.originalPrice ? `<span class="deal-old-price">€${bestPrice.originalPrice.toFixed(2)}</span>` : ''}
                    <span class="deal-new-price">€${bestPrice.price.toFixed(2)}</span>
                </div>
                <p class="deal-store">${this.getStoreName(bestPrice.store)}</p>
            `;
            
            dealElement.addEventListener('click', () => {
                window.open(bestPrice.url, '_blank');
            });
            
            fragment.appendChild(dealElement);
        });
        
        dealsGrid.appendChild(fragment);
    }

    setupPartners() {
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

    renderPartners() {
        const partnersGrid = document.getElementById('partners-grid');
        if (!partnersGrid) return;

        const fragment = document.createDocumentFragment();
        
        this.partners.forEach((partner, index) => {
            const partnerElement = document.createElement('div');
            partnerElement.className = 'partner-item';
            partnerElement.style.animationDelay = `${index * 0.1}s`;
            partnerElement.innerHTML = `
                <img src="${partner.logo}" alt="${partner.name}" class="partner-logo">
                <div class="partner-info">
                    <h4 class="partner-name">${partner.name}</h4>
                    <p class="partner-count">${partner.productCount} producten</p>
                </div>
            `;
            
            fragment.appendChild(partnerElement);
        });
        
        partnersGrid.appendChild(fragment);
    }

    updateStatistics() {
        const stats = [
            { id: 'total-products', value: this.products.length },
            { id: 'total-stores', value: this.partners.length },
            { id: 'total-categories', value: this.categories.length },
            { id: 'total-deals', value: this.products.filter(p => this.getBestDiscount(p) > 0).length }
        ];

        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                element.textContent = stat.value;
            }
        });
    }

    handleNewsletterSignup() {
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput?.value;
        
        if (!email || !email.includes('@')) {
            alert('Voer een geldig e-mailadres in');
            return;
        }
        
        // Visual feedback
        const button = document.getElementById('newsletter-btn');
        if (button) {
            button.textContent = 'Aangemeld!';
            button.style.background = 'var(--success-color)';
            setTimeout(() => {
                button.textContent = 'Aanmelden';
                button.style.background = '';
                if (emailInput) emailInput.value = '';
            }, 2000);
        }
        
        console.log('Newsletter signup:', email);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.glutenvergelijkerApp = new GlutenvergelijkerApp();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    window.glutenvergelijkerApp = new GlutenvergelijkerApp();
}
