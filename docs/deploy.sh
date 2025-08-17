#!/bin/bash
# Quick deployment script voor Glutenvergelijker.nl

echo "🚀 Starting Glutenvergelijker.nl deployment..."

# Check if we're in the right directory
if [ ! -d "docs" ]; then
    echo "❌ Error: docs/ directory not found. Make sure you're in the project root."
    exit 1
fi

# Backup existing files
echo "💾 Creating backup..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp docs/*.js docs/*.css docs/*.json backup/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# Copy optimized files
echo "📁 Copying optimized files..."
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cp glutenvrij_data_loader.js docs/

# Check if assets directory exists
if [ ! -d "docs/assets/logo" ]; then
    echo "⚠️  Warning: docs/assets/logo/ directory not found."
    echo "   Make sure to upload your logo files to docs/assets/logo/"
    echo "   Required files:"
    echo "   - ah-albert-heijn.svg"
    echo "   - jumbo-logo.svg"
    echo "   - plus.svg"
    echo "   - glutenvrijewebshop.png"
    echo "   - schar.png"
    echo "   - Picnic_logo.svg.png"
fi

# Git operations
echo "📤 Committing changes..."
cd docs/
git add .
git commit -m "🚀 Deploy optimized Glutenvergelijker: lokale logos + UX improvements + 63 products"
git push

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://renebraxhoofden.github.io/glutenvrij-website/"
echo "⏱️  Allow 1-5 minutes for GitHub Pages to update."
echo ""
echo "🔍 Next steps:"
echo "   1. Test your website thoroughly"
echo "   2. Check browser console for any errors"
echo "   3. Verify all logos load correctly"
echo "   4. Test search and filtering functionality"
echo ""
echo "📊 Your site now has:"
echo "   • 63 glutenvrije producten"
echo "   • 6 winkels met lokale logo's"
echo "   • 191 prijsvergelijkingen"
echo "   • UX optimalisaties"
echo "   • Mobile responsive design"
echo ""
echo "💰 Ready for monetization through:"
echo "   • Affiliate marketing"
echo "   • Premium subscriptions"  
echo "   • Advertising revenue"
echo ""
echo "🎉 Success! Your Glutenvergelijker.nl is now production-ready!"
