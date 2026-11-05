# Forge Labs — sitio y portal

React + TypeScript + Vite · Supabase (Postgres, Auth, Storage) · Hosting en Cloudflare.

## Sitio publicado

La versión en línea está disponible para revisar sin instalar el proyecto:

[Abrir Forge Labs](https://forge-labs.famendezabreg.workers.dev)

## Ejecutar localmente

Si deseas instalarlo y ejecutarlo en tu computadora:

```bash
npm install
cp .env.example .env.local   # completa con las claves de tu proyecto Supabase
npm run dev
```

Sin variables de Supabase el sitio funciona con el catálogo local, pero el login y el envío de cotizaciones quedan deshabilitados.

## Supabase

1. Crea un proyecto en supabase.com.
2. Ejecuta en el SQL Editor, en orden, los archivos de `supabase/migrations/` (0001 a 0005).
3. Authentication → URL Configuration: agrega tu dominio y `http://localhost:5173` como Site URL / Redirect URLs.
4. Para hacer admin a tu usuario (desde el SQL Editor):
   `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'tu@correo.com');`

5. Datos de ejemplo del plan de negocio (proyectos, CRM): ejecuta `supabase/seed_forge_labs.sql`.

## Despliegue en Cloudflare

Conecta el repo en Cloudflare (Workers & Pages) con:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (usa `wrangler.jsonc`, con fallback SPA)
- Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm run preview`
