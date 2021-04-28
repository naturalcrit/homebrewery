@ECHO OFF

ECHO This process requires that the following items are already installed:
ECHO - node
ECHO - npm
ECHO - MongoDB
ECHO.
ECHO =====================================================================
ECHO.

ECHO ACTION: Set current working directory
cd %~dp0/..
ECHO.

ECHO ACTION: Set environment variables
SETX HOMEBREWERY_DIR %cd%
SETX NODE_ENV local
ECHO.

ECHO ACTION: NPM Installation
CALL npm clean-install --no-audit
ECHO.

ECHO ACTION: NPM Vulnerabilty Check
CALL npm audit fix
ECHO.

ECHO ACTION: NPM Post-Install
CALL npm run postinstall
ECHO.

ECHO =====================================================================
ECHO.
ECHO Process complete.
ECHO Error Level: %ERRORLEVEL%

PAUSE