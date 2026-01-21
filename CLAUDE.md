# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ecoquimia is a pest control company website built with Astro + Tailwind CSS, deployed on Vercel. The site is in Spanish and targets the Dominican Republic market.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run check        # Run astro check + build + HTML validation
npm run format       # Format code with Prettier
npm run format:check # Check formatting without writing
npm run clean        # Remove dist and .astro directories
npm run deploy       # Deploy to Vercel (runs check first)
```

## Architecture

### Server-Side Rendering
- Uses `output: 'server'` mode with Vercel adapter
- API routes require `export const prerender = false` to run server-side
- Node runtime required for API routes: `export const runtime = "node"`

### Key Directories
- `src/pages/` - File-based routing (`.astro` pages and `api/` endpoints)
- `src/pages/api/` - Server-side API routes (contact, cotizacion, captcha, services)
- `src/components/` - Reusable Astro components (Header, Footer, ServiceCard)
- `src/layouts/` - Base layout with SEO schema.org markup
- `src/content/plagas/` - Markdown content collection for pest information
- `src/data/` - TypeScript data files (services, categories)
- `src/lib/` - Utility modules (mailer.ts for Resend email)

### Configuration
- `src/config.ts` - Centralized config with Zod validation for environment variables
- Environment variables needed: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO`, `CONTACT_FROM`

### Content Collections
- `plagas` collection defined in `src/content.config.ts` with schema for title, excerpt, cover, tags, updated, draft

### Email System
- Uses Resend SDK (`src/lib/mailer.ts`)
- Contact and quote forms send emails via API routes
- SVG captcha protection on forms (`/api/captcha`)

### Middleware
- `src/middleware.ts` handles 301 redirect from `/services` to `/servicios`

### Styling
- Tailwind CSS with custom brand colors (`brand: #1d7a53`, `brand-dark: #0f5132`)
- Global styles in `src/styles/global.css`
- `applyBaseStyles: false` in Tailwind integration

### TypeScript
- Strict mode enabled, extends `astro/tsconfigs/strict`
- Target ES2020 with ESNext modules
