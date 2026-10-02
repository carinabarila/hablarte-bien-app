@echo off
cd /d "%~dp0"
echo Cerrando procesos en puerto 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul
timeout /t 2 /nobreak >nul
echo Iniciando Hablate Bien en http://localhost:3000 ...
call npm run dev
echo.
echo === La app se detuvo ===
pause
