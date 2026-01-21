# 🔧 Guía de Solución de Problemas - API Email Ecoquimia

## ⚠️ SÍNTOMAS COMUNES Y SOLUCIONES

### Síntoma 1: Error 404 al enviar el formulario
**Problema:** El endpoint `/api/send-email` no existe

**Solución:**
1. Verifica que el archivo esté en la ruta correcta: `src/pages/api/send-email.js`
2. Verifica tu `astro.config.mjs`:
```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel(),
});
```
3. Reinstala las dependencias:
```bash
npm install @astrojs/vercel resend
```
4. Haz un nuevo deploy en Vercel

---

### Síntoma 2: Error 500 - Internal Server Error
**Problema:** La API key no está configurada o es incorrecta

**Solución en Vercel:**
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade o verifica:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_9QEornHW...` (tu API key completa de Resend)
   - **Environment:** Marca TODAS (Production, Preview, Development)
4. **IMPORTANTE:** Después de añadir/cambiar variables de entorno, debes hacer REDEPLOY
5. Ve a Deployments → Click en los 3 puntos del último deployment → "Redeploy"

---

### Síntoma 3: Error 403/422 de Resend
**Problema:** Estás usando un dominio no verificado

**Solución:**
En `src/pages/api/send-email.js`, línea del `from:`, asegúrate de usar:
```javascript
from: 'Ecoquimia <onboarding@resend.dev>', // ✅ CORRECTO
```

NO uses:
```javascript
from: 'contacto@ecoquimia.com.do', // ❌ INCORRECTO (dominio no verificado)
```

---

### Síntoma 4: El formulario no hace nada al enviarlo
**Problema:** Hay un error en el JavaScript del formulario

**Solución:**
1. Abre el navegador en tu sitio
2. Presiona F12 para abrir Developer Tools
3. Ve a la pestaña "Console"
4. Intenta enviar el formulario
5. Anota cualquier error que aparezca en rojo
6. Envíame ese error para ayudarte mejor

---

### Síntoma 5: "resend is not defined" o similar
**Problema:** El paquete `resend` no está instalado

**Solución:**
```bash
npm install resend
npm run build
git add .
git commit -m "Add resend package"
git push
```

---

## 📋 CHECKLIST COMPLETO DE VERIFICACIÓN

### En tu computadora local:

```bash
# 1. Verifica que los paquetes estén instalados
npm list @astrojs/vercel resend

# Si no aparecen, instálalos:
npm install @astrojs/vercel resend

# 2. Verifica la estructura de archivos
# Debe existir:
# src/pages/api/send-email.js
# src/pages/cotizacion.astro
# astro.config.mjs

# 3. Haz un build local para verificar que no hay errores
npm run build

# 4. Si todo funciona, sube los cambios
git add .
git commit -m "Fix email API endpoint"
git push
```

### En Vercel:

1. **Variables de Entorno:**
   - [ ] RESEND_API_KEY está configurada
   - [ ] El valor es correcto (cópialo desde Resend)
   - [ ] Está habilitada para Production, Preview y Development
   - [ ] Hiciste REDEPLOY después de añadirla

2. **Deployment:**
   - [ ] El último deploy fue exitoso (sin errores)
   - [ ] Vercel detectó el adapter de Vercel
   - [ ] La función serverless se creó correctamente

3. **Logs en Vercel:**
   - Ve a tu proyecto → Functions → busca `/api/send-email`
   - Revisa los logs cuando intentes enviar el formulario
   - Busca errores específicos

---

## 🧪 PRUEBA PASO A PASO

### Paso 1: Probar el endpoint directamente
Abre tu navegador y ve a: `https://www.ecoquimia.com.do/api/send-email`

**Resultado esperado:** 
- Status 405 (Method Not Allowed) o un error de método
- Esto significa que el endpoint EXISTE

**Si ves 404:**
- El endpoint NO existe
- Verifica astro.config.mjs y redeploy

### Paso 2: Probar con el formulario
1. Ve a: `https://www.ecoquimia.com.do/cotizacion`
2. Llena todos los campos
3. Abre Developer Tools (F12) → pestaña "Network"
4. Envía el formulario
5. Busca la petición a `/api/send-email` en Network
6. Click en ella y ve a "Response"

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Cotización enviada correctamente"
}
```

**Si ves error:**
- Copia el mensaje de error completo
- Envíamelo para ayudarte

---

## 🔍 DEBUGGING AVANZADO

### Ver logs en Vercel:
1. Ve a tu proyecto en Vercel
2. Click en "Functions" en el menú lateral
3. Busca `/api/send-email`
4. Click en "View Logs"
5. Envía el formulario
6. Revisa los logs en tiempo real

### Ver logs en Resend:
1. Ve a [resend.com](https://resend.com)
2. Click en "Logs" en el menú lateral
3. Deberías ver los intentos de envío
4. Si hay errores, aparecerán con detalles

---

## 🚨 SI NADA FUNCIONA

### Opción 1: Usa EmailJS (alternativa temporal)
Si Resend sigue dando problemas, puedo ayudarte a configurar EmailJS que es más simple.

### Opción 2: Usa Formspree
Otra alternativa simple que funciona sin backend propio.

### Opción 3: Usa el formulario de contacto nativo de Vercel
Vercel tiene su propio sistema de formularios que podríamos usar.

---

## 📞 SIGUIENTE PASO

Por favor dime:

1. ¿Qué error específico ves? (código de error, mensaje)
2. ¿Dónde lo ves? (en el navegador, en Vercel logs, en Resend logs)
3. ¿Ya configuraste la variable RESEND_API_KEY en Vercel?
4. ¿Hiciste redeploy después de configurar la variable?

Con esta información puedo darte una solución exacta. 🎯
