// Updated app.js - Uses real data from JSON
let currentData = null;
let filteredProducts = [];
let currentCategory = 'alle';
let currentSort = 'name';

// Initialize app when data is loaded
document.addEventListener('glutenvrijDataLoaded', (event) => {
    currentData = event.detail;
    initializeApp();
});

function initializeApp() {
    console.log('🚀 Initializing Glutenvergelijker with real data');

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

    categoriesContainer.innerHTML = categories.map(category => `
        <div class="category-card ${currentCategory === category.slug ? 'active' : ''}" 
             onclick="selectCategory('${category.slug}')">
            <img src="${category.image}" alt="${category.naam}" class="category-image">
            <h3 class="category-name">${category.naam}</h3>
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
            </div>
        `;
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.categorie}">
            <img src="${product.afbeelding}" alt="${product.naam}" class="product-image">

            <div class="product-info">
                <h3 class="product-name">${product.naam}</h3>
                <p class="product-brand">${product.merk}</p>
                <p class="product-description">${product.beschrijving}</p>
            </div>

            <div class="product-prices">
                <h4>Prijzen vergelijken:</h4>
                ${product.prijzen.map(prijs => `
                    <div class="price-row ${prijs.beste ? 'best-price' : ''}">
                        <img src="${prijs.logo}" alt="${prijs.winkel}" class="store-logo">
                        <span class="store-name">${prijs.winkel}</span>
                        <span class="price">€${prijs.prijs.toFixed(2)}</span>
                        ${prijs.beste ? '<span class="best-badge">Beste prijs</span>' : ''}
                        <a href="${prijs.url}" target="_blank" class="buy-button">Koop nu</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function selectCategory(category) {
    currentCategory = category;

    // Update category UI
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    event.target.closest('.category-card').classList.add('active');

    // Filter and render products
    filteredProducts = glutenvrijData.getProducts(category);
    renderProducts(filteredProducts);

    updateStats();
}

function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';

    if (query) {
        filteredProducts = glutenvrijData.searchProducts(query);
    } else {
        filteredProducts = glutenvrijData.getProducts(currentCategory);
    }

    renderProducts(filteredProducts);
    updateStats();
}

function sortProducts(sortBy) {
    currentSort = sortBy;
    filteredProducts = glutenvrijData.sortProducts(filteredProducts, sortBy);
    renderProducts(filteredProducts);
}

function updateStats() {
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer && currentData) {
        statsContainer.innerHTML = `
            <div class="stat">
                <span class="stat-number">${currentData.meta.total_products}</span>
                <span class="stat-label">Producten</span>
            </div>
            <div class="stat">
                <span class="stat-number">${currentData.meta.total_stores}</span>
                <span class="stat-label">Winkels</span>
            </div>
            <div class="stat">
                <span class="stat-number">${filteredProducts.length}</span>
                <span class="stat-label">Resultaten</span>
            </div>
        `;
    }
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', searchProducts);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', searchProducts);
    }

    // Sort functionality
    const sortBtn = document.getElementById('sortBtn');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            // Toggle sort options
            const sortOptions = document.getElementById('sort-options');
            if (sortOptions) {
                sortOptions.style.display = sortOptions.style.display === 'block' ? 'none' : 'block';
            }
        });
    }
}

// Global functions for onclick handlers
window.selectCategory = selectCategory;
window.searchProducts = searchProducts;
window.sortProducts = sortProducts;
