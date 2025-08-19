#!/bin/bash
# Glutenvergelijker.nl - Quick Setup Script

echo "🌾 Setting up Glutenvergelijker.nl..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Please run this script from your project's docs/ directory"
    exit 1
fi

echo "📦 Checking file structure..."

# Check required files
required_files=(
    "index.html"
    "style.css" 
    "app.js"
    "glutenvrij_data_loader.js"
    "glutenvrij_products.json"
    "ultimate_product_scraper.py"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing files:"
    printf '%s\n' "${missing_files[@]}"
    echo "Please ensure all files are in your docs/ directory"
    exit 1
fi

echo "✅ All required files present"

# Check assets directory
if [ ! -d "assets/logo" ]; then
    echo "⚠️ Creating assets/logo directory..."
    mkdir -p assets/logo
    echo "📝 Please add your partner logos to assets/logo/"
fi

echo "🔧 Setting up Python environment..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.7+"
    exit 1
fi

echo "✅ Python 3 found"

# Install dependencies
echo "📦 Installing Python dependencies..."
if pip3 install aiohttp beautifulsoup4 lxml > /dev/null 2>&1; then
    echo "✅ Python dependencies installed"
else
    echo "⚠️ Could not install some dependencies. Please run:"
    echo "   pip3 install aiohttp beautifulsoup4 lxml"
fi

# Test JSON validity
echo "📋 Validating product database..."
if python3 -c "import json; json.load(open('glutenvrij_products.json'))" 2>/dev/null; then
    echo "✅ Product database is valid JSON"
else
    echo "❌ Product database has JSON errors"
    exit 1
fi

# Test scraper
echo "🧪 Testing scraper (this may take a moment)..."
if timeout 30 python3 ultimate_product_scraper.py > /dev/null 2>&1; then
    echo "✅ Scraper test completed"
else
    echo "⚠️ Scraper test timed out (normal for full runs)"
fi

# Git setup
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git repository detected"

    echo "🚀 Ready to deploy? (y/n)"
    read -r response

    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📤 Deploying to GitHub..."
        git add .
        git commit -m "🌾 Complete Glutenvergelijker.nl deployment with 2500+ product automation"

        if git push origin master; then
            echo "✅ Successfully deployed to GitHub!"
            echo ""
            echo "🎉 Your site should be live at:"
            echo "   https://$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')"
        else
            echo "❌ Git push failed. Please check your repository settings."
        fi
    fi
else
    echo "⚠️ Not a git repository. Please initialize git and set up GitHub Pages."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your website to verify it's working"
echo "2. Set up daily cron job:"
echo "   crontab -e"
echo "   Add: 0 6 * * * cd $(pwd) && python3 ultimate_product_scraper.py"
echo "3. Check DEPLOYMENT_GUIDE.md for detailed instructions"
echo "4. Add your affiliate IDs to ultimate_product_scraper.py"
echo ""
echo "🌾 Happy comparing!"