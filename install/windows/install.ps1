Write-Host Homebrewery Install -BackgroundColor Black -ForegroundColor Yellow
Write-Host =================== -BackgroundColor Black -ForegroundColor Yellow
Write-Host Install Chocolatey -BackgroundColor Black -ForegroundColor Yellow
Write-Host Instructions from https://chocolate.org/install -BackgroundColor Black -ForegroundColor Yellow

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

Write-Host Install Node JS v16.11.1 -BackgroundColor Black -ForegroundColor Yellow

choco install nodejs --version=16.11.1 -y

Write-Host Install MongoDB v 4.4.4 -BackgroundColor Black -ForegroundColor Yellow

choco install mongodb --version=4.4.4 -y

Write-Host Install GIT -BackgroundColor Black -ForegroundColor Yellow

choco install git -y

Write-Host Refresh Environment -BackgroundColor Black -ForegroundColor Yellow

Import-Module "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
Update-SessionEnvironment

Write-Host Create Homebrewery directory - C:\Homebrewery -BackgroundColor Black -ForegroundColor Yellow

mkdir C:\Hombrewery
cd C:\Hombrewery

Write-Host Download Homebrewery project files -BackgroundColor Black -ForegroundColor Yellow

git clone https://github.com/naturalcrit/homebrewery.git

Write-Host Install Homebrewery files -BackgroundColor Black -ForegroundColor Yellow

cd homebrewery

npm install
npm audit fix

Write-Host Set install type to 'local' -BackgroundColor Black -ForegroundColor Yellow

[System.Environment]::SetEnvironmentVariable('NODE_ENV', 'local')

Write-Host INSTALL COMPLETE -BackgroundColor Black -ForegroundColor Yellow
Write-Host To start Homebrewery in the future, open a terminal in the Homebrewery directory and run npm start -BackgroundColor Black -ForegroundColor Yellow
Write-Host ================================================================================================== -BackgroundColor Black -ForegroundColor Yellow

Write-Host Start Homebrewery -BackgroundColor Black -ForegroundColor Yellow

npm start