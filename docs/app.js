// Data from JSON
const appData = {
  "site_branding": {
    "naam": "glutenvergelijker",
    "tagline": "De slimste keuze voor glutenvrije boodschappen",
    "logo_url": "https://user-gen-media-assets.s3.amazonaws.com/gpt4o_images/1add3526-2b20-4f00-adfc-95534464e9ce.png"
  },
  "hero_claims": {
    "claim1": {"number": "500+", "text": "PRODUCTEN", "subtitle": "Van alle bekende merken"},
    "claim2": {"number": "15+", "text": "WINKELS", "subtitle": "Alle grote Nederlandse ketens"},
    "claim3": {"number": "1", "text": "GARANTIE", "subtitle": "Altijd de beste prijs vinden"}
  },
  "winkels": [
    {
      "naam": "Albert Heijn",
      "logo": "https://logoeps.com/wp-content/uploads/2013/03/albert-heijn-vector-logo.png",
      "url": "https://ah.nl"
    },
    {
      "naam": "Jumbo",
      "logo": "https://logoeps.com/wp-content/uploads/2014/09/jumbo-vector-logo.png",
      "url": "https://jumbo.com"
    },
    {
      "naam": "Plus",
      "logo": "https://logoeps.com/wp-content/uploads/2013/12/plus-vector-logo.png",
      "url": "https://plus.nl"
    },
    {
      "naam": "Etos",
      "logo": "https://logoeps.com/wp-content/uploads/2013/03/etos-vector-logo.png",
      "url": "https://etos.nl"
    }
  ],
  "categorieën": [
    {
      "naam": "Alle producten",
      "slug": "alle",
      "image": "https://images.unsplash.com/photo-1556908114-f6e7ad7d3136?w=300&h=200&fit=crop"
    },
    {
      "naam": "Brood & Bakkerij",
      "slug": "brood",
      "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop"
    },
    {
      "naam": "Pasta & Noodles",
      "slug": "pasta",
      "image": "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=300&h=200&fit=crop"
    },
    {
      "naam": "Koekjes & Crackers",
      "slug": "koekjes",
      "image": "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=300&h=200&fit=crop"
    },
    {
      "naam": "Ontbijt & Cereal",
      "slug": "ontbijt",
      "image": "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=300&h=200&fit=crop"
    },
    {
      "naam": "Snacks & Bars",
      "slug": "snacks",
      "image": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=300&h=200&fit=crop"
    },
    {
      "naam": "Pizza & Frozen",
      "slug": "pizza",
      "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop"
    },
    {
      "naam": "Baking Mixes",
      "slug": "mixes",
      "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop"
    },
    {
      "naam": "Pantry & Condiments",
      "slug": "pantry",
      "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop"
    },
    {
      "naam": "Beverages",
      "slug": "dranken",
      "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop"
    },
    {
      "naam": "Desserts & Sweets",
      "slug": "desserts",
      "image": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop"
    },
    {
      "naam": "Supplements",
      "slug": "supplements",
      "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
    }
  ],
  "producten": [
    {
      "id": 1,
      "naam": "Schär Wit Brood",
      "merk": "Schär",
      "beschrijving": "Premium glutenvrij wit brood, perfect voor dagelijks gebruik",
      "categorie": "brood",
      "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
      "prijzen": [
        {
          "winkel": "Albert Heijn",
          "prijs": 3.19,
          "url": "https://ah.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/03/albert-heijn-vector-logo.png"
        },
        {
          "winkel": "Jumbo",
          "prijs": 3.29,
          "url": "https://jumbo.com",
          "logo": "https://logoeps.com/wp-content/uploads/2014/09/jumbo-vector-logo.png"
        },
        {
          "winkel": "Plus",
          "prijs": 2.95,
          "beste": true,
          "url": "https://plus.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/12/plus-vector-logo.png"
        }
      ]
    },
    {
      "id": 2,
      "naam": "Consenza Fusilli Pasta",
      "merk": "Consenza",
      "beschrijving": "Glutenvrije fusilli pasta van mais en rijst",
      "categorie": "pasta",
      "image": "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=300&fit=crop",
      "prijzen": [
        {
          "winkel": "Albert Heijn",
          "prijs": 2.49,
          "url": "https://ah.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/03/albert-heijn-vector-logo.png"
        },
        {
          "winkel": "Jumbo",
          "prijs": 2.39,
          "beste": true,
          "url": "https://jumbo.com",
          "logo": "https://logoeps.com/wp-content/uploads/2014/09/jumbo-vector-logo.png"
        },
        {
          "winkel": "Etos",
          "prijs": 2.59,
          "url": "https://etos.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/03/etos-vector-logo.png"
        }
      ]
    },
    {
      "id": 3,
      "naam": "Gullon Digestive Koekjes",
      "merk": "Gullon",
      "beschrijving": "Krokante glutenvrije digestive koekjes",
      "categorie": "koekjes",
      "image": "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=400&h=300&fit=crop",
      "prijzen": [
        {
          "winkel": "Jumbo",
          "prijs": 2.79,
          "url": "https://jumbo.com",
          "logo": "https://logoeps.com/wp-content/uploads/2014/09/jumbo-vector-logo.png"
        },
        {
          "winkel": "Albert Heijn",
          "prijs": 2.89,
          "url": "https://ah.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/03/albert-heijn-vector-logo.png"
        },
        {
          "winkel": "Plus",
          "prijs": 2.69,
          "beste": true,
          "url": "https://plus.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/12/plus-vector-logo.png"
        }
      ]
    },
    {
      "id": 4,
      "naam": "Dr. Oetker Broodmix",
      "merk": "Dr. Oetker",
      "beschrijving": "Zelf glutenvrij brood maken",
      "categorie": "mixes",
      "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      "prijzen": [
        {
          "winkel": "Albert Heijn",
          "prijs": 4.19,
          "url": "https://ah.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/03/albert-heijn-vector-logo.png"
        },
        {
          "winkel": "Etos",
          "prijs": 3.99,
          "beste": true,
          "url": "https://etos.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/03/etos-vector-logo.png"
        }
      ]
    },
    {
      "id": 5,
      "naam": "Schär Pizza Base",
      "merk": "Schär",
      "beschrijving": "Glutenvrije pizzabodems",
      "categorie": "pizza",
      "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      "prijzen": [
        {
          "winkel": "Jumbo",
          "prijs": 3.59,
          "url": "https://jumbo.com",
          "logo": "https://logoeps.com/wp-content/uploads/2014/09/jumbo-vector-logo.png"
        },
        {
          "winkel": "Plus",
          "prijs": 3.49,
          "beste": true,
          "url": "https://plus.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/12/plus-vector-logo.png"
        }
      ]
    },
    {
      "id": 6,
      "naam": "Orgran Pancake Mix",
      "merk": "Orgran",
      "beschrijving": "Glutenvrije pannenkoekenmix",
      "categorie": "ontbijt",
      "image": "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=400&h=300&fit=crop",
      "prijzen": [
        {
          "winkel": "Albert Heijn",
          "prijs": 4.95,
          "beste": true,
          "url": "https://ah.nl",
          "logo": "https://logoeps.com/wp-content/uploads/2013/03/albert-heijn-vector-logo.png"
        },
        {
          "winkel": "Jumbo",
          "prijs": 5.29,
          "url": "https://jumbo.com",
          "logo": "https://logoeps.com/wp-content/uploads/2014/09/jumbo-vector-logo.png"
        }
      ]
    }
  ]
};

class GlutenvergelijkerApp {
    constructor() {
        this.currentProducts = [...appData.producten];
        this.currentCategory = 'alle';
        this.currentSearch = '';
        this.elements = {};
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        this.initializeElements();
        this.renderCategories();
        this.renderProducts();
        this.populateCategoryFilter();
        this.setupEventListeners();
        console.log('Glutenvergelijker app initialized successfully');
    }
    
    initializeElements() {
        this.elements = {
            categoriesGrid: document.getElementById('categoriesGrid'),
            productsGrid: document.getElementById('productsGrid'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            categoryFilter: document.getElementById('categoryFilter'),
            priceSort: document.getElementById('priceSort'),
            categoriesBtn: document.getElementById('categoriesBtn'),
            sortBtn: document.getElementById('sortBtn')
        };
        
        // Check if all elements exist
        Object.keys(this.elements).forEach(key => {
            if (!this.elements[key]) {
                console.warn(`Element ${key} not found`);
            }
        });
    }
    
    renderCategories() {
        if (!this.elements.categoriesGrid) return;
        
        this.elements.categoriesGrid.innerHTML = '';
        
        appData.categorieën.forEach(category => {
            if (category.slug === 'alle') return;
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.setAttribute('data-category', category.slug);
            
            categoryCard.innerHTML = `
                <img src="${category.image}" alt="${category.naam}" class="category-image" loading="lazy">
                <div class="category-info">
                    <h3 class="category-name">${category.naam}</h3>
                </div>
            `;
            
            // Add click handler
            categoryCard.addEventListener('click', () => {
                this.filterByCategory(category.slug);
            });
            
            this.elements.categoriesGrid.appendChild(categoryCard);
        });
    }
    
    renderProducts() {
        if (!this.elements.productsGrid) return;
        
        this.elements.productsGrid.innerHTML = '';
        
        if (this.currentProducts.length === 0) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--color-text-secondary); grid-column: 1 / -1;">
                    <h3>Geen producten gevonden</h3>
                    <p>Probeer een andere zoekopdracht of selecteer een andere categorie.</p>
                    <button class="btn btn--secondary" onclick="app.clearAllFilters()">Toon alle producten</button>
                </div>
            `;
            this.elements.productsGrid.appendChild(noResultsDiv);
            return;
        }
        
        this.currentProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            this.elements.productsGrid.appendChild(productCard);
        });
    }
    
    createProductCard(product) {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product-id', product.id);
        
        const pricesHTML = product.prijzen.map(prijs => `
            <div class="price-item ${prijs.beste ? 'best-price' : ''}">
                <div class="price-store-info">
                    <img src="${prijs.logo}" alt="${prijs.winkel}" class="store-logo-small" loading="lazy">
                    <span class="store-name">${prijs.winkel}</span>
                    ${prijs.beste ? '<span class="best-price-badge">Beste prijs</span>' : ''}
                </div>
                <div class="price-amount">€${prijs.prijs.toFixed(2)}</div>
                <a href="${prijs.url}" target="_blank" class="shop-button" rel="noopener">Kopen</a>
            </div>
        `).join('');
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.naam}" class="product-image" loading="lazy">
            <div class="product-info">
                <div class="product-brand">${product.merk}</div>
                <h3 class="product-name">${product.naam}</h3>
                <p class="product-description">${product.beschrijving}</p>
                <div class="product-prices">
                    <div class="prices-title">Prijzen vergelijken:</div>
                    <div class="price-list">
                        ${pricesHTML}
                    </div>
                </div>
            </div>
        `;
        
        return productCard;
    }
    
    populateCategoryFilter() {
        if (!this.elements.categoryFilter) return;
        
        this.elements.categoryFilter.innerHTML = '<option value="alle">Alle categorieën</option>';
        
        appData.categorieën.forEach(category => {
            if (category.slug === 'alle') return;
            const option = document.createElement('option');
            option.value = category.slug;
            option.textContent = category.naam;
            this.elements.categoryFilter.appendChild(option);
        });
    }
    
    setupEventListeners() {
        // Search functionality
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        }
        
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                }
            });
        }
        
        // Category filter dropdown
        if (this.elements.categoryFilter) {
            this.elements.categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }
        
        // Price sort
        if (this.elements.priceSort) {
            this.elements.priceSort.addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
        }
        
        // Header navigation buttons
        if (this.elements.categoriesBtn) {
            this.elements.categoriesBtn.addEventListener('click', () => {
                this.scrollToSection('.categories-section');
            });
        }
        
        if (this.elements.sortBtn) {
            this.elements.sortBtn.addEventListener('click', () => {
                this.scrollToSection('.products-section');
            });
        }
    }
    
    performSearch() {
        if (!this.elements.searchInput) return;
        
        const searchValue = this.elements.searchInput.value.toLowerCase().trim();
        this.currentSearch = searchValue;
        
        console.log('Performing search for:', searchValue);
        this.applyFilters();
        this.scrollToSection('.products-section');
    }
    
    filterByCategory(categorySlug) {
        console.log('Filtering by category:', categorySlug);
        this.currentCategory = categorySlug;
        
        if (this.elements.categoryFilter) {
            this.elements.categoryFilter.value = categorySlug;
        }
        
        this.applyFilters();
        this.scrollToSection('.products-section');
    }
    
    applyFilters() {
        let filteredProducts = [...appData.producten];
        
        // Apply category filter
        if (this.currentCategory !== 'alle') {
            filteredProducts = filteredProducts.filter(product => 
                product.categorie === this.currentCategory
            );
        }
        
        // Apply search filter
        if (this.currentSearch) {
            filteredProducts = filteredProducts.filter(product =>
                product.naam.toLowerCase().includes(this.currentSearch) ||
                product.merk.toLowerCase().includes(this.currentSearch) ||
                product.beschrijving.toLowerCase().includes(this.currentSearch)
            );
        }
        
        this.currentProducts = filteredProducts;
        
        // Maintain current sort
        if (this.elements.priceSort && this.elements.priceSort.value !== 'default') {
            this.sortProducts(this.elements.priceSort.value, false);
        } else {
            this.renderProducts();
        }
        
        console.log(`Found ${this.currentProducts.length} products after filtering`);
    }
    
    sortProducts(sortType, shouldRender = true) {
        if (this.elements.priceSort) {
            this.elements.priceSort.value = sortType;
        }
        
        switch (sortType) {
            case 'low-to-high':
                this.currentProducts.sort((a, b) => {
                    const minPriceA = Math.min(...a.prijzen.map(p => p.prijs));
                    const minPriceB = Math.min(...b.prijzen.map(p => p.prijs));
                    return minPriceA - minPriceB;
                });
                break;
            case 'high-to-low':
                this.currentProducts.sort((a, b) => {
                    const minPriceA = Math.min(...a.prijzen.map(p => p.prijs));
                    const minPriceB = Math.min(...b.prijzen.map(p => p.prijs));
                    return minPriceB - minPriceA;
                });
                break;
            case 'default':
                this.currentProducts.sort((a, b) => a.id - b.id);
                break;
        }
        
        if (shouldRender) {
            this.renderProducts();
        }
    }
    
    clearAllFilters() {
        this.currentSearch = '';
        this.currentCategory = 'alle';
        
        if (this.elements.searchInput) this.elements.searchInput.value = '';
        if (this.elements.categoryFilter) this.elements.categoryFilter.value = 'alle';
        if (this.elements.priceSort) this.elements.priceSort.value = 'default';
        
        this.currentProducts = [...appData.producten];
        this.renderProducts();
    }
    
    scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Initialize the app
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new GlutenvergelijkerApp();
    });
} else {
    app = new GlutenvergelijkerApp();
}