Write-Host Install Chocolatey
Write-Host Instructions from https://chocolate.org/install

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install nodejs --version=16.11.1 -y

choco install mongodb --version=4.4.4 -y

choco install git -y

refreshenv

mkdir C:\Hombrewery
cd C:\Hombrewery

git clone https://github.com/naturalcrit/homebrewery.git

cd homebrewery

npm install
npm audit fix

[System.Environment]::SetEnvironmentVariable('NODE_ENV', 'local')

npm start