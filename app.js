// GlutenVergelijker.nl - Main Application JavaScript (Fixed)

class GlutenVergelijkerApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.favorites = this.loadFavorites();
        this.currentFilters = {
            search: '',
            brands: [],
            categories: [],
            stores: [],
            minPrice: 0,
            maxPrice: 20
        };
        this.currentSort = 'relevance';
        this.showOnlyFavorites = false;
        this.currentModalProduct = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadProducts();
            this.setupEventListeners();
            this.populateFilters();
            this.displayProducts();
            this.updateStatistics();
        } catch (error) {
            console.error('Fout bij initialisatie:', error);
            this.showError('Er ging iets mis bij het laden van de producten.');
        }
    }

    async loadProducts() {
        try {
            // Try to load from the provided JSON asset first
            let loadedFromAsset = false;
            try {
                const response = await fetch('https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/dadd2e4bf5d922f537029a3325ab6d02/b830569c-266c-40c7-b853-e3569bee267e/0b83f3f6.json');
                if (response.ok) {
                    this.products = await response.json();
                    loadedFromAsset = true;
                    console.log(`${this.products.length} producten geladen van externe bron`);
                }
            } catch (assetError) {
                console.log('Externe bron niet beschikbaar, gebruik sample data');
            }
            
            if (!loadedFromAsset) {
                // Fallback to expanded sample data
                this.products = this.getSampleData();
                console.log(`${this.products.length} sample producten geladen`);
            }
            
            // Ensure all products have required fields and fix image URLs
            this.products = this.products.map((product, index) => ({
                ...product,
                id: product.barcode || product.id || `product_${index}`,
                lowest_price: this.getLowestPrice(product),
                available_stores: this.getAvailableStores(product),
                image_url: this.getValidImageUrl(product.image_url, product.category)
            }));

            this.filteredProducts = [...this.products];
            
        } catch (error) {
            console.error('Fout bij laden van producten:', error);
            // Use sample data as ultimate fallback
            this.products = this.getSampleData();
            this.filteredProducts = [...this.products];
        }
    }

    getValidImageUrl(originalUrl, category) {
        // If it's a valid HTTP URL, return it
        if (originalUrl && originalUrl.startsWith('http')) {
            return originalUrl;
        }
        
        // Return placeholder emoji based on category
        return this.getPlaceholderImage(category);
    }

    getSampleData() {
        // Expanded sample data with more products for better testing
        const baseProducts = [
            {
                "name": "Schär Ciabatta",
                "brand": "Schär",
                "category": "Brood",
                "description": "Met zuurdesem en extra vergine olijfolie",
                "weight": "200g",
                "price_ah": 3.49,
                "price_jumbo": 3.59,
                "price_bol": 3.89,
                "features": ["Lactosevrij", "Conserveermiddelvrij", "Rijk aan vezels"],
                "image_url": "https://pplx-res.cloudinary.com/image/upload/v1755707113/pplx_project_search_images/9ff56534c1d2ac8a074e1e4228781079283fcd74.png",
                "barcode": "8008698011256",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi123456",
                    "jumbo": "https://jumbo.com/producten/schar-ciabatta",
                    "bol": "https://bol.com/nl/p/schar-ciabatta"
                },
                "allergens": "Kan sporen bevatten van soja"
            },
            {
                "name": "Schär Penne Pasta",
                "brand": "Schär",
                "category": "Pasta",
                "description": "Glutenvrije penne pasta, 11 minuten kooktijd",
                "weight": "400g",
                "price_ah": 2.99,
                "price_jumbo": 2.89,
                "price_bol": 3.19,
                "features": ["Made in Italy", "11 minuten kooktijd"],
                "image_url": "https://pplx-res.cloudinary.com/image/upload/v1755707115/pplx_project_search_images/8bb9b633d389ec1e0a1c5293d1b648778e6ea685.png",
                "barcode": "8008698011263",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi123457",
                    "jumbo": "https://jumbo.com/producten/schar-penne",
                    "bol": "https://bol.com/nl/p/schar-penne"
                },
                "allergens": "Kan sporen bevatten van soja"
            },
            {
                "name": "AH VrijVan Wit Brood Half",
                "brand": "Albert Heijn VrijVan",
                "category": "Brood",
                "description": "Glutenvrij wit brood, half brood",
                "weight": "400g",
                "price_ah": 2.49,
                "price_jumbo": null,
                "price_bol": null,
                "features": ["Huismerk Albert Heijn", "Dagvers"],
                "image_url": "https://pplx-res.cloudinary.com/image/upload/v1755707114/pplx_project_search_images/9da9a4bab08650a1c308dee5a80b83bf1f9ee9e1.png",
                "barcode": "8710398567890",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi435452",
                    "jumbo": null,
                    "bol": null
                },
                "allergens": "Kan sporen bevatten van soja en lupine"
            },
            {
                "name": "Jumbo Lekker Vrij Cakemix",
                "brand": "Jumbo Lekker Vrij",
                "category": "Bakmixen",
                "description": "Glutenvrije cakemix, voeg 4 eieren en 225g margarine toe",
                "weight": "400g",
                "price_ah": null,
                "price_jumbo": 1.97,
                "price_bol": null,
                "features": ["Huismerk Jumbo", "Makkelijk bakken"],
                "image_url": "🧁",
                "barcode": "8714100789123",
                "shop_links": {
                    "albert_heijn": null,
                    "jumbo": "https://jumbo.com/producten/jumbo-lekker-vrij-cakemix",
                    "bol": null
                },
                "allergens": "Kan sporen bevatten van soja en lupine"
            },
            {
                "name": "Dr. Oetker Ristorante Pizza Mozzarella",
                "brand": "Dr. Oetker",
                "category": "Diepvries",
                "description": "Glutenvrije pizza met mozzarella en tomaten",
                "weight": "370g",
                "price_ah": 4.29,
                "price_jumbo": 4.15,
                "price_bol": 4.89,
                "features": ["Lactosevrij", "Diepvriesproduct"],
                "image_url": "https://pplx-res.cloudinary.com/image/upload/v1755707113/pplx_project_search_images/6e25c6c87afe85bba6baaf3e9e491a5bb0ba27a7.png",
                "barcode": "4001724015451",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi987654",
                    "jumbo": "https://jumbo.com/producten/dr-oetker-pizza-mozzarella",
                    "bol": "https://bol.com/nl/p/dr-oetker-pizza"
                },
                "allergens": "Kan sporen bevatten van ei en soja"
            },
            {
                "name": "Consenza Mais Crackers",
                "brand": "Consenza",
                "category": "Crackers",
                "description": "Luchtige mais crackers, glutenvrij",
                "weight": "125g",
                "price_ah": 2.19,
                "price_jumbo": 2.09,
                "price_bol": 2.49,
                "features": ["Lactosevrij", "Tarwevrij"],
                "image_url": "https://pplx-res.cloudinary.com/image/upload/v1755707116/pplx_project_search_images/26ec5bb58e578cb26dceb124f29a5620c3b773be.png",
                "barcode": "8711221035542",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi654321",
                    "jumbo": "https://jumbo.com/producten/consenza-mais-crackers",
                    "bol": "https://bol.com/nl/p/consenza-crackers"
                },
                "allergens": "Kan sporen bevatten van soja"
            },
            {
                "name": "Schär Mini Baguette Duo",
                "brand": "Schär",
                "category": "Brood",
                "description": "Twee mini baguettes per verpakking",
                "weight": "150g",
                "price_ah": 2.79,
                "price_jumbo": 2.69,
                "price_bol": 3.09,
                "features": ["Lactosevrij", "Conserveermiddelvrij", "Rijk aan vezels"],
                "image_url": "https://pplx-res.cloudinary.com/image/upload/v1755707116/pplx_project_search_images/0466c146d39772c16f287cfd911c5cc571845f82.png",
                "barcode": "8008698012345",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi234567",
                    "jumbo": "https://jumbo.com/producten/schar-mini-baguette",
                    "bol": "https://bol.com/nl/p/schar-mini-baguette"
                },
                "allergens": "Kan sporen bevatten van soja"
            },
            {
                "name": "Consenza Knäckebröd Meergranen",
                "brand": "Consenza",
                "category": "Crackers",
                "description": "Glutenvrij knäckebröd met meerdere granen",
                "weight": "160g",
                "price_ah": 2.89,
                "price_jumbo": 2.79,
                "price_bol": 3.19,
                "features": ["Lactosevrij", "Tarwevrij", "Meergranen"],
                "image_url": "https://pplx-res.cloudinary.com/image/upload/v1755707114/pplx_project_search_images/22125eac78fc361ad5971b8547720b9732c33d7b.png",
                "barcode": "8711221035559",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi345678",
                    "jumbo": "https://jumbo.com/producten/consenza-knackebrod",
                    "bol": "https://bol.com/nl/p/consenza-knackebrod"
                },
                "allergens": "Kan sporen bevatten van soja"
            },
            {
                "name": "Peaks Muffinmix Chocolade",
                "brand": "Peaks",
                "category": "Bakmixen",
                "description": "Glutenvrije chocolade muffinmix",
                "weight": "300g",
                "price_ah": 3.19,
                "price_jumbo": 2.99,
                "price_bol": 3.49,
                "features": ["Glutenvrij", "Chocoladesmaak"],
                "image_url": "🧁",
                "barcode": "8712345678901",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi456789",
                    "jumbo": "https://jumbo.com/producten/peaks-muffinmix-chocolade",
                    "bol": "https://bol.com/nl/p/peaks-muffinmix"
                },
                "allergens": "Kan sporen bevatten van noten en melk"
            },
            {
                "name": "Semper Meergranen Brood",
                "brand": "Semper",
                "category": "Brood",
                "description": "Glutenvrij meergranen brood, rijk aan vezels",
                "weight": "335g",
                "price_ah": 3.89,
                "price_jumbo": 3.69,
                "price_bol": 4.19,
                "features": ["Meergranen", "Rijk aan vezels", "Lactosevrij"],
                "image_url": "🍞",
                "barcode": "7311041234567",
                "shop_links": {
                    "albert_heijn": "https://ah.nl/producten/product/wi567890",
                    "jumbo": "https://jumbo.com/producten/semper-meergranen-brood",
                    "bol": "https://bol.com/nl/p/semper-brood"
                },
                "allergens": "Kan sporen bevatten van soja"
            }
        ];

        return baseProducts.map((product, index) => ({
            ...product,
            id: product.barcode || `product_${index}`,
            lowest_price: this.getLowestPrice(product),
            available_stores: this.getAvailableStores(product)
        }));
    }

    getLowestPrice(product) {
        const prices = [product.price_ah, product.price_jumbo, product.price_bol].filter(p => p !== null && p !== undefined);
        return prices.length > 0 ? Math.min(...prices) : null;
    }

    getAvailableStores(product) {
        const stores = [];
        if (product.price_ah) stores.push('albert_heijn');
        if (product.price_jumbo) stores.push('jumbo');
        if (product.price_bol) stores.push('bol');
        return stores;
    }

    getPlaceholderImage(category) {
        const placeholders = {
            'Brood': '🍞',
            'Pasta': '🍝',
            'Crackers': '🍘',
            'Diepvries': '🍕',
            'Bakmixen': '🧁',
            'default': '🌾'
        };
        return placeholders[category] || placeholders.default;
    }

    setupEventListeners() {
        // Search functionality - Fixed
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.handleSearch();
            }, 300));
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFiltersAndSort();
            });
        }

        // Price range filters
        const minPriceRange = document.getElementById('minPriceRange');
        const maxPriceRange = document.getElementById('maxPriceRange');
        
        if (minPriceRange) {
            minPriceRange.addEventListener('input', this.handlePriceRangeChange.bind(this));
        }
        if (maxPriceRange) {
            maxPriceRange.addEventListener('input', this.handlePriceRangeChange.bind(this));
        }

        // Reset filters
        const resetFilters = document.getElementById('resetFilters');
        if (resetFilters) {
            resetFilters.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Favorites toggle
        const favoritesToggle = document.getElementById('favoritesToggle');
        if (favoritesToggle) {
            favoritesToggle.addEventListener('click', () => {
                this.toggleFavoritesView();
            });
        }

        // Modal functionality - Fixed
        this.setupModalListeners();

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    setupModalListeners() {
        const closeModal = document.getElementById('closeModal');
        const closeModalFooter = document.getElementById('closeModalFooter');
        const modalBackdrop = document.querySelector('.modal__backdrop');
        const addToFavorites = document.getElementById('addToFavorites');

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }
        
        if (closeModalFooter) {
            closeModalFooter.addEventListener('click', () => this.closeModal());
        }

        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', () => this.closeModal());
        }

        if (addToFavorites) {
            addToFavorites.addEventListener('click', () => this.toggleCurrentProductFavorite());
        }
    }

    populateFilters() {
        this.populateBrandFilters();
        this.populateCategoryFilters();
        this.updatePriceRangeLabels();
    }

    populateBrandFilters() {
        const brands = [...new Set(this.products.map(p => p.brand))].sort();
        const brandFilters = document.getElementById('brandFilters');
        
        if (brandFilters) {
            brandFilters.innerHTML = brands.map(brand => `
                <label class="checkbox-label">
                    <input type="checkbox" value="${brand}" class="brand-filter">
                    <span>${brand}</span>
                </label>
            `).join('');

            brandFilters.addEventListener('change', () => {
                this.handleFilterChange();
            });
        }
    }

    populateCategoryFilters() {
        const categories = [...new Set(this.products.map(p => p.category))].sort();
        const categoryFilters = document.getElementById('categoryFilters');
        
        if (categoryFilters) {
            categoryFilters.innerHTML = categories.map(category => `
                <label class="checkbox-label">
                    <input type="checkbox" value="${category}" class="category-filter">
                    <span>${category}</span>
                </label>
            `).join('');

            categoryFilters.addEventListener('change', () => {
                this.handleFilterChange();
            });
        }
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        this.currentFilters.search = searchTerm;
        console.log('Zoeken naar:', searchTerm); // Debug log
        this.applyFiltersAndSort();
    }

    handleFilterChange() {
        // Get selected brands
        const selectedBrands = Array.from(document.querySelectorAll('.brand-filter:checked'))
            .map(cb => cb.value);
        
        // Get selected categories
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
            .map(cb => cb.value);
        
        // Get selected stores
        const selectedStores = Array.from(document.querySelectorAll('.store-filter:checked'))
            .map(cb => cb.value);

        this.currentFilters.brands = selectedBrands;
        this.currentFilters.categories = selectedCategories;
        this.currentFilters.stores = selectedStores;

        console.log('Filters aangepast:', this.currentFilters); // Debug log
        this.applyFiltersAndSort();
    }

    handlePriceRangeChange() {
        const minPriceRange = document.getElementById('minPriceRange');
        const maxPriceRange = document.getElementById('maxPriceRange');
        
        if (!minPriceRange || !maxPriceRange) return;
        
        const minPrice = parseFloat(minPriceRange.value);
        const maxPrice = parseFloat(maxPriceRange.value);
        
        // Ensure min is not greater than max
        if (minPrice > maxPrice) {
            minPriceRange.value = maxPrice;
            this.currentFilters.minPrice = maxPrice;
        } else {
            this.currentFilters.minPrice = minPrice;
        }
        
        this.currentFilters.maxPrice = maxPrice;
        
        this.updatePriceRangeLabels();
        this.applyFiltersAndSort();
    }

    updatePriceRangeLabels() {
        const minPriceLabel = document.getElementById('minPriceLabel');
        const maxPriceLabel = document.getElementById('maxPriceLabel');
        
        if (minPriceLabel) {
            minPriceLabel.textContent = this.currentFilters.minPrice.toFixed(2);
        }
        if (maxPriceLabel) {
            maxPriceLabel.textContent = this.currentFilters.maxPrice.toFixed(2);
        }
    }

    applyFiltersAndSort() {
        this.showLoading(true);
        
        setTimeout(() => {
            let filtered = [...this.products];
            
            // Apply search filter - Fixed case sensitivity issue
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                filtered = filtered.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.brand.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.features && product.features.some(feature => 
                        feature.toLowerCase().includes(searchTerm)
                    ))
                );
                console.log(`Zoekresultaten voor "${this.currentFilters.search}":`, filtered.length); // Debug log
            }

            // Apply brand filter
            if (this.currentFilters.brands.length > 0) {
                filtered = filtered.filter(product => 
                    this.currentFilters.brands.includes(product.brand)
                );
            }

            // Apply category filter
            if (this.currentFilters.categories.length > 0) {
                filtered = filtered.filter(product => 
                    this.currentFilters.categories.includes(product.category)
                );
            }

            // Apply store filter
            if (this.currentFilters.stores.length > 0) {
                filtered = filtered.filter(product => 
                    this.currentFilters.stores.some(store => 
                        product.available_stores.includes(store)
                    )
                );
            }

            // Apply price filter
            filtered = filtered.filter(product => {
                const price = product.lowest_price;
                return price !== null && 
                       price >= this.currentFilters.minPrice && 
                       price <= this.currentFilters.maxPrice;
            });

            // Apply favorites filter if active
            if (this.showOnlyFavorites) {
                filtered = filtered.filter(product => 
                    this.favorites.includes(product.id)
                );
            }

            // Apply sorting
            this.sortProducts(filtered);
            
            this.filteredProducts = filtered;
            this.displayProducts();
            this.showLoading(false);
        }, 150);
    }

    sortProducts(products) {
        switch (this.currentSort) {
            case 'price-low':
                products.sort((a, b) => (a.lowest_price || 999) - (b.lowest_price || 999));
                break;
            case 'price-high':
                products.sort((a, b) => (b.lowest_price || 0) - (a.lowest_price || 0));
                break;
            case 'alphabetical':
                products.sort((a, b) => a.name.localeCompare(b.name, 'nl'));
                break;
            case 'brand':
                products.sort((a, b) => a.brand.localeCompare(b.brand, 'nl'));
                break;
            case 'relevance':
            default:
                // Keep original order for relevance
                break;
        }
    }

    displayProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const resultsCount = document.getElementById('resultsCount');
        const noResults = document.getElementById('noResults');

        if (!productsGrid) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            if (resultsCount) resultsCount.textContent = '0 producten gevonden';
            return;
        }

        if (noResults) noResults.classList.add('hidden');
        if (resultsCount) resultsCount.textContent = `${this.filteredProducts.length} producten gevonden`;

        productsGrid.innerHTML = this.filteredProducts.map(product => 
            this.createProductCard(product)
        ).join('');

        // Add event listeners to product cards - Fixed timing issue
        setTimeout(() => {
            this.addProductCardListeners();
        }, 50);
    }

    createProductCard(product) {
        const isFavorite = this.favorites.includes(product.id);
        const prices = this.getProductPrices(product);

        // Handle images properly
        const isEmojiImage = !product.image_url.startsWith('http');
        
        const imageElement = !isEmojiImage 
            ? `<img src="${product.image_url}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.parentNode.querySelector('.placeholder-image').style.display='flex';">`
            : '';
        
        const placeholderElement = `<div class="placeholder-image" style="${!isEmojiImage ? 'display: none;' : 'display: flex;'}">${isEmojiImage ? product.image_url : this.getPlaceholderImage(product.category)}</div>`;

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-card__image">
                    ${imageElement}
                    ${placeholderElement}
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-product-id="${product.id}" onclick="event.stopPropagation();">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
                <div class="product-card__content">
                    <div class="product-card__header">
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-brand">${product.brand}</div>
                        <div class="product-weight">${product.weight}</div>
                    </div>
                    
                    ${product.features && product.features.length > 0 ? `
                        <div class="product-features">
                            <div class="features-tags">
                                ${product.features.slice(0, 2).map(feature => 
                                    `<span class="feature-tag">${feature}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="product-prices">
                        <div class="price-list">
                            ${prices.map(price => `
                                <div class="price-item">
                                    <span class="store-name">${price.storeName}</span>
                                    <span class="price ${price.isBest ? 'best-price' : ''} ${price.price === null ? 'unavailable' : ''}">
                                        ${price.price !== null ? `€${price.price.toFixed(2)}` : 'Niet beschikbaar'}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getProductPrices(product) {
        const stores = [
            { key: 'price_ah', storeName: 'Albert Heijn', price: product.price_ah },
            { key: 'price_jumbo', storeName: 'Jumbo', price: product.price_jumbo },
            { key: 'price_bol', storeName: 'Bol.com', price: product.price_bol }
        ];

        const bestPrice = product.lowest_price;

        return stores.map(store => ({
            ...store,
            isBest: store.price === bestPrice && store.price !== null
        }));
    }

    addProductCardListeners() {
        // Product card click listeners - Fixed
        document.querySelectorAll('.product-card').forEach(card => {
            // Remove any existing listeners
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', (e) => {
                // Don't trigger if clicking on favorite button
                if (!e.target.classList.contains('favorite-btn') && 
                    !e.target.closest('.favorite-btn')) {
                    const productId = newCard.dataset.productId;
                    console.log('Product kaart geklikt:', productId); // Debug log
                    this.showProductModal(productId);
                }
            });
        });

        // Favorite button listeners - Fixed
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = btn.dataset.productId;
                console.log('Favoriet knop geklikt:', productId); // Debug log
                this.toggleFavorite(productId);
            });
        });
    }

    showProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Product niet gevonden:', productId);
            return;
        }

        console.log('Toon product modal:', product.name); // Debug log

        // Populate modal content
        const modalProductName = document.getElementById('modalProductName');
        const modalProductBrand = document.getElementById('modalProductBrand');
        const modalProductDescription = document.getElementById('modalProductDescription');
        const modalProductImage = document.getElementById('modalProductImage');
        const modalProductFeatures = document.getElementById('modalProductFeatures');
        const modalProductAllergens = document.getElementById('modalProductAllergens');
        const modalPriceComparison = document.getElementById('modalPriceComparison');

        if (modalProductName) modalProductName.textContent = product.name;
        if (modalProductBrand) modalProductBrand.textContent = product.brand;
        if (modalProductDescription) modalProductDescription.textContent = product.description || 'Geen beschrijving beschikbaar';
        
        // Product image
        if (modalProductImage) {
            if (product.image_url.startsWith('http')) {
                modalProductImage.src = product.image_url;
                modalProductImage.alt = product.name;
                modalProductImage.style.display = 'block';
            } else {
                modalProductImage.style.display = 'none';
            }
        }

        // Features
        if (modalProductFeatures) {
            if (product.features && product.features.length > 0) {
                modalProductFeatures.innerHTML = product.features.map(feature => 
                    `<span class="feature-tag">${feature}</span>`
                ).join('');
            } else {
                modalProductFeatures.innerHTML = '<span>Geen specifieke kenmerken</span>';
            }
        }

        // Allergens
        if (modalProductAllergens) {
            modalProductAllergens.textContent = product.allergens || 'Geen allergeneninformatie beschikbaar';
        }

        // Price comparison
        if (modalPriceComparison) {
            const prices = this.getProductPricesDetailed(product);
            modalPriceComparison.innerHTML = prices.map(price => `
                <div class="price-comparison-item ${price.isBest ? 'best-price' : ''}">
                    <div class="store-info">
                        <span class="store-icon">${price.icon}</span>
                        <span class="store-name">${price.storeName}</span>
                    </div>
                    <div class="price-info">
                        ${price.price !== null ? `
                            <span class="price">€${price.price.toFixed(2)}</span>
                            ${price.link ? `<a href="${price.link}" target="_blank" class="store-link">Bekijk product</a>` : ''}
                        ` : '<span class="price unavailable">Niet beschikbaar</span>'}
                    </div>
                </div>
            `).join('');
        }

        // Set current product for favorites
        this.currentModalProduct = productId;
        
        // Update favorite button
        const favoriteBtn = document.getElementById('addToFavorites');
        if (favoriteBtn) {
            const isFavorite = this.favorites.includes(productId);
            favoriteBtn.textContent = isFavorite ? 'Verwijderen van favorieten' : 'Toevoegen aan favorieten';
            favoriteBtn.classList.toggle('btn--secondary', isFavorite);
            favoriteBtn.classList.toggle('btn--primary', !isFavorite);
        }

        // Show modal
        const productModal = document.getElementById('productModal');
        if (productModal) {
            productModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    getProductPricesDetailed(product) {
        const stores = [
            { 
                key: 'price_ah', 
                storeName: 'Albert Heijn', 
                icon: '🏪', 
                price: product.price_ah,
                link: product.shop_links?.albert_heijn
            },
            { 
                key: 'price_jumbo', 
                storeName: 'Jumbo', 
                icon: '🛒', 
                price: product.price_jumbo,
                link: product.shop_links?.jumbo
            },
            { 
                key: 'price_bol', 
                storeName: 'Bol.com', 
                icon: '📦', 
                price: product.price_bol,
                link: product.shop_links?.bol
            }
        ];

        const bestPrice = product.lowest_price;

        return stores.map(store => ({
            ...store,
            isBest: store.price === bestPrice && store.price !== null
        }));
    }

    closeModal() {
        const productModal = document.getElementById('productModal');
        if (productModal) {
            productModal.classList.add('hidden');
            document.body.style.overflow = '';
            this.currentModalProduct = null;
        }
    }

    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index === -1) {
            this.favorites.push(productId);
            console.log('Product toegevoegd aan favorieten:', productId);
        } else {
            this.favorites.splice(index, 1);
            console.log('Product verwijderd van favorieten:', productId);
        }
        
        this.saveFavorites();
        this.updateFavoriteButtons(productId);
        
        // If showing only favorites, refresh the view
        if (this.showOnlyFavorites) {
            this.applyFiltersAndSort();
        }
    }

    toggleCurrentProductFavorite() {
        if (this.currentModalProduct) {
            this.toggleFavorite(this.currentModalProduct);
            
            // Update modal favorite button
            const favoriteBtn = document.getElementById('addToFavorites');
            if (favoriteBtn) {
                const isFavorite = this.favorites.includes(this.currentModalProduct);
                favoriteBtn.textContent = isFavorite ? 'Verwijderen van favorieten' : 'Toevoegen aan favorieten';
                favoriteBtn.classList.toggle('btn--secondary', isFavorite);
                favoriteBtn.classList.toggle('btn--primary', !isFavorite);
            }
        }
    }

    updateFavoriteButtons(productId) {
        const isFavorite = this.favorites.includes(productId);
        const favoriteBtn = document.querySelector(`[data-product-id="${productId}"].favorite-btn`);
        
        if (favoriteBtn) {
            favoriteBtn.classList.toggle('active', isFavorite);
            favoriteBtn.textContent = isFavorite ? '❤️' : '🤍';
        }
    }

    toggleFavoritesView() {
        this.showOnlyFavorites = !this.showOnlyFavorites;
        const toggleBtn = document.getElementById('favoritesToggle');
        
        if (toggleBtn) {
            if (this.showOnlyFavorites) {
                toggleBtn.textContent = 'Toon alle producten';
                toggleBtn.classList.add('btn--primary');
                toggleBtn.classList.remove('btn--outline');
            } else {
                toggleBtn.textContent = 'Toon alleen favorieten';
                toggleBtn.classList.add('btn--outline');
                toggleBtn.classList.remove('btn--primary');
            }
        }
        
        this.applyFiltersAndSort();
    }

    resetFilters() {
        // Reset all filter inputs
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const minPriceRange = document.getElementById('minPriceRange');
        const maxPriceRange = document.getElementById('maxPriceRange');
        
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'relevance';
        if (minPriceRange) minPriceRange.value = 0;
        if (maxPriceRange) maxPriceRange.value = 20;
        
        // Uncheck all checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Reset filter object
        this.currentFilters = {
            search: '',
            brands: [],
            categories: [],
            stores: [],
            minPrice: 0,
            maxPrice: 20
        };
        
        this.currentSort = 'relevance';
        this.updatePriceRangeLabels();
        this.applyFiltersAndSort();
        
        console.log('Filters gereset');
    }

    updateStatistics() {
        // Update total products count
        const totalProducts = document.getElementById('totalProducts');
        if (totalProducts) {
            totalProducts.textContent = `${this.products.length}+`;
        }
        
        // Update total brands count
        const uniqueBrands = new Set(this.products.map(p => p.brand));
        const totalBrands = document.getElementById('totalBrands');
        if (totalBrands) {
            totalBrands.textContent = `${uniqueBrands.size}+`;
        }

        // Update detailed statistics
        this.updateBrandStatistics();
        this.updateCategoryStatistics();
        this.updatePriceStatistics();
    }

    updateBrandStatistics() {
        const brandCounts = {};
        this.products.forEach(product => {
            brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
        });

        const sortedBrands = Object.entries(brandCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const brandStats = document.getElementById('brandStats');
        if (brandStats) {
            brandStats.innerHTML = sortedBrands.map(([brand, count]) => `
                <div class="brand-item">
                    <span class="brand-name">${brand}</span>
                    <span class="brand-count">${count}</span>
                </div>
            `).join('');
        }
    }

    updateCategoryStatistics() {
        const categoryCounts = {};
        this.products.forEach(product => {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        });

        const sortedCategories = Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a);

        const categoryStats = document.getElementById('categoryStats');
        if (categoryStats) {
            categoryStats.innerHTML = sortedCategories.map(([category, count]) => `
                <div class="category-item">
                    <span class="category-name">${category}</span>
                    <span class="category-count">${count}</span>
                </div>
            `).join('');
        }
    }

    updatePriceStatistics() {
        // Calculate average prices per store
        const storeStats = {
            albert_heijn: [],
            jumbo: [],
            bol: []
        };

        this.products.forEach(product => {
            if (product.price_ah) storeStats.albert_heijn.push(product.price_ah);
            if (product.price_jumbo) storeStats.jumbo.push(product.price_jumbo);
            if (product.price_bol) storeStats.bol.push(product.price_bol);
        });

        const avgPriceAH = storeStats.albert_heijn.length > 0 
            ? (storeStats.albert_heijn.reduce((a, b) => a + b, 0) / storeStats.albert_heijn.length).toFixed(2)
            : '0.00';
            
        const avgPriceJumbo = storeStats.jumbo.length > 0 
            ? (storeStats.jumbo.reduce((a, b) => a + b, 0) / storeStats.jumbo.length).toFixed(2)
            : '0.00';
            
        const avgPriceBol = storeStats.bol.length > 0 
            ? (storeStats.bol.reduce((a, b) => a + b, 0) / storeStats.bol.length).toFixed(2)
            : '0.00';

        const avgPriceAHEl = document.getElementById('avgPriceAH');
        const avgPriceJumboEl = document.getElementById('avgPriceJumbo');
        const avgPriceBolEl = document.getElementById('avgPriceBol');

        if (avgPriceAHEl) avgPriceAHEl.textContent = `€${avgPriceAH}`;
        if (avgPriceJumboEl) avgPriceJumboEl.textContent = `€${avgPriceJumbo}`;
        if (avgPriceBolEl) avgPriceBolEl.textContent = `€${avgPriceBol}`;
    }

    loadFavorites() {
        // Use a simple array instead of localStorage since it's not available in sandbox
        return [];
    }

    saveFavorites() {
        // In a real implementation, this would save to localStorage
        // For sandbox environment, we just keep it in memory
        console.log('Favorieten opgeslagen (in geheugen):', this.favorites.length);
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const productsGrid = document.getElementById('productsGrid');
        
        if (loadingState) {
            loadingState.classList.toggle('hidden', !show);
        }
        if (productsGrid) {
            productsGrid.classList.toggle('loading', show);
        }
    }

    showError(message) {
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-error);">
                    <h3>Fout</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn--primary" style="margin-top: 1rem;">
                        Probeer opnieuw
                    </button>
                </div>
            `;
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('GlutenVergelijker.nl wordt geladen...');
    window.glutenVergelijkerApp = new GlutenVergelijkerApp();
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});