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
            // Laad lokale productdata vanaf JSON bestand in dezelfde folder
            const response = await fetch('glutenvrije_producten_500.json');
            if (!response.ok) {
                throw new Error('Productdata JSON niet gevonden of niet bereikbaar');
            }
            this.products = await response.json();

            // Voeg id, laagste prijs, beschikbare winkels, en valide afbeelding toe
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
            // Fallback naar sample data als laden mislukt
            this.products = this.getSampleData();
            this.filteredProducts = [...this.products];
        }
    }

    getValidImageUrl(originalUrl, category) {
        if (originalUrl && originalUrl.startsWith('http')) {
            return originalUrl;
        }
        return this.getPlaceholderImage(category);
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
            'Crackers': '🥨',
            'Diepvries': '🍕',
            'Bakmixen': '🧁',
            'default': '🥖'
        };
        return placeholders[category] || placeholders.default;
    }

    getSampleData() {
        // Toont een kleine set sample producten als fallback
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
            }
        ];

        return baseProducts.map((product, index) => ({
            ...product,
            id: product.barcode || `product_${index}`,
            lowest_price: this.getLowestPrice(product),
            available_stores: this.getAvailableStores(product)
        }));
    }

    setupEventListeners() {
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

        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFiltersAndSort();
            });
        }

        const minPriceRange = document.getElementById('minPriceRange');
        const maxPriceRange = document.getElementById('maxPriceRange');
        
        if (minPriceRange) {
            minPriceRange.addEventListener('input', this.handlePriceRangeChange.bind(this));
        }
        if (maxPriceRange) {
            maxPriceRange.addEventListener('input', this.handlePriceRangeChange.bind(this));
        }

        const resetFilters = document.getElementById('resetFilters');
        if (resetFilters) {
            resetFilters.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        const favoritesToggle = document.getElementById('favoritesToggle');
        if (favoritesToggle) {
            favoritesToggle.addEventListener('click', () => {
                this.toggleFavoritesView();
            });
        }

        this.setupModalListeners();

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(func.bind(this), wait);
        };
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
        this.applyFiltersAndSort();
    }

    handleFilterChange() {
        const selectedBrands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(cb => cb.value);
        const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
        const selectedStores = Array.from(document.querySelectorAll('.store-filter:checked')).map(cb => cb.value);

        this.currentFilters.brands = selectedBrands;
        this.currentFilters.categories = selectedCategories;
        this.currentFilters.stores = selectedStores;

        this.applyFiltersAndSort();
    }

    handlePriceRangeChange() {
        const minPriceRange = document.getElementById('minPriceRange');
        const maxPriceRange = document.getElementById('maxPriceRange');
        
        if (!minPriceRange || !maxPriceRange) return;
        
        let minPrice = parseFloat(minPriceRange.value);
        let maxPrice = parseFloat(maxPriceRange.value);
        
        if (minPrice > maxPrice) {
            minPrice = maxPrice;
            minPriceRange.value = minPrice;
        }
        
        this.currentFilters.minPrice = minPrice;
        this.currentFilters.maxPrice = maxPrice;
        this.applyFiltersAndSort();
    }

    resetFilters() {
        const brandCheckboxes = document.querySelectorAll('.brand-filter');
        const categoryCheckboxes = document.querySelectorAll('.category-filter');
        const storeCheckboxes = document.querySelectorAll('.store-filter');
        const minPriceRange = document.getElementById('minPriceRange');
        const maxPriceRange = document.getElementById('maxPriceRange');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');

        brandCheckboxes.forEach(cb => cb.checked = false);
        categoryCheckboxes.forEach(cb => cb.checked = false);
        storeCheckboxes.forEach(cb => cb.checked = false);
        if (minPriceRange && maxPriceRange) {
            minPriceRange.value = 0;
            maxPriceRange.value = 20;
        }
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'relevance';

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
        this.applyFiltersAndSort();
    }

    toggleFavoritesView() {
        this.showOnlyFavorites = !this.showOnlyFavorites;
        this.applyFiltersAndSort();
    }

    toggleCurrentProductFavorite() {
        if (!this.currentModalProduct) return;
        this.toggleFavorite(this.currentModalProduct.id);
    }

    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index === -1) {
            this.favorites.push(productId);
        } else {
            this.favorites.splice(index, 1);
        }
        this.saveFavorites();
        this.applyFiltersAndSort();
    }

    loadFavorites() {
        try {
            const favJson = localStorage.getItem('glutenvergelijker_favorites');
            if (favJson) return JSON.parse(favJson);
        } catch {
            // Geen valide favorites gevonden
        }
        return [];
    }

    saveFavorites() {
        localStorage.setItem('glutenvergelijker_favorites', JSON.stringify(this.favorites));
    }

    applyFiltersAndSort() {
        this.filteredProducts = this.products.filter(product => {
            // Favorieten filter
            if (this.showOnlyFavorites && !this.favorites.includes(product.id)) return false;
            // Zoekfilter
            if (this.currentFilters.search) {
                const needle = this.currentFilters.search.toLowerCase();
                if (!product.name.toLowerCase().includes(needle) && !product.brand.toLowerCase().includes(needle)) {
                    return false;
                }
            }
            // Merk filter
            if (this.currentFilters.brands.length && !this.currentFilters.brands.includes(product.brand)) {
                return false;
            }
            // Categorie filter
            if (this.currentFilters.categories.length && !this.currentFilters.categories.includes(product.category)) {
                return false;
            }
            // Winkel filter
            if (this.currentFilters.stores.length) {
                const hasStore = this.currentFilters.stores.some(store => product.available_stores.includes(store));
                if (!hasStore) return false;
            }
            // Prijs filter
            if (product.lowest_price === null) return false;
            if (product.lowest_price < this.currentFilters.minPrice || product.lowest_price > this.currentFilters.maxPrice) {
                return false;
            }
            return true;
        });

        // Sorteren
        switch(this.currentSort) {
            case 'price_asc':
                this.filteredProducts.sort((a,b) => a.lowest_price - b.lowest_price);
                break;
            case 'price_desc':
                this.filteredProducts.sort((a,b) => b.lowest_price - a.lowest_price);
                break;
            case 'alphabetical':
                this.filteredProducts.sort((a,b) => a.name.localeCompare(b.name));
                break;
            case 'relevance':
            default:
                // Standaard volgorde of relevantie (nu onveranderd)
                break;
        }

        this.displayProducts();
        this.updateStatistics();
    }

    displayProducts() {
        const productGrid = document.getElementById('productGrid');
        const resultsCount = document.getElementById('resultsCount');

        if (!productGrid || !resultsCount) return;

        resultsCount.textContent = `${this.filteredProducts.length} producten gevonden`;

        if (this.filteredProducts.length === 0) {
            productGrid.innerHTML = '<p>Geen producten gevonden die aan de zoek- en filtercriteria voldoen.</p>';
            return;
        }

        productGrid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card" tabindex="0" data-id="${product.id}">
                <div class="product-image">${product.image_url.startsWith('http') ? `<img src="${product.image_url}" alt="${product.name}">` : `<span class="placeholder">${product.image_url}</span>`}</div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    <p class="product-weight">${product.weight}</p>
                    <p class="product-price">Vanaf €${product.lowest_price ? product.lowest_price.toFixed(2) : 'n.n.b.'}</p>
                    <p class="product-features">${product.features ? product.features.join(', ') : ''}</p>
                </div>
            </div>
        `).join('');

        // Voeg event listener toe voor productdetails
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.getAttribute('data-id');
                this.showProductDetails(productId);
            });
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    const productId = card.getAttribute('data-id');
                    this.showProductDetails(productId);
                }
            });
        });
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        this.currentModalProduct = product;

        const modal = document.getElementById('productModal');
        if (!modal) return;

        modal.querySelector('.modal__title').textContent = product.name;
        modal.querySelector('.modal__description').textContent = product.description;
        modal.querySelector('.modal__weight').textContent = product.weight;
        modal.querySelector('.modal__price').textContent = `Vanaf €${product.lowest_price ? product.lowest_price.toFixed(2) : 'n.n.b.'}`;
        modal.querySelector('.modal__allergens').textContent = `Allergenen: ${product.allergens || 'Onbekend'}`;
        modal.querySelector('.modal__features').textContent = product.features ? product.features.join(', ') : '';
        
        const imageContainer = modal.querySelector('.modal__image');
        if (imageContainer) {
            if (product.image_url.startsWith('http')) {
                imageContainer.innerHTML = `<img src="${product.image_url}" alt="${product.name}">`;
          
