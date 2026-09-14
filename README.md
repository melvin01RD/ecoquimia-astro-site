# Ecoquimia

Sitio web oficial de **Ecoquimia**, empresa dominicana especializada en control de plagas, sanitizaciÃ³n y soluciones preventivas para hogares y negocios.

[![Astro](https://img.shields.io/badge/Astro-5.14-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

ðŸŒ **ProducciÃ³n:** [fumigadoraecoquimia.com.do](https://fumigadoraecoquimia.com.do)

![PÃ¡gina principal de Ecoquimia](public/banner-principal.jpg)

## DescripciÃ³n

La plataforma presenta los servicios de Ecoquimia, facilita el contacto mediante WhatsApp y permite solicitar cotizaciones desde un formulario web. TambiÃ©n ofrece contenido educativo sobre las plagas mÃ¡s comunes en RepÃºblica Dominicana.

El proyecto estÃ¡ desarrollado con Astro en modo SSR y desplegado en Vercel. Su estructura prioriza rendimiento, accesibilidad, SEO, diseÃ±o adaptable a dispositivos mÃ³viles y facilidad de mantenimiento.

## Funcionalidades principales

- CatÃ¡logo de servicios de control de plagas y sanitizaciÃ³n.
- Formulario de cotizaciÃ³n con envÃ­o de correos mediante Resend.
- CAPTCHA, honeypot y validaciones para reducir solicitudes automatizadas.
- Acceso directo a WhatsApp con mensajes predefinidos.
- Contenido educativo sobre cucarachas, roedores, termitas y otras plagas.
- DiseÃ±o responsive para computadoras, tabletas y mÃ³viles.
- Sitemap, metadatos y redirecciones orientadas a SEO.
- PÃ¡gina de polÃ­ticas y manejo de rutas no encontradas.
- RedirecciÃ³n de dominios alternativos hacia el dominio oficial.

## TecnologÃ­as

| Ãrea                 | TecnologÃ­a              |
| -------------------- | ----------------------- |
| Framework            | Astro 5                 |
| Estilos              | Tailwind CSS 3          |
| Lenguaje             | TypeScript / JavaScript |
| ValidaciÃ³n           | Zod y HTML Validate     |
| Correo transaccional | Resend                  |
| Iconos               | Lucide Astro            |
| Despliegue           | Vercel                  |
| SEO                  | Astro Sitemap           |

## Requisitos

- [Node.js 22](https://nodejs.org/)
- npm
- Una cuenta de Resend para probar el envÃ­o real de cotizaciones

## InstalaciÃ³n local

```bash
git clone https://github.com/melvin01RD/ecoquimia-astro-site.git
cd ecoquimia-astro-site
npm install
```

Crea un archivo `.env` en la raÃ­z del proyecto:

```env
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_SITE_ORIGIN=http://localhost:4321

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="Ecoquimia <cotizaciones@tu-dominio.com>"
RESEND_TO_EMAIL=correo-destino@ejemplo.com
```

> [!IMPORTANT]
> No publiques credenciales reales en GitHub. Configura las variables de producciÃ³n directamente en Vercel.

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El sitio estarÃ¡ disponible en `http://localhost:4321`.

## Comandos disponibles

| Comando                | DescripciÃ³n                                          |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Inicia el entorno local de desarrollo.               |
| `npm run build`        | Genera el build de producciÃ³n.                       |
| `npm run preview`      | Ejecuta una vista previa del build.                  |
| `npm run check`        | Ejecuta Astro Check, build y validaciÃ³n del HTML.    |
| `npm run check:astro`  | Valida componentes Astro y TypeScript.               |
| `npm run lint:html`    | Construye el proyecto y valida el HTML generado.     |
| `npm run format`       | Formatea el cÃ³digo con Prettier.                     |
| `npm run format:check` | Comprueba el formato sin modificar archivos.         |
| `npm run clean`        | Elimina los directorios generados `dist` y `.astro`. |
| `npm run deploy`       | Valida y despliega el sitio a producciÃ³n en Vercel.  |

## Estructura del proyecto

```text
src/
â”œâ”€â”€ components/       # Header, footer, tarjetas y elementos reutilizables
â”œâ”€â”€ config/           # Datos oficiales y configuraciÃ³n del negocio
â”œâ”€â”€ content/plagas/   # Contenido educativo en Markdown
â”œâ”€â”€ data/             # Servicios y categorÃ­as
â”œâ”€â”€ layouts/          # Layout base del sitio
â”œâ”€â”€ lib/              # Integraciones, como el cliente de correo
â”œâ”€â”€ pages/             # PÃ¡ginas, rutas y endpoints de API
â””â”€â”€ styles/            # Estilos globales y especÃ­ficos

public/                # ImÃ¡genes, iconos y archivos pÃºblicos
astro.config.mjs       # ConfiguraciÃ³n principal de Astro
vercel.json            # Redirecciones de dominios en Vercel
```

## ValidaciÃ³n antes de publicar

Antes de crear un pull request o desplegar una versiÃ³n, ejecuta:

```bash
npm run format:check
npm run check
```

TambiÃ©n se recomienda comprobar manualmente:

- NavegaciÃ³n mediante teclado y estados de foco.
- MenÃº mÃ³vil y desplazamiento vertical.
- Formulario de cotizaciÃ³n con datos vÃ¡lidos e invÃ¡lidos.
- RecepciÃ³n del correo y funcionamiento de `reply-to`.
- Enlaces de telÃ©fono y WhatsApp.
- VisualizaciÃ³n en tamaÃ±os mÃ³vil, tableta y escritorio.
- Ausencia de errores en la consola y solicitudes fallidas en Network.

## Despliegue

El proyecto usa el adaptador oficial de Vercel y se ejecuta en modo SSR (`output: "server"`). Los endpoints ubicados en `src/pages/api/` requieren el runtime de Node.js.

Para desplegar desde la terminal:

```bash
npm run deploy
```

El script ejecuta primero todas las validaciones definidas en `npm run check` y luego publica la versiÃ³n en producciÃ³n.

## Contacto

- Sitio web: [fumigadoraecoquimia.com.do](https://fumigadoraecoquimia.com.do)
- TelÃ©fono y WhatsApp: [809-777-7586](https://wa.me/18097777586)
- Correo comercial: [areacomercial.eco@gmail.com](mailto:areacomercial.eco@gmail.com)
- UbicaciÃ³n: Santo Domingo, RepÃºblica Dominicana

## Autor y mantenimiento

Proyecto desarrollado y mantenido por [Melvin De La Cruz](https://github.com/melvin01RD) con contribuciones de [Cesar](https://github.com/NIGTHGIT).

---

Â© Ecoquimia. Todos los derechos reservados.
