#!/bin/bash

# Script para configurar Service Account con permisos mínimos necesarios
# Implementa el principio de menor privilegio

set -e

echo "============================================"
echo "  CONFIGURACIÓN DE PERMISOS MÍNIMOS"
echo "  Service Account - Red UC"
echo "============================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ID="red-uc-eeuu"

# Verificar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI no está instalado${NC}"
  echo "Instala desde: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Configurar proyecto
echo -e "${YELLOW}Configurando proyecto: $PROJECT_ID${NC}"
gcloud config set project $PROJECT_ID

# Listar service accounts existentes
echo ""
echo "Service Accounts actuales:"
gcloud iam service-accounts list

echo ""
read -p "Ingresa el email de la service account (ejemplo: red-uc-backend@...): " SA_EMAIL

if [ -z "$SA_EMAIL" ]; then
  echo -e "${RED}Error: Debes ingresar un email de service account${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Configurando permisos mínimos para: $SA_EMAIL${NC}"
echo ""

# ============================================
# PASO 1: Eliminar roles amplios si existen
# ============================================
echo "============================================"
echo "1. Eliminando roles amplios (si existen)..."
echo "============================================"

BROAD_ROLES=(
  "roles/owner"
  "roles/editor"
  "roles/viewer"
  "roles/admin"
)

for role in "${BROAD_ROLES[@]}"; do
  echo "Intentando eliminar: $role"
  gcloud projects remove-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$role" \
    --quiet 2>/dev/null || echo "  (no tenía este rol)"
done

echo -e "${GREEN}✓ Roles amplios eliminados${NC}"
echo ""

# ============================================
# PASO 2: Agregar SOLO roles necesarios
# ============================================
echo "============================================"
echo "2. Agregando permisos mínimos necesarios..."
echo "============================================"

# Firestore - Lectura y escritura de documentos
echo "- Firestore: roles/datastore.user"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/datastore.user" \
  --condition=None

# Firebase Admin SDK
echo "- Firebase Admin: roles/firebase.sdkAdminServiceAgent"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/firebase.sdkAdminServiceAgent" \
  --condition=None

echo -e "${GREEN}✓ Permisos mínimos configurados${NC}"
echo ""

# ============================================
# PASO 3: Verificar permisos actuales
# ============================================
echo "============================================"
echo "3. Verificando permisos actuales..."
echo "============================================"

gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SA_EMAIL" \
  --format="table(bindings.role)"

echo ""

# ============================================
# PASO 4: Configurar Google Drive
# ============================================
echo "============================================"
echo "4. Google Drive - Permisos por carpeta"
echo "============================================"
echo ""
echo "IMPORTANTE: Para Google Drive, NO asignes permisos a nivel de proyecto."
echo "En su lugar, comparte SOLO las carpetas específicas necesarias:"
echo ""
echo "1. Abre Google Drive"
echo "2. Localiza las carpetas de materiales educativos"
echo "3. Para cada carpeta:"
echo "   - Click derecho > Compartir"
echo "   - Agregar: $SA_EMAIL"
echo "   - Rol: Editor"
echo "   - Desmarcar 'Notificar personas'"
echo ""
read -p "Presiona Enter cuando hayas compartido las carpetas..."

# ============================================
# PASO 5: Crear custom role (opcional, más restrictivo)
# ============================================
echo ""
echo "============================================"
echo "5. (OPCIONAL) Crear rol custom más restrictivo"
echo "============================================"
echo ""
read -p "¿Deseas crear un rol custom con permisos aún más específicos? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  CUSTOM_ROLE_ID="redUcBackendMinimal"
  CUSTOM_ROLE_TITLE="Red UC Backend Minimal Permissions"

  # Definir permisos específicos
  cat > /tmp/role-permissions.yaml << EOF
title: "$CUSTOM_ROLE_TITLE"
description: "Permisos mínimos para backend de Red UC"
stage: "GA"
includedPermissions:
- firestore.documents.create
- firestore.documents.delete
- firestore.documents.get
- firestore.documents.list
- firestore.documents.update
- firebase.projects.get
EOF

  echo "Creando rol custom..."
  gcloud iam roles create $CUSTOM_ROLE_ID \
    --project=$PROJECT_ID \
    --file=/tmp/role-permissions.yaml || echo "Rol ya existe, actualizando..."

  # Asignar rol custom
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="projects/$PROJECT_ID/roles/$CUSTOM_ROLE_ID"

  # Eliminar roles predeterminados
  gcloud projects remove-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/datastore.user" \
    --quiet

  echo -e "${GREEN}✓ Rol custom creado y asignado${NC}"
  rm /tmp/role-permissions.yaml
fi

# ============================================
# PASO 6: Auditoría final
# ============================================
echo ""
echo "============================================"
echo "6. Auditoría Final"
echo "============================================"
echo ""

echo "Roles asignados a $SA_EMAIL:"
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SA_EMAIL" \
  --format="table(bindings.role)"

echo ""
echo "============================================"
echo "  RESUMEN"
echo "============================================"
echo ""
echo "✓ Service Account configurada con permisos mínimos"
echo "✓ Solo puede acceder a Firestore y Firebase Admin SDK"
echo "✓ Google Drive: permisos solo en carpetas compartidas"
echo ""
echo "Próximos pasos:"
echo "1. Regenerar clave JSON (si no lo has hecho)"
echo "2. Actualizar FIREBASE_SERVICE_ACCOUNT en Vercel"
echo "3. Probar la aplicación"
echo "4. Monitorear logs de acceso"
echo ""
