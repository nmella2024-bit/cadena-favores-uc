# Script para rotar credenciales de Firebase y Google Cloud
# IMPORTANTE: Ejecutar desde PowerShell en la raiz del proyecto

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ROTACION DE CREDENCIALES - Red UC" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el proyecto correcto
$PROJECT_ID = "red-uc-eeuu"

Write-Host "1. Verificando proyecto de Google Cloud..." -ForegroundColor Yellow
try {
    $CURRENT_PROJECT = (gcloud config get-value project 2>$null)
} catch {
    $CURRENT_PROJECT = ""
}

if ($CURRENT_PROJECT -ne $PROJECT_ID) {
    Write-Host "Error: Proyecto incorrecto. Actual: $CURRENT_PROJECT" -ForegroundColor Red
    Write-Host "Configurando proyecto correcto..."
    gcloud config set project $PROJECT_ID
}

Write-Host "Proyecto: $PROJECT_ID" -ForegroundColor Green
Write-Host ""

# ============================================
# Paso 1: Service Account
# ============================================
Write-Host "2. Rotando Service Account..." -ForegroundColor Yellow
Write-Host ""

$OLD_SA_EMAIL = "bot-subida-drive@coherent-flame-475215-f0.iam.gserviceaccount.com"
$NEW_SA_NAME = "red-uc-backend-secure"
$DATE = Get-Date -Format "yyyy-MM-dd"
$NEW_SA_DISPLAY_NAME = "Red UC Backend Secure ($DATE)"
$NEW_SA_EMAIL = "$NEW_SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Listar service accounts actuales
Write-Host "Service Accounts actuales:" -ForegroundColor Cyan
gcloud iam service-accounts list --project=$PROJECT_ID

Write-Host ""
$createNew = Read-Host "Deseas crear una NUEVA service account? (y/n)"

if ($createNew -eq "y" -or $createNew -eq "Y") {
    # Crear nueva service account
    Write-Host "Creando nueva service account..." -ForegroundColor Cyan
    gcloud iam service-accounts create $NEW_SA_NAME --display-name="$NEW_SA_DISPLAY_NAME" --description="Service account para backend de Red UC con permisos limitados" --project=$PROJECT_ID

    Write-Host "Service account creada: $NEW_SA_EMAIL" -ForegroundColor Green
    Write-Host ""

    # Asignar SOLO los permisos necesarios
    Write-Host "Asignando permisos minimos necesarios..." -ForegroundColor Cyan

    # Firestore: acceso de lectura/escritura
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$NEW_SA_EMAIL" --role="roles/datastore.user"

    # Firebase Admin SDK
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$NEW_SA_EMAIL" --role="roles/firebase.sdkAdminServiceAgent"

    Write-Host "Permisos asignados" -ForegroundColor Green
    Write-Host ""

    # Generar clave JSON
    Write-Host "Generando clave JSON..." -ForegroundColor Cyan
    $DATEKEY = Get-Date -Format "yyyyMMdd"
    $KEY_FILE = "serviceAccountKey-new-$DATEKEY.json"

    gcloud iam service-accounts keys create $KEY_FILE --iam-account=$NEW_SA_EMAIL --project=$PROJECT_ID

    Write-Host "Clave generada: $KEY_FILE" -ForegroundColor Green
    Write-Host "IMPORTANTE: Guarda esta clave en un lugar seguro" -ForegroundColor Yellow
    Write-Host ""

    # Instrucciones para Vercel
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  ACTUALIZAR EN VERCEL" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "1. Ve a: https://vercel.com/tu-equipo/tu-proyecto/settings/environment-variables"
    Write-Host "2. Edita la variable: FIREBASE_SERVICE_ACCOUNT"
    Write-Host "3. Pega el contenido de: $KEY_FILE"
    Write-Host "4. Guarda y redeploya"
    Write-Host ""
    Write-Host "Contenido del archivo (copiar completo):" -ForegroundColor Cyan
    Write-Host "----------------------------------------"
    Get-Content $KEY_FILE
    Write-Host "----------------------------------------"
    Write-Host ""

    # Instrucciones para Google Drive
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  COMPARTIR CARPETAS DE GOOGLE DRIVE" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "Comparte las carpetas de Drive con:"
    Write-Host "$NEW_SA_EMAIL" -ForegroundColor Green
    Write-Host "Permiso: Editor (solo en carpetas especificas de materiales)"
    Write-Host ""

    Read-Host "Presiona Enter cuando hayas actualizado Vercel y compartido carpetas"

    # Eliminar service account antigua (OPCIONAL)
    Write-Host ""
    $deleteOld = Read-Host "Deseas ELIMINAR la service account antigua? (y/n)"

    if ($deleteOld -eq "y" -or $deleteOld -eq "Y") {
        Write-Host "Eliminando service account antigua..." -ForegroundColor Cyan
        try {
            gcloud iam service-accounts delete $OLD_SA_EMAIL --project=$PROJECT_ID --quiet
            Write-Host "Service account antigua eliminada" -ForegroundColor Green
        } catch {
            Write-Host "Service account ya eliminada o no existe" -ForegroundColor Yellow
        }
    }
}

# ============================================
# Paso 2: Firebase Web Config (API Keys)
# ============================================
Write-Host ""
Write-Host "3. Firebase Web Config (API Keys)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Para rotar las API keys de Firebase:"
Write-Host "1. Ve a: https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
Write-Host "2. En 'Your apps', elimina la app web actual"
Write-Host "3. Crea una nueva app web"
Write-Host "4. Copia las nuevas credenciales"
Write-Host ""

$rotateFirebase = Read-Host "Has creado una nueva app web en Firebase? (y/n)"

if ($rotateFirebase -eq "y" -or $rotateFirebase -eq "Y") {
    Write-Host "Ingresa las NUEVAS credenciales:" -ForegroundColor Cyan
    Write-Host ""
    $API_KEY = Read-Host "VITE_FIREBASE_API_KEY"
    $AUTH_DOMAIN = Read-Host "VITE_FIREBASE_AUTH_DOMAIN"
    $PROJ_ID = Read-Host "VITE_FIREBASE_PROJECT_ID"
    $STORAGE_BUCKET = Read-Host "VITE_FIREBASE_STORAGE_BUCKET"
    $SENDER_ID = Read-Host "VITE_FIREBASE_MESSAGING_SENDER_ID"
    $APP_ID = Read-Host "VITE_FIREBASE_APP_ID"
    $MEASUREMENT_ID = Read-Host "VITE_FIREBASE_MEASUREMENT_ID"

    # Crear archivo .env.new
    $envContent = "VITE_FIREBASE_API_KEY=$API_KEY`nVITE_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN`nVITE_FIREBASE_PROJECT_ID=$PROJ_ID`nVITE_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET`nVITE_FIREBASE_MESSAGING_SENDER_ID=$SENDER_ID`nVITE_FIREBASE_APP_ID=$APP_ID`nVITE_FIREBASE_MEASUREMENT_ID=$MEASUREMENT_ID`nGOOGLE_DRIVE_ROOT_FOLDER_ID=your-google-drive-root-folder-id"

    Set-Content -Path ".env.new" -Value $envContent

    Write-Host "Credenciales guardadas en .env.new" -ForegroundColor Green
    Write-Host ""
    Write-Host "Actualiza estas variables en Vercel:"
    Write-Host "https://vercel.com/tu-equipo/tu-proyecto/settings/environment-variables"
    Write-Host ""
}

# ============================================
# Paso 3: Verificacion final
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION FINAL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checklist de seguridad:"
Write-Host "[ ] Service account antigua eliminada o deshabilitada"
Write-Host "[ ] Nueva service account con permisos minimos"
Write-Host "[ ] Clave JSON actualizada en Vercel (FIREBASE_SERVICE_ACCOUNT)"
Write-Host "[ ] Carpetas de Drive compartidas con nueva SA"
Write-Host "[ ] App web antigua de Firebase eliminada"
Write-Host "[ ] Nuevas credenciales actualizadas en Vercel (VITE_FIREBASE_*)"
Write-Host "[ ] Proyecto redeployado en Vercel"
Write-Host "[ ] Prueba de funcionamiento realizada"
Write-Host ""
Write-Host "NO olvides probar la aplicacion despues de actualizar" -ForegroundColor Yellow
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ROTACION COMPLETADA" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
