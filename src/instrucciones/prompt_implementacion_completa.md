# Prompt Completo para Agente - Fix API Email + Mejorar Políticas

## Contexto
Tengo un sitio web de control de plagas (ecoquimia.com.do) construido con Astro y desplegado en Vercel. Necesito que implementes dos tareas principales:

1. Configurar correctamente el sistema de cotización por email usando Resend
2. Mejorar significativamente la página de políticas que actualmente es muy simple

## TAREA 1: IMPLEMENTAR API DE EMAIL PARA COTIZACIÓN

### Estructura de Archivos a Crear/Modificar

```
proyecto/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   └── send-email.js          [CREAR/REEMPLAZAR]
│   │   ├── cotizacion.astro           [CREAR/REEMPLAZAR]
│   │   └── politicas.astro            [MEJORAR - ver Tarea 2]
│   └── layouts/
│       └── Base.astro                 [VERIFICAR]
├── astro.config.mjs                   [MODIFICAR]
└── package.json                       [ACTUALIZAR dependencias]
```

### Paso 1: Actualizar astro.config.mjs

**Archivo:** `astro.config.mjs` (en la raíz del proyecto)

Debe quedar así:
```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid', // Permite páginas estáticas Y server-side
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
});
```

### Paso 2: Crear el Endpoint de API

**Archivo:** `src/pages/api/send-email.js` (CREAR esta carpeta y archivo)

```javascript
// src/pages/api/send-email.js
import { Resend } from 'resend';

export const prerender = false;

export async function POST({ request }) {
  try {
    const data = await request.json();
    
    // Validar campos requeridos
    if (!data.nombre || !data.email || !data.telefono || !data.servicio) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Faltan campos requeridos' 
        }), 
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    const { data: emailData, error } = await resend.emails.send({
      from: 'Ecoquimia <onboarding@resend.dev>',
      to: ['melvin01rd@gmail.com'],
      replyTo: data.email,
      subject: `🦟 Nueva Cotización: ${data.servicio} - Ecoquimia`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #2563eb; }
            .footer { background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center; }
            strong { color: #1f2937; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🦟 Nueva Solicitud de Cotización</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Ecoquimia - Control de Plagas</p>
            </div>
            
            <div class="content">
              <div class="info-box">
                <p><strong>👤 Nombre:</strong> ${data.nombre}</p>
              </div>
              <div class="info-box">
                <p><strong>📧 Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              </div>
              <div class="info-box">
                <p><strong>📱 Teléfono:</strong> <a href="tel:${data.telefono}">${data.telefono}</a></p>
              </div>
              <div class="info-box">
                <p><strong>🛠️ Servicio Solicitado:</strong> ${data.servicio}</p>
              </div>
              ${data.mensaje ? `
              <div class="info-box">
                <p><strong>💬 Mensaje:</strong></p>
                <p style="margin-top: 10px; padding: 10px; background: #f9fafb; border-radius: 4px;">${data.mensaje}</p>
              </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>Solicitud recibida el ${new Date().toLocaleString('es-DO', { 
                dateStyle: 'full', 
                timeStyle: 'short',
                timeZone: 'America/Santo_Domingo'
              })}</p>
              <p style="margin-top: 5px;">Enviado desde <strong>www.ecoquimia.com.do</strong></p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Error de Resend:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error al enviar el email: ${error.message}` 
        }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Email enviado correctamente:', emailData);
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cotización enviada correctamente',
        emailId: emailData?.id
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error del servidor:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor. Por favor intenta de nuevo.' 
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
```

### Paso 3: Crear/Reemplazar Página de Cotización

**Archivo:** `src/pages/cotizacion.astro`

```astro
---
import Base from "../layouts/Base.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

export const prerender = true;
---

<Base>
  <Header slot="header" />
  
  <main class="bg-zinc-50 text-zinc-900 min-h-screen py-16">
    <div class="container-max">
      <div class="max-w-2xl mx-auto">
        
        <!-- Título -->
        <div class="text-center mb-10">
          <h1 class="text-4xl md:text-5xl font-extrabold text-zinc-800 mb-4">
            Solicita tu Cotización
          </h1>
          <p class="text-lg text-zinc-600">
            Completa el formulario y te contactaremos lo antes posible
          </p>
        </div>

        <!-- Formulario -->
        <div class="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <form id="cotizacion-form" class="space-y-6">
            
            <!-- Nombre -->
            <div>
              <label for="nombre" class="block text-sm font-semibold text-zinc-700 mb-2">
                Nombre completo *
              </label>
              <input 
                type="text" 
                id="nombre"
                name="nombre" 
                required
                placeholder="Ej: Juan Pérez"
                class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-semibold text-zinc-700 mb-2">
                Email *
              </label>
              <input 
                type="email" 
                id="email"
                name="email" 
                required
                placeholder="tu@email.com"
                class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <!-- Teléfono -->
            <div>
              <label for="telefono" class="block text-sm font-semibold text-zinc-700 mb-2">
                Teléfono *
              </label>
              <input 
                type="tel" 
                id="telefono"
                name="telefono" 
                required
                placeholder="(809) 123-4567"
                class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <!-- Servicio -->
            <div>
              <label for="servicio" class="block text-sm font-semibold text-zinc-700 mb-2">
                Servicio requerido *
              </label>
              <select 
                id="servicio"
                name="servicio" 
                required
                class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Selecciona un servicio</option>
                <option value="Desinsectación">Desinsectación (Cucarachas, hormigas, mosquitos)</option>
                <option value="Desratización">Desratización (Control de roedores)</option>
                <option value="Sanitización / Desinfección">Sanitización / Desinfección</option>
                <option value="Tratamiento antitermitas">Tratamiento antitermitas</option>
                <option value="Limpieza de tanques">Limpieza de tanques</option>
                <option value="Control de palomas">Control de palomas</option>
              </select>
            </div>

            <!-- Mensaje -->
            <div>
              <label for="mensaje" class="block text-sm font-semibold text-zinc-700 mb-2">
                Cuéntanos sobre tu problema (opcional)
              </label>
              <textarea 
                id="mensaje"
                name="mensaje" 
                rows="4"
                placeholder="Describe tu situación con las plagas..."
                class="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              ></textarea>
            </div>

            <!-- Botón y Mensaje de Respuesta -->
            <div class="space-y-4">
              <button 
                type="submit" 
                id="submit-btn"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span id="btn-text">Enviar Cotización</span>
              </button>

              <div id="mensaje-respuesta" class="hidden"></div>
            </div>

          </form>

          <!-- Información de contacto alternativa -->
          <div class="mt-8 pt-8 border-t border-zinc-200">
            <p class="text-center text-sm text-zinc-600 mb-4">
              ¿Prefieres contactarnos directamente?
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="tel:+18097777586"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition"
              >
                📞 809-777-7586
              </a>
              <a 
                href="https://wa.me/18097777586"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </main>

  <Footer slot="footer" />
</Base>

<script>
  const form = document.getElementById('cotizacion-form') as HTMLFormElement;
  const btn = document.getElementById('submit-btn') as HTMLButtonElement;
  const btnText = document.getElementById('btn-text') as HTMLSpanElement;
  const mensajeDiv = document.getElementById('mensaje-respuesta') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    btn.disabled = true;
    btnText.textContent = 'Enviando...';
    mensajeDiv.classList.add('hidden');
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        mensajeDiv.innerHTML = `
          <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-green-800 font-semibold">✅ ¡Cotización enviada con éxito!</p>
            <p class="text-green-700 text-sm mt-1">Te contactaremos pronto. Revisa tu email.</p>
          </div>
        `;
        mensajeDiv.classList.remove('hidden');
        form.reset();
        mensajeDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        mensajeDiv.innerHTML = `
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800 font-semibold">❌ Error al enviar</p>
            <p class="text-red-700 text-sm mt-1">${result.error || 'Intenta de nuevo o contáctanos por WhatsApp'}</p>
          </div>
        `;
        mensajeDiv.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error:', error);
      mensajeDiv.innerHTML = `
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 font-semibold">❌ Error de conexión</p>
          <p class="text-red-700 text-sm mt-1">Verifica tu internet e intenta de nuevo</p>
        </div>
      `;
      mensajeDiv.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Enviar Cotización';
    }
  });
</script>
```

### Paso 4: Actualizar package.json

Añade/actualiza las dependencias:
```bash
npm install @astrojs/vercel resend
```

---

## TAREA 2: MEJORAR LA PÁGINA DE POLÍTICAS

La página actual de políticas es muy simple. Necesito que crees una página profesional y completa con las siguientes secciones:

### Requisitos para la Nueva Página de Políticas

**Archivo:** `src/pages/politicas.astro`

**Estructura requerida:**

1. **Hero Section atractivo**
   - Título principal
   - Subtítulo explicativo
   - Diseño visual moderno

2. **Tabla de Contenidos (TOC)**
   - Enlaces ancla a cada sección
   - Sticky en desktop (opcional)
   - Lista de políticas disponibles

3. **Secciones de Políticas** (con diseño atractivo y profesional):

   a) **Política de Privacidad**
      - Información que recopilamos
      - Cómo usamos la información
      - Protección de datos
      - Derechos del usuario
      - Cookies
   
   b) **Términos y Condiciones de Servicio**
      - Descripción de servicios
      - Obligaciones del cliente
      - Obligaciones de Ecoquimia
      - Política de cancelación
      - Garantías
      - Limitaciones de responsabilidad
   
   c) **Política de Cotizaciones y Pagos**
      - Proceso de cotización
      - Validez de cotizaciones
      - Métodos de pago aceptados
      - Política de reembolsos
   
   d) **Política de Seguridad y Productos**
      - Productos certificados utilizados
      - Protocolos de seguridad
      - Recomendaciones post-servicio
      - Certificaciones
   
   e) **Política de Garantía**
      - Cobertura de la garantía
      - Duración
      - Exclusiones
      - Proceso de reclamo

4. **Diseño Visual:**
   - Usar paleta de colores de Ecoquimia (verdes, azules, zinc)
   - Iconos para cada sección
   - Cards o secciones bien diferenciadas
   - Tipografía legible y jerarquía clara
   - Espaciado generoso
   - Responsive design

5. **Elementos Interactivos:**
   - Smooth scroll al hacer click en TOC
   - Secciones colapsables (acordeón) opcional
   - Botón "Volver arriba"
   - Highlight de sección activa en TOC (opcional)

6. **Footer de la Página:**
   - Última actualización
   - Información de contacto para consultas
   - Link a página de contacto

### Contenido Sugerido (Adáptalo al Negocio)

El contenido debe ser:
- Profesional pero accesible
- En español (República Dominicana)
- Específico para servicios de control de plagas
- Cumplir con normativas locales
- Incluir información real de contacto: melvin01rd@gmail.com, 809-777-7586

---

## VERIFICACIONES FINALES

Después de implementar todo, verifica que:

### Para la API de Email:
- [ ] Existe la carpeta `src/pages/api/`
- [ ] El archivo `send-email.js` está en esa carpeta
- [ ] `astro.config.mjs` tiene el adapter de Vercel
- [ ] La página de cotización está actualizada
- [ ] El formulario envía a `/api/send-email`
- [ ] Todos los campos requeridos están validados

### Para la Página de Políticas:
- [ ] Tiene una estructura visual atractiva
- [ ] Incluye todas las secciones mencionadas
- [ ] Es responsive (mobile-friendly)
- [ ] Usa la paleta de colores de la marca
- [ ] Tiene tabla de contenidos funcional
- [ ] El contenido es profesional y completo

---

## INSTRUCCIONES ADICIONALES

1. **Mantén consistencia** con el estilo del resto del sitio
2. **Usa Tailwind CSS** para los estilos (ya está instalado)
3. **Sigue la estructura** de componentes existente (Base, Header, Footer)
4. **Añade comentarios** en el código donde sea necesario
5. **Usa el slot pattern** correctamente para Header y Footer

---

## NOTAS IMPORTANTES

- El dominio `onboarding@resend.dev` es temporal, eventualmente se cambiará a uno propio
- La variable de entorno `RESEND_API_KEY` debe configurarse en Vercel después del deploy
- Todas las rutas deben funcionar tanto en desarrollo como en producción
- El código debe ser limpio, comentado y mantenible

---

## OUTPUT ESPERADO

Al finalizar, debes generar:

1. ✅ `src/pages/api/send-email.js` - Endpoint funcional
2. ✅ `astro.config.mjs` - Configuración actualizada
3. ✅ `src/pages/cotizacion.astro` - Página de cotización mejorada
4. ✅ `src/pages/politicas.astro` - Página de políticas completamente renovada y profesional
5. ✅ Listado de comandos npm necesarios

Por favor, genera todos estos archivos completos y listos para usar. ¡Gracias!
