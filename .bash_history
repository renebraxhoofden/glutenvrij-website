python3 prijzen.py
sudo apt update
sudo apt install python3 python3-pip -y
python3 --version
sudo apt install software-properties-common apt-transport-https wget -y
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > package
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 p
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list
sudo apt update && sudo apt install code -y
code
sudo apt install git -y
git --version
cd ~/Downloads/glutenvrij-website   # map van je website
git init
git remote add origin https://github.com/renebraxhoofden/glutenvrij-website.git
git add .
git commit -m "Eerste versie"
git push -u origin master
renebraxhoofden@penguin:~$ cd ~/Downloads/glutenvrij-website   # map van je website
git init
git remote add origin https://github.com/renebraxhoofden/glutenvrij-website.git
git add .
git commit -m "Eerste versie"
git push -u origin master
-bash: cd: /home/renebraxhoofden/Downloads/glutenvrij-website: No such file or directory
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint: 
hint:   git config --global init.defaultBranch <name>
hint: 
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint: 
hint:   git branch -m <name>
Initialized empty Git repository in /home/renebraxhoofden/.git/
Author identity unknown
*** Please tell me who you are.
Run
to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: unable to auto-detect email address (got 'renebraxhoofden@penguin.(none)')
error: src refspec master does not match any
error: failed to push some refs to 'https://github.com/renebraxhoofden/glutenvri




renebraxhoofden@penguin:~$ git --version
cd ~/Downloads/glutenvrij-website   # map van je website
git init
git remote add origin https://github.com/renebraxhoofden/glutenvrij-website.git
git add .
git commit -m "Eerste versie"
git push -u origin master
cd ~/Downloads/glutenvrij-website   # map van je website
git init
git remote add origin https://github.com/renebraxhoofden/glutenvrij-website.git
git add .
git commit -m "Eerste versie"
git push -u origin master
cd ~/Downloads/glutenvrij-website   # map van je website
git init
git remote add origin https://github.com/renebraxhoofden/glutenvrij-website.git
git add .
git commit -m "Eerste versie"
git push -u origin master
cd ~/Downloads/glutenvrij-website   # map van je website
git init
git remote add origin https://github.com/renebraxhoofden/glutenvrij-website.git
git add .
git commit -m "Eerste versie"
git push -u origin master
cd ~/Downloads/glutenvrij-website   # map van je website
git init
git remote add origin https://github.com/renebraxhoofden/glutenvrij-website.git
git add .
git commit -m "Eerste versie"
git push -u origin master
cd ~/Downloads/glutenvrij-website   # map van je website
git init
git remote add origin https://github.com/renebraxhoofden/glutenvrij-website.git
git add .
git commit -m "Eerste versie"
git push -u origin master
pip install requests beautifulsoup4
python3 -m venv venv
sudo apt update
sudo apt install python3.11-venv
python3 -m venv venv
source venv/bin/activate
pip install requests beautifulsoup4
code
python scraper.py
source venv/bin/activate
pip install requests beautifulsoup4
python scraper.py
source venv/bin/activate
pip install requests beautifulsoup4
python scraper.py
git add .
git commit -m "Scraper + workflow"
git push
rm -rf venv
echo "venv/" >> .gitignore
git add .gitignore
git rm -rf venv
git commit -m "Verwijderd lokale venv uit repo"
git push
git add .github/workflows/update.yml
git commit -m "Workflow aangepast voor GitHub Actions"
git push
git add .github/workflows/update.yml
git commit -m "Cron syntax fix"
git push
git add .github/workflows/update.yml
git commit -m "Voeg GitHub Actions workflow toe"
git push
git add .github/workflows/update.yml
git commit -m "Voeg GitHub Actions workflow toe"
git push
git add .github/workflows/update.yml
git commit -m "Voeg GitHub Actions workflow toe"
git push
git add .github/workflows/update.yml
git commit -m "Voeg GitHub Actions workflow toe"
git push
git add .github/workflows/update.yml
git commit -m "Commit alleen bij veranderingen in prijzen.json"
git push
git add .github/workflows/update.yml
git commit -m "Commit alleen bij veranderingen in prijzen.json"
git push
git add .github/workflows/update.yml
git commit -m "Commit alleen bij veranderingen in prijzen.json"
git push
git add .github/workflows/update.yml
git commit -m "Commit alleen bij veranderingen in prijzen.json"
git push
git add index.html script.js
git commit -m "Prijzen live tonen op site"
git push
git add index.html script.js
git commit -m "Prijzen live tonen op site"
git push
cd glutenvrij-website
git add index.html script.js
git commit -m "Prijzen live tonen op site"
git push
git add glutenvrij-website/index.html glutenvrij-website/script.js
git commit -m "Prijzen live tonen op site"
git push
git add index.html script.js
git commit -m "Prijzen live tonen op site"
git push
cd glutenvrij-website
git add .
git commit -m "Nieuwe websiteversie met fixes"
git push
git add .
git commit -m "Zet site opnieuw online"
git push
cd renebraxhoofden/glutenvrij-website
git add .
git commit -m "Zet nieuwe website in glutenvrij-website map"
git push
mv glutenvrij-website docs
cd
mv glutenvrij-website docs
git add .
git commit -m "Hernoem website-map naar docs voor Github Pages"
git push
cd docs/
git add .
git commit -m "🚀 Launch automatic scraping system"  
git push
cp glutenvrij_products_complete.json docs/glutenvrij_products.json
cp glutenvrij_data_loader.js docs/
cp updated_app.js docs/app.js
cd
cp glutenvrij_products_complete.json docs/glutenvrij_products.json
cp glutenvrij_data_loader.js docs/
cp updated_app.js docs/app.js
cp glutenvrij_products_complete.json docs/glutenvrij_products.json
cp glutenvrij_data_loader.js docs/
cp updated_app.js docs/app.js
git add .
git commit -m "🚀 Complete Glutenvrije Webshop integration"
git push
cp glutenvrij_products_complete.json docs/glutenvrij_products.json
cp glutenvrij_data_loader.js docs/
cp updated_app.js docs/app.js
pwd
ls
cd dowcs/
cd docs/
pwd
ls
cp glutenvrij_products_complete.json docs/glutenvrij_products.json
cp glutenvrij_data_loader.js docs/
cp updated_app.js docs/app.js
ls
ls docs/
cd
ls docs/
mv docs/updated_app.js docs/app.js
cp docs/glutenvrij_products_complete.json docs/glutenvrij_products.json
cd docs/
git add app.js glutenvrij_products.json
git commit -m "Update app.js en product database"
git push
git pull origin master
git pull --no-rebase origin master
cd docs/
git pull --no-rebase origin master
git status
git commit -m "Merge remote-tracking branch 'origin/master' into master"
git status
git push origin master
cd /pad/naar/jouw/project
cd /docs/assets/logo/
cd assents/
lp
ip
cd
git add docs/assets/logo/
git commit -m "Voeg winkel-logo assets toe"
git push
chmod +x deploy.sh
./deploy.sh
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cd docs && git add . && git commit -m "🚀 Complete optimization" && git push
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cd docs && git add . && git commit -m "🚀 Complete optimization" && git push
cd
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cd docs && git add . && git commit -m "🚀 Complete optimization" && git push
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cd docs && git add . && git commit -m "🚀 Complete optimization" && git push
pwd
ls -l
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cp glutenvrij_data_loader.js docs/
cd
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cp glutenvrij_data_loader.js docs/
cd docs
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cp glutenvrij_data_loader.js docs/
find ~ -name "docs" -type d 2>/dev/null
ls -la
cd $(find ~ -name "docs" -type d 2>/dev/null | head -1 | dirname)
cd docs
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cp glutenvrij_data_loader.js docs/
cp glutenvrij_products_optimized.json docs/glutenvrij_products.json
cp improved_app.js docs/app.js
cp improved_style.css docs/style.css
cd docs && git add . && git commit -m "🚀 Complete optimization" && git push
chmod +x deploy.sh
./deploy.sh
cd
chmod +x deploy.sh
./deploy.sh
chmod +x deploy.sh
./deploy.sh
cd docs
mv app.js app_old.js
mv style.css style_old.css
mv glutenvrij_products.json glutenvrij_products_old.json
mv improved_app.js app.js
mv improved_style.css style.css
mv glutenvrij_products_optimized.json glutenvrij_products.json
git add app.js style.css glutenvrij_products.json
git commit -m "🚀 Zet geoptimaliseerde site live"
git push
python auto_product_expansion.py
python3 --version
python3 auto_product_expansion.py
pip install requests
pip3 install requests
python3 auto_product_expansion.py
sudo apt update
sudo apt install python3-requests
python3 auto_product_expansion.py
git add .
git commit -m "Alles vernieuwd: meer producten, snellere site"
git push origin main
git add .
git commit -m "Alles vernieuwd: meer producten, snellere site"
git push origin main
git add .
git commit -m "Alles vernieuwd: meer producten, snellere site"
git push origin master
git pull origin master
git add .
git commit -m "Conflicten opgelost en mijn aanpassingen toegevoegd"
git pull --no-rebase origin master
git add .
git commit -m "Conflicten opgelost en mijn aanpassingen toegevoegd"
git add .
git commit -m "Alles vernieuwd: meer producten, snellere site"
git push origin main
git add .
git commit -m "Alles vernieuwd: meer producten, snellere site"
git push origin master
git add .
git commit -m "Alles vernieuwd: meer producten, snellere site"
git push origin master
git add .
git commit -m "🌾 MEGA UPDATE: 2500+ products, automation, affiliate ready"
git push origin master
git pull origin master
git pull --no-rebase origin master
git add .
git commit -m "🌾 MEGA UPDATE: Alles gefixt + 2500 producten automatisering"
git push origin master
