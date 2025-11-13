#!/bin/bash

# Script para rotar credenciales de Firebase y Google Cloud
# IMPORTANTE: Ejecutar desde la raíz del proyecto

set -e

echo "============================================"
echo "  ROTACIÓN DE CREDENCIALES - Red UC"
echo "============================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el proyecto correcto
PROJECT_ID="red-uc-eeuu"

echo -e "${YELLOW}1. Verificando proyecto de Google Cloud...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")

if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
  echo -e "${RED}Error: Proyecto incorrecto. Actual: $CURRENT_PROJECT${NC}"
  echo "Configurando proyecto correcto..."
  gcloud config set project $PROJECT_ID
fi

echo -e "${GREEN}✓ Proyecto: $PROJECT_ID${NC}"
echo ""

# ============================================
# Paso 1: Service Account
# ============================================
echo -e "${YELLOW}2. Rotando Service Account...${NC}"

OLD_SA_EMAIL="bot-subida-drive@coherent-flame-475215-f0.iam.gserviceaccount.com"
NEW_SA_NAME="red-uc-backend-secure"
NEW_SA_DISPLAY_NAME="Red UC Backend Secure ($(date +%Y-%m-%d))"
NEW_SA_EMAIL="${NEW_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Listar service accounts actuales
echo "Service Accounts actuales:"
gcloud iam service-accounts list --project=$PROJECT_ID

echo ""
read -p "¿Deseas crear una NUEVA service account? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Crear nueva service account
  echo "Creando nueva service account..."
  gcloud iam service-accounts create $NEW_SA_NAME \
    --display-name="$NEW_SA_DISPLAY_NAME" \
    --description="Service account para backend de Red UC con permisos limitados" \
    --project=$PROJECT_ID

  echo -e "${GREEN}✓ Service account creada: $NEW_SA_EMAIL${NC}"

  # Asignar SOLO los permisos necesarios
  echo "Asignando permisos mínimos necesarios..."

  # Firestore: acceso de lectura/escritura
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$NEW_SA_EMAIL" \
    --role="roles/datastore.user"

  # Firebase Admin SDK
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$NEW_SA_EMAIL" \
    --role="roles/firebase.sdkAdminServiceAgent"

  # Google Drive: se configura directamente compartiendo carpetas
  # No es necesario dar permisos a nivel de proyecto

  echo -e "${GREEN}✓ Permisos asignados${NC}"

  # Generar clave JSON
  echo "Generando clave JSON..."
  KEY_FILE="serviceAccountKey-new-$(date +%Y%m%d).json"

  gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$NEW_SA_EMAIL \
    --project=$PROJECT_ID

  echo -e "${GREEN}✓ Clave generada: $KEY_FILE${NC}"
  echo -e "${YELLOW}⚠️  IMPORTANTE: Guarda esta clave en un lugar seguro${NC}"
  echo ""

  # Instrucciones para Vercel
  echo "============================================"
  echo "  ACTUALIZAR EN VERCEL"
  echo "============================================"
  echo "1. Ve a: https://vercel.com/tu-equipo/tu-proyecto/settings/environment-variables"
  echo "2. Edita la variable: FIREBASE_SERVICE_ACCOUNT"
  echo "3. Pega el contenido de: $KEY_FILE"
  echo "4. Guarda y redeploya"
  echo ""
  echo "Contenido del archivo (copiar completo):"
  echo "----------------------------------------"
  cat $KEY_FILE
  echo "----------------------------------------"
  echo ""

  # Instrucciones para Google Drive
  echo "============================================"
  echo "  COMPARTIR CARPETAS DE GOOGLE DRIVE"
  echo "============================================"
  echo "Comparte las carpetas de Drive con:"
  echo -e "${GREEN}$NEW_SA_EMAIL${NC}"
  echo "Permiso: Editor (solo en carpetas específicas de materiales)"
  echo ""

  read -p "Presiona Enter cuando hayas actualizado Vercel y compartido carpetas..."

  # Eliminar service account antigua (OPCIONAL)
  echo ""
  read -p "¿Deseas ELIMINAR la service account antigua? (y/n): " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Eliminando service account antigua..."
    gcloud iam service-accounts delete $OLD_SA_EMAIL \
      --project=$PROJECT_ID \
      --quiet || echo "Service account ya eliminada o no existe"

    echo -e "${GREEN}✓ Service account antigua eliminada${NC}"
  fi
fi

# ============================================
# Paso 2: Firebase Web Config (API Keys)
# ============================================
echo ""
echo -e "${YELLOW}3. Firebase Web Config (API Keys)...${NC}"
echo ""
echo "Para rotar las API keys de Firebase:"
echo "1. Ve a: https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
echo "2. En 'Your apps', elimina la app web actual"
echo "3. Crea una nueva app web"
echo "4. Copia las nuevas credenciales"
echo ""

read -p "¿Has creado una nueva app web en Firebase? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Ingresa las NUEVAS credenciales:"
  echo ""
  read -p "VITE_FIREBASE_API_KEY: " API_KEY
  read -p "VITE_FIREBASE_AUTH_DOMAIN: " AUTH_DOMAIN
  read -p "VITE_FIREBASE_PROJECT_ID: " PROJ_ID
  read -p "VITE_FIREBASE_STORAGE_BUCKET: " STORAGE_BUCKET
  read -p "VITE_FIREBASE_MESSAGING_SENDER_ID: " SENDER_ID
  read -p "VITE_FIREBASE_APP_ID: " APP_ID
  read -p "VITE_FIREBASE_MEASUREMENT_ID: " MEASUREMENT_ID

  # Crear archivo .env.new
  cat > .env.new << EOF
VITE_FIREBASE_API_KEY=$API_KEY
VITE_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=$PROJ_ID
VITE_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=$SENDER_ID
VITE_FIREBASE_APP_ID=$APP_ID
VITE_FIREBASE_MEASUREMENT_ID=$MEASUREMENT_ID
GOOGLE_DRIVE_ROOT_FOLDER_ID=your-google-drive-root-folder-id
EOF

  echo -e "${GREEN}✓ Credenciales guardadas en .env.new${NC}"
  echo ""
  echo "Actualiza estas variables en Vercel:"
  echo "https://vercel.com/tu-equipo/tu-proyecto/settings/environment-variables"
  echo ""
fi

# ============================================
# Paso 3: Verificación final
# ============================================
echo ""
echo "============================================"
echo "  VERIFICACIÓN FINAL"
echo "============================================"
echo ""
echo "Checklist de seguridad:"
echo "[ ] Service account antigua eliminada o deshabilitada"
echo "[ ] Nueva service account con permisos mínimos"
echo "[ ] Clave JSON actualizada en Vercel (FIREBASE_SERVICE_ACCOUNT)"
echo "[ ] Carpetas de Drive compartidas con nueva SA"
echo "[ ] App web antigua de Firebase eliminada"
echo "[ ] Nuevas credenciales actualizadas en Vercel (VITE_FIREBASE_*)"
echo "[ ] Proyecto redeployado en Vercel"
echo "[ ] Prueba de funcionamiento realizada"
echo ""
echo -e "${YELLOW}⚠️  NO olvides probar la aplicación después de actualizar${NC}"
echo ""

echo "============================================"
echo "  ROTACIÓN COMPLETADA"
echo "============================================"
