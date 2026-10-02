@echo off
title Instalar Git para Windows
color 0A
echo.
echo ========================================
echo   Instalando Git para Windows...
echo ========================================
echo.
echo Esto puede tardar 1-2 minutos. Por favor espera.
echo.
winget install --id Git.Git -e --source winget
echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo   Git instalado correctamente!
    echo ========================================
    echo Ahora podes correr subir-a-github.bat
) else (
    echo [ERROR] No se pudo instalar con winget.
    echo Descargalo manualmente en: https://git-scm.com/download/win
)
echo.
pause
