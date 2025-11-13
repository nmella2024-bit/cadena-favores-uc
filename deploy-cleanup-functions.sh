#!/bin/bash
# Script para desplegar Cloud Functions de limpieza automática
# Uso: ./deploy-cleanup-functions.sh

echo "======================================="
echo "   Deployment de Cleanup Functions    "
echo "======================================="
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "functions/src/index.ts" ]; then
    echo "Error: Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

echo "1. Compilando funciones TypeScript..."
cd functions
npm run build

if [ $? -ne 0 ]; then
    echo "Error en la compilación"
    cd ..
    exit 1
fi

echo "✓ Compilación exitosa"
echo ""

echo "2. Desplegando funciones a Firebase..."
firebase deploy --only functions

if [ $? -ne 0 ]; then
    echo "Error en el deployment"
    cd ..
    exit 1
fi

cd ..

echo ""
echo "======================================="
echo "   ✓ Deployment completado exitoso    "
echo "======================================="
echo ""
echo "Funciones desplegadas:"
echo "  - eliminarContenidoExpirado (cada 1 hora)"
echo "  - limpiarFavoresFinalizados (diario a las 2 AM)"
echo ""
echo "Para ver los logs:"
echo "  firebase functions:log"
echo ""
echo "Para ver logs de una función específica:"
echo "  firebase functions:log --only limpiarFavoresFinalizados"
echo ""
