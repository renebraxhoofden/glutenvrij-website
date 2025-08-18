// Data loader for glutenvrije products
(function() {
    'use strict';

    console.log('📊 Loading glutenvrije product data...');

    // This will be replaced with actual data loading
    // For now, create some sample data based on our research
    window.glutenvrijeProducten = [];

    // Load products from JSON file
    fetch('glutenvrij_products.json')
        .then(response => response.json())
        .then(data => {
            window.glutenvrijeProducten = data;
            console.log(`✅ Loaded ${data.length} glutenvrije products`);

            // Dispatch custom event to notify app that data is ready
            const dataLoadedEvent = new CustomEvent('glutenvrijeDataLoaded', {
                detail: { products: data }
            });
            window.dispatchEvent(dataLoadedEvent);
        })
        .catch(error => {
            console.error('❌ Failed to load product data:', error);
            // Fallback to empty array
            window.glutenvrijeProducten = [];
        });
})();
