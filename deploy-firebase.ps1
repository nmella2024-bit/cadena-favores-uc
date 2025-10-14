# Script PowerShell para desplegar reglas e indices de Firestore a Firebase

Write-Host "Desplegando configuracion de Firebase..." -ForegroundColor Cyan

# Verificar si Firebase CLI esta instalado
$firebaseCmd = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseCmd) {
    Write-Host "Firebase CLI no esta instalado." -ForegroundColor Red
    Write-Host "Instalalo con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Login en Firebase (si no esta autenticado)
Write-Host "Verificando autenticacion..." -ForegroundColor Yellow
firebase login

# Desplegar reglas de seguridad de Firestore
Write-Host "Desplegando reglas de seguridad..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

# Desplegar indices de Firestore
Write-Host "Desplegando indices..." -ForegroundColor Yellow
firebase deploy --only firestore:indexes

Write-Host "Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host "Revisa tu consola de Firebase: https://console.firebase.google.com" -ForegroundColor Cyan
