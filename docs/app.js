// Verbeterde app.js met lokale logo's en UX optimalisaties
let currentData = null;
let filteredProducts = [];
let currentCategory = 'alle';
let currentSort = 'name';
let isFiltering = false; // Track of we aan het filteren zijn

// Initialize app when data is loaded
document.addEventListener('glutenvrijDataLoaded', (event) => {
    currentData = event.detail;
    initializeApp();
});

function initializeApp() {
    console.log('🚀 Initializing Glutenvergelijker with optimized UX');

    // Render categories
    renderCategories();

    // Set initial products
    filteredProducts = glutenvrijData.getProducts();
    renderProducts(filteredProducts);

    // Setup event listeners
    setupEventListeners();

    // Update stats
    updateStats();
}

function renderCategories() {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) return;

    const categories = glutenvrijData.getCategories();

    // Bepaal of categorieën compact moeten worden weergegeven
    const isCompact = isFiltering;
    const containerClass = isCompact ? 'categories-grid-compact' : 'categories-grid';

    categoriesContainer.className = containerClass;
    categoriesContainer.innerHTML = categories.map(category => `
        <div class="category-card ${currentCategory === category.slug ? 'active' : ''} ${isCompact ? 'compact' : ''}" 
             onclick="selectCategory('${category.slug}')">
            <img src="${category.image}" alt="${category.naam}" class="category-image ${isCompact ? 'small' : ''}">
            <h3 class="category-name ${isCompact ? 'small-text' : ''}">${category.naam}</h3>
        </div>
    `).join('');
}

function renderProducts(products) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-results">
                <h3>Geen producten gevonden</h3>
                <p>Probeer een andere zoekopdracht of filter</p>
                <button onclick="resetFilters()" class="btn btn--primary">Alle producten tonen</button>
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.categorie}">
            <img src="${product.afbeelding}" alt="${product.naam}" class="product-image" loading="lazy">

            <div class="product-info">
                <h3 class="product-name">${product.naam}</h3>
                <p class="product-brand">${product.merk}</p>
                <p class="product-description">${product.beschrijving}</p>
            </div>

            <div class="product-prices">
                <h4>Prijzen vergelijken:</h4>
                ${product.prijzen.map(prijs => `
                    <div class="price-row ${prijs.beste ? 'best-price' : ''} ${!prijs.in_stock ? 'out-of-stock' : ''}">
                        <img src="${prijs.logo}" alt="${prijs.winkel}" class="store-logo" onerror="this.style.display='none'">
                        <span class="store-name">${prijs.winkel}</span>
                        <span class="price">€${prijs.prijs.toFixed(2)}</span>
                        ${prijs.beste ? '<span class="best-badge">Beste prijs</span>' : ''}
                        ${prijs.in_stock ? 
                            `<a href="${prijs.url}" target="_blank" rel="noopener" class="buy-button">Koop nu</a>` :
                            '<span class="out-of-stock-badge">Niet op voorraad</span>'
                        }
                    </div>
                `).join('')}
            </div>

            <div class="product-meta">
                <span class="product-category">${getCategoryDisplayName(product.categorie)}</span>
                ${product.grootte ? `<span class="product-size">${product.grootte}</span>` : ''}
            </div>
        </div>
    `).join('');
}

function selectCategory(category) {
    currentCategory = category;
    isFiltering = category !== 'alle';

    // Update UI state
    updateUIForFiltering();

    // Update category UI
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    document.querySelector(`[onclick="selectCategory('${category}')"]`)?.classList.add('active');

    // Filter and render products
    filteredProducts = glutenvrijData.getProducts(category);
    renderProducts(filteredProducts);

    // Re-render categories in compact mode if filtering
    renderCategories();

    updateStats();

    // Scroll to products section when filtering
    if (isFiltering) {
        document.getElementById('products-container')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';

    if (query) {
        isFiltering = true;
        filteredProducts = glutenvrijData.searchProducts(query);
    } else {
        isFiltering = currentCategory !== 'alle';
        filteredProducts = glutenvrijData.getProducts(currentCategory);
    }

    updateUIForFiltering();
    renderCategories(); // Re-render in compact mode
    renderProducts(filteredProducts);
    updateStats();
}

function sortProducts(sortBy) {
    currentSort = sortBy;
    filteredProducts = glutenvrijData.sortProducts(filteredProducts, sortBy);
    renderProducts(filteredProducts);

    // Update sort button text
    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        const sortLabels = {
            'name': 'Naam',
            'price-low': 'Prijs ↗',
            'price-high': 'Prijs ↘'
        };
        sortBtn.textContent = `Sorteren: ${sortLabels[sortBy] || 'Naam'}`;
    }
}

function resetFilters() {
    currentCategory = 'alle';
    isFiltering = false;

    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // Reset to all products
    filteredProducts = glutenvrijData.getProducts();

    updateUIForFiltering();
    renderCategories(); // Back to full size
    renderProducts(filteredProducts);
    updateStats();

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateUIForFiltering() {
    // Toggle hero claims visibility
    const heroClaims = document.querySelector('.hero-claims');
    if (heroClaims) {
        if (isFiltering) {
            heroClaims.style.display = 'none';
        } else {
            heroClaims.style.display = 'flex';
        }
    }

    // Update hero section size
    const hero = document.querySelector('.hero');
    if (hero) {
        if (isFiltering) {
            hero.classList.add('hero-compact');
        } else {
            hero.classList.remove('hero-compact');
        }
    }
}

function updateStats() {
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer && currentData) {
        const totalSavings = calculateTotalSavings();

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat">
                    <span class="stat-number">${currentData.meta.total_products}</span>
                    <span class="stat-label">Totaal Producten</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${currentData.meta.total_stores}</span>
                    <span class="stat-label">Winkels</span>
                </div>
                <div class="stat">
                    <span class="stat-number">${filteredProducts.length}</span>
                    <span class="stat-label">${isFiltering ? 'Resultaten' : 'Beschikbaar'}</span>
                </div>
                <div class="stat savings-stat">
                    <span class="stat-number">€${totalSavings.toFixed(0)}</span>
                    <span class="stat-label">Gemiddelde Besparing</span>
                </div>
            </div>
        `;
    }
}

function calculateTotalSavings() {
    let totalSavings = 0;
    let productCount = 0;

    filteredProducts.forEach(product => {
        if (product.prijzen.length > 1) {
            const prijzen = product.prijzen.map(p => p.prijs);
            const maxPrice = Math.max(...prijzen);
            const minPrice = Math.min(...prijzen);
            totalSavings += (maxPrice - minPrice);
            productCount++;
        }
    });

    return productCount > 0 ? totalSavings / productCount : 0;
}

function getCategoryDisplayName(categorySlug) {
    const categoryNames = {
        'brood': 'Brood & Bakkerij',
        'pasta': 'Pasta & Noodles',
        'koekjes': 'Koekjes & Crackers',
        'ontbijt': 'Ontbijt & Cereal',
        'snacks': 'Snacks & Bars',
        'pizza': 'Pizza & Frozen',
        'mixen': 'Baking Mixes',
        'sauzen': 'Sauzen & Condiments',
        'dranken': 'Beverages',
        'desserts': 'Desserts & Sweets',
        'overig': 'Overige Producten'
    };

    return categoryNames[categorySlug] || categorySlug;
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchProducts, 300));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', searchProducts);
    }

    // Sort functionality
    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            showSortOptions();
        });
    }

    // Category filter dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            selectCategory(e.target.value);
        });

        // Populate category filter
        const categories = glutenvrijData.getCategories();
        categoryFilter.innerHTML = categories.map(cat => 
            `<option value="${cat.slug}">${cat.naam}</option>`
        ).join('');
    }

    // Price sort dropdown
    const priceSort = document.getElementById('priceSort');
    if (priceSort) {
        priceSort.addEventListener('change', (e) => {
            sortProducts(e.target.value === 'default' ? 'name' : e.target.value.replace('low-to-high', 'price-low').replace('high-to-low', 'price-high'));
        });
    }
}

function showSortOptions() {
    // Simple sort cycling
    const sortOptions = ['name', 'price-low', 'price-high'];
    const currentIndex = sortOptions.indexOf(currentSort);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    sortProducts(sortOptions[nextIndex]);
}

// Utility function for debouncing search
function debounce(func, wait) {
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

// Global functions for onclick handlers
window.selectCategory = selectCategory;
window.searchProducts = searchProducts;
window.sortProducts = sortProducts;
window.resetFilters = resetFilters;

// Auto-refresh data every 5 minutes
setInterval(() => {
    if (window.glutenvrijData) {
        window.glutenvrijData.loadData().then(() => {
            console.log('🔄 Data refreshed automatically');
        });
    }
}, 5 * 60 * 1000);

// Performance monitoring
window.addEventListener('load', () => {
    console.log('📊 Page fully loaded');
    console.log(`💾 Products loaded: ${filteredProducts.length}`);
    console.log(`🏪 Stores available: ${currentData?.meta?.total_stores || 0}`);
});
