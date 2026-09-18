@echo off
echo ======================================================
echo  CV Generator - Demarrage de l'API Flask (cv_ranking)
echo ======================================================
echo.

REM Verifier si Python est installe
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Python 3.7+ depuis https://python.org
    pause
    exit /b 1
)

REM Aller a la racine du projet (le dossier parent de rh/)
cd /d "%~dp0.."

REM Creer l'environnement virtuel si inexistant
if not exist "cv_ranking\venv\" (
    echo Creation de l'environnement virtuel dans cv_ranking\venv ...
    python -m venv cv_ranking\venv
)

REM Activer l'environnement virtuel
call cv_ranking\venv\Scripts\activate.bat

REM Installer les dependances
echo Installation des dependances depuis cv_ranking\requirements.txt ...
pip install -r cv_ranking\requirements.txt --quiet

REM Demarrer l'API
echo.
echo Demarrage de l'API sur http://localhost:5000
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python cv_ranking\cv_api.py

pause
