#!/bin/bash

# Script para desplegar reglas e índices de Firestore a Firebase

echo "🚀 Desplegando configuración de Firebase..."

# Verificar si Firebase CLI está instalado
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI no está instalado."
    echo "📦 Instálalo con: npm install -g firebase-tools"
    exit 1
fi

# Login en Firebase (si no está autenticado)
echo "🔐 Verificando autenticación..."
firebase login

# Desplegar reglas de seguridad de Firestore
echo "📜 Desplegando reglas de seguridad..."
firebase deploy --only firestore:rules

# Desplegar índices de Firestore
echo "📊 Desplegando índices..."
firebase deploy --only firestore:indexes

echo "✅ Despliegue completado exitosamente!"
echo "🌐 Revisa tu consola de Firebase: https://console.firebase.google.com"
