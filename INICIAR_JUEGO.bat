@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo No se encontraron dependencias. Ejecuta INSTALAR_UNA_VEZ.bat primero.
  pause
  exit /b 1
)
start "Quiz Detective" cmd /k "pnpm dev --host 127.0.0.1 --port 4173"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:4173"
endlocal
