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
