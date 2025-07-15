@echo off
echo Demarrage du serveur API Flask pour CV Generator - RH
echo.

REM Verifier si Python est installe
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Python 3.7+ depuis https://python.org
    pause
    exit /b 1
)

REM Installer les dependances si necessaire
if not exist "venv\" (
    echo Creation de l'environnement virtuel...
    python -m venv venv
)

REM Activer l'environnement virtuel
call venv\Scripts\activate.bat

REM Installer les dependances
echo Installation des dependances...
pip install -r requirements.txt

REM Importer la base de donnees
echo Importation de la base de donnees...
mysql -u root -p cv_craft < db.sql

REM Demarrer l'API
echo.
echo Demarrage de l'API sur http://localhost:5000
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python api.py

pause
