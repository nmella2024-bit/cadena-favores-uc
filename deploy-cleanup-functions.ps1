# Script para desplegar Cloud Functions de limpieza automática
# Uso: .\deploy-cleanup-functions.ps1

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   Deployment de Cleanup Functions    " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en el directorio correcto
if (-Not (Test-Path "functions/src/index.ts")) {
    Write-Host "Error: Este script debe ejecutarse desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "1. Compilando funciones TypeScript..." -ForegroundColor Yellow
cd functions
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en la compilación" -ForegroundColor Red
    cd ..
    exit 1
}

Write-Host "✓ Compilación exitosa" -ForegroundColor Green
Write-Host ""

Write-Host "2. Desplegando funciones a Firebase..." -ForegroundColor Yellow
firebase deploy --only functions

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en el deployment" -ForegroundColor Red
    cd ..
    exit 1
}

cd ..

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "   ✓ Deployment completado exitoso    " -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Funciones desplegadas:" -ForegroundColor Cyan
Write-Host "  - eliminarContenidoExpirado (cada 1 hora)" -ForegroundColor White
Write-Host "  - limpiarFavoresFinalizados (diario a las 2 AM)" -ForegroundColor White
Write-Host ""
Write-Host "Para ver los logs:" -ForegroundColor Yellow
Write-Host "  firebase functions:log" -ForegroundColor White
Write-Host ""
Write-Host "Para ver logs de una función específica:" -ForegroundColor Yellow
Write-Host "  firebase functions:log --only limpiarFavoresFinalizados" -ForegroundColor White
Write-Host ""
