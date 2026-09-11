@echo off
setlocal
cd /d "%~dp0"
echo Instalando dependencias de Quiz Detective...
call pnpm install
if errorlevel 1 (
  echo No se pudo instalar. Comprueba que Node.js y pnpm esten disponibles.
  pause
  exit /b 1
)
call pnpm run build
echo Instalacion terminada. Ya puedes usar INICIAR_JUEGO.bat
pause
endlocal
