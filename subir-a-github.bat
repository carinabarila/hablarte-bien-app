@echo off
title Hablate Bien - Subir a GitHub
color 0A

echo.
echo ============================================
echo   HABLATE BIEN - Subir a GitHub
echo ============================================
echo.

cd /d "%~dp0"

REM Verificar git
git --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git no esta instalado.
    echo Descargalo en: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [OK] Git encontrado.
echo.

REM Inicializar repo si no existe
if not exist ".git" (
    echo Inicializando repositorio git...
    git init
    git branch -M main
)

REM Agregar todos los archivos
echo Agregando archivos...
git add .

REM Crear commit
git commit -m "primer deploy - app hablate bien completa" 2>nul || (
    git commit -m "deploy: actualizacion app hablate bien"
)

echo.
echo ============================================
echo   Ahora necesitas el link de tu repo GitHub
echo ============================================
echo.
echo 1. Abre github.com en el navegador
echo 2. Crea un nuevo repositorio llamado: hablate-bien-app
echo 3. NO inicialices con README ni .gitignore
echo 4. Copia la URL que te da (ej: https://github.com/TuUsuario/hablate-bien-app.git)
echo.

set REPO_URL=https://github.com/carinabarila/hablarte-bien-app.git
echo URL del repo: %REPO_URL%

REM Configurar remote y pushear
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Subiendo codigo a GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   EXITO! Codigo subido a GitHub
    echo ============================================
    echo.
    echo Ahora ve a vercel.com para hacer el deploy.
    echo Acordate de agregar las 3 variables de entorno:
    echo   NEXT_PUBLIC_SUPABASE_URL
    echo   NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo   ANTHROPIC_API_KEY
    echo.
) else (
    echo.
    echo [ERROR] No se pudo hacer push.
    echo Es posible que necesites autenticarte en GitHub.
    echo Intenta: git push -u origin main (manualmente en PowerShell)
    echo.
)

pause
