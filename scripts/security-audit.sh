#!/bin/bash

# Script de auditoría de seguridad para Red UC
# Ejecutar periódicamente para verificar configuración de seguridad

set -e

echo "============================================"
echo "  AUDITORÍA DE SEGURIDAD - Red UC"
echo "============================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ISSUES_FOUND=0

# ============================================
# 1. Verificar archivos sensibles en .gitignore
# ============================================
echo -e "${YELLOW}1. Verificando .gitignore...${NC}"

SENSITIVE_FILES=(
  "serviceAccountKey.json"
  "*.json"
  ".env"
  ".env.local"
  "*.key"
  "*.pem"
)

for file in "${SENSITIVE_FILES[@]}"; do
  if grep -q "$file" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $file está en .gitignore"
  else
    echo -e "${RED}✗${NC} $file NO está en .gitignore"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

echo ""

# ============================================
# 2. Buscar secretos en el código
# ============================================
echo -e "${YELLOW}2. Buscando secretos hardcodeados...${NC}"

# Patrones peligrosos
PATTERNS=(
  "apiKey.*=.*['\"][A-Za-z0-9]{20,}['\"]"
  "password.*=.*['\"].+['\"]"
  "secret.*=.*['\"].+['\"]"
  "private.*key.*=.*['\"].+['\"]"
  "BEGIN.*PRIVATE.*KEY"
)

FOUND_SECRETS=0

for pattern in "${PATTERNS[@]}"; do
  MATCHES=$(grep -rn -E "$pattern" src/ api/ 2>/dev/null | grep -v ".test." | grep -v "import.meta.env" || echo "")

  if [ -n "$MATCHES" ]; then
    echo -e "${RED}✗ Posibles secretos encontrados:${NC}"
    echo "$MATCHES"
    FOUND_SECRETS=$((FOUND_SECRETS + 1))
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

if [ $FOUND_SECRETS -eq 0 ]; then
  echo -e "${GREEN}✓${NC} No se encontraron secretos hardcodeados"
fi

echo ""

# ============================================
# 3. Verificar dependencias vulnerables
# ============================================
echo -e "${YELLOW}3. Verificando dependencias vulnerables...${NC}"

if npm audit --audit-level=high 2>&1 | grep -q "found 0 vulnerabilities"; then
  echo -e "${GREEN}✓${NC} No se encontraron vulnerabilidades de alta prioridad"
else
  echo -e "${RED}✗${NC} Se encontraron vulnerabilidades. Ejecuta: npm audit"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ============================================
# 4. Verificar configuración de CORS
# ============================================
echo -e "${YELLOW}4. Verificando configuración de CORS...${NC}"

if [ -f "vercel.json" ]; then
  if grep -q "Access-Control-Allow-Origin" vercel.json; then
    ORIGIN=$(grep -A1 "Access-Control-Allow-Origin" vercel.json | grep "value" | head -1)

    if echo "$ORIGIN" | grep -q "\*"; then
      echo -e "${RED}✗${NC} CORS permite todos los orígenes (*) - INSEGURO"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
      echo -e "${GREEN}✓${NC} CORS configurado restrictivamente"
      echo "   $ORIGIN"
    fi
  else
    echo -e "${YELLOW}⚠${NC}  CORS no configurado en vercel.json"
  fi
else
  echo -e "${RED}✗${NC} vercel.json no encontrado"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ============================================
# 5. Verificar autenticación en endpoints API
# ============================================
echo -e "${YELLOW}5. Verificando autenticación en endpoints API...${NC}"

if [ -d "api" ]; then
  API_FILES=$(find api -name "*.js" ! -name "_middleware.js")

  for file in $API_FILES; do
    if grep -q "verifyAuth\|verifyRole" "$file"; then
      echo -e "${GREEN}✓${NC} $file tiene autenticación"
    else
      echo -e "${RED}✗${NC} $file NO tiene autenticación - VULNERABLE"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
  done
else
  echo -e "${YELLOW}⚠${NC}  No se encontró carpeta /api"
fi

echo ""

# ============================================
# 6. Verificar Firestore Rules
# ============================================
echo -e "${YELLOW}6. Verificando Firestore Rules...${NC}"

if [ -f "firestore.rules" ]; then
  # Verificar que no hay "allow read, write: if true"
  if grep -q "allow read, write: if true" firestore.rules; then
    echo -e "${RED}✗${NC} Firestore rules permiten acceso completo sin autenticación"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    echo -e "${GREEN}✓${NC} Firestore rules parecen restrictivas"
  fi

  # Verificar autenticación
  if grep -q "request.auth != null" firestore.rules; then
    echo -e "${GREEN}✓${NC} Firestore rules requieren autenticación"
  else
    echo -e "${YELLOW}⚠${NC}  Firestore rules podrían no requerir autenticación"
  fi
else
  echo -e "${RED}✗${NC} firestore.rules no encontrado"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ============================================
# 7. Verificar headers de seguridad
# ============================================
echo -e "${YELLOW}7. Verificando headers de seguridad...${NC}"

REQUIRED_HEADERS=(
  "X-Content-Type-Options"
  "X-Frame-Options"
  "X-XSS-Protection"
  "Strict-Transport-Security"
)

for header in "${REQUIRED_HEADERS[@]}"; do
  if grep -q "$header" vercel.json 2>/dev/null || grep -q "$header" firebase.json 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $header configurado"
  else
    echo -e "${YELLOW}⚠${NC}  $header no encontrado"
  fi
done

echo ""

# ============================================
# 8. Verificar archivos sensibles no comiteados
# ============================================
echo -e "${YELLOW}8. Verificando archivos sensibles en el repositorio...${NC}"

SENSITIVE_IN_REPO=$(git ls-files | grep -E "\.env$|serviceAccount.*\.json$|.*key.*\.json$|.*secret.*" || echo "")

if [ -n "$SENSITIVE_IN_REPO" ]; then
  echo -e "${RED}✗${NC} Archivos sensibles encontrados en el repositorio:"
  echo "$SENSITIVE_IN_REPO"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  echo ""
  echo "Ejecuta: git rm --cached <archivo> para eliminarlos"
else
  echo -e "${GREEN}✓${NC} No se encontraron archivos sensibles en el repositorio"
fi

echo ""

# ============================================
# 9. Verificar rate limiting
# ============================================
echo -e "${YELLOW}9. Verificando rate limiting...${NC}"

if grep -rq "ratelimit\|simpleRateLimit" api/ 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Rate limiting implementado"
else
  echo -e "${RED}✗${NC} Rate limiting NO implementado - VULNERABLE a DoS"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ============================================
# 10. Verificar logs sensibles
# ============================================
echo -e "${YELLOW}10. Verificando logs con información sensible...${NC}"

DANGEROUS_LOGS=$(grep -rn "console.log.*password\|console.log.*token\|console.log.*secret" src/ api/ 2>/dev/null || echo "")

if [ -n "$DANGEROUS_LOGS" ]; then
  echo -e "${RED}✗${NC} Logs con información sensible encontrados:"
  echo "$DANGEROUS_LOGS"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo -e "${GREEN}✓${NC} No se encontraron logs con información sensible"
fi

echo ""

# ============================================
# RESUMEN
# ============================================
echo "============================================"
echo "  RESUMEN DE AUDITORÍA"
echo "============================================"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✓ No se encontraron problemas críticos de seguridad${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Se encontraron $ISSUES_FOUND problemas de seguridad${NC}"
  echo ""
  echo "Revisa los problemas anteriores y corrige antes de deployar"
  echo ""
  exit 1
fi
