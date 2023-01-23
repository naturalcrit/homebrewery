Write-Host Part One Install
Write-Host ================
Write-Host Install Chocolatey
Write-Host Instructions from https://chocolate.org/install

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

Write-Host Install Node JS v16.11.1

choco install nodejs --version=16.11.1 -y

Write-Host Install MongoDB v 4.4.4

choco install mongodb --version=4.4.4 -y

Write-Host Install GIT

choco install git -y

Write-Hose Refresh Environment

Import-Module "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
Update-SessionEnvironment

Write-Host Create Homebrewery directory - C:\Homebrewery

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

Write-Host INSTALL COMPLETE
Write-Host To start Homebrewery in the future, open a terminal in the Homebrewery directory and run npm start
Write-Hose ==================================================================================================

Write-Host Start Homebrewery

npm start