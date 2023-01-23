Write-Host Install Chocolatey
Write-Host Instructions from https://chocolate.org/install

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

Write-Host Install Node JS v16.11.1

choco install nodejs --version=16.11.1 -y

Write-Host Install MongoDB v 4.4.4

choco install mongodb --version=4.4.4 -y

Write-Host Install GIT

choco install git -y

Write-Host Refresh Environment

refreshenv

Write-Host Create directory

mkdir C:\Hombrewery
cd C:\Hombrewery

Write-Host Download Homebrewery project files

git clone https://github.com/naturalcrit/homebrewery.git

Write-Host Install Homebrewery files

cd homebrewery

npm install
npm audit fix

Write-Host Set install type to 'local'

[System.Environment]::SetEnvironmentVariable('NODE_ENV', 'local')

Write-Host Start Homebrewery

npm start