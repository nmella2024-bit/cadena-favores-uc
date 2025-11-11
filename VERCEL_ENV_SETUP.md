# Configuración de Variables de Entorno en Vercel

## Variables Requeridas

Para que la aplicación funcione correctamente en Vercel, debes configurar las siguientes variables de entorno:

### Variables de Firebase (OBLIGATORIAS)

```
VITE_FIREBASE_API_KEY=AIzaSyD4ZjQw7PQ1fPSA2P9axFobTPkZmBAnKss
VITE_FIREBASE_AUTH_DOMAIN=red-uc-eeuu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=red-uc-eeuu
VITE_FIREBASE_STORAGE_BUCKET=red-uc-eeuu.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=705871614487
VITE_FIREBASE_APP_ID=1:705871614487:web:aab5ec45d47db1f7d44252
VITE_FIREBASE_MEASUREMENT_ID=G-8RV5170JWM
```

## Pasos para Configurar en Vercel

1. Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Para cada variable:
   - **Key**: Nombre de la variable (por ejemplo: `VITE_FIREBASE_API_KEY`)
   - **Value**: Valor de la variable
   - **Environment**: Selecciona **Production**, **Preview**, y **Development** (todas)
5. Haz clic en **Save**
6. Una vez agregadas todas las variables, haz un nuevo deploy:
   - Ve a la pestaña **Deployments**
   - Haz clic en los tres puntos del último deployment
   - Selecciona **Redeploy**

## Verificación

Después de configurar las variables y hacer redeploy:

1. Abre tu sitio en Vercel
2. Abre la consola del navegador (F12)
3. Busca el mensaje: `✅ Firebase inicializado correctamente`
4. Si ves errores, revisa que todas las variables estén configuradas correctamente

## Notas Importantes

- **IMPORTANTE**: Las variables de Vite deben tener el prefijo `VITE_` para ser accesibles en el cliente
- Las variables se compilan en tiempo de build, por lo que necesitas hacer redeploy después de cambiarlas
- **NUNCA** incluyas las service account keys en las variables de entorno del frontend
- Estas credenciales son seguras para usar en el frontend (son públicas por diseño de Firebase)

## Troubleshooting

### La página queda en blanco
- Verifica que todas las variables estén configuradas
- Abre la consola del navegador para ver errores específicos
- Haz un redeploy forzado

### Error "Missing or insufficient permissions"
- Verifica que las reglas de Firestore estén desplegadas
- Ejecuta: `firebase deploy --only firestore:rules`

### Los cambios no se reflejan
- Las variables de entorno requieren un nuevo deployment
- Haz clic en "Redeploy" en el último deployment en Vercel
