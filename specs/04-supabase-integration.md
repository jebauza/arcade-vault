# SPEC 04 — Integración base con Supabase

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02, SPEC 03
> **Date:** 2026-10-19
> **Objective:** Instalar y configurar los clientes de Supabase para navegador y servidor (`@supabase/ssr`) como infraestructura base de los specs futuros de autenticación, base de datos, realtime y edge functions.

## Scope

**In:**

- Dependencias nuevas: `@supabase/supabase-js` y `@supabase/ssr`.
- Cliente de navegador en `lib/supabase/client.ts` (`createBrowserClient`).
- Cliente de servidor en `lib/supabase/server.ts` (`createServerClient`, cookies de `next/headers`).
- Helper de variables en `lib/supabase/env.ts` (`getSupabaseEnv()`), compartido por ambos clientes.
- Variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` documentadas en `.env.example` (sin valores). Valores reales en `.env.local`, obtenidos del proyecto existente vía MCP.
- Route Handler `GET /api/health/supabase` (`app/api/health/supabase/route.ts`) que usa el cliente de servidor y llama `auth.getSession()` para verificar la conexión.
- Tipo `Database` genérico vacío en `lib/supabase/types.ts`, listo para tipar cuando existan tablas.

**Out of scope (for future specs):**

- Autenticación real: reemplazo de `SessionProvider` y de `/auth` (siguen con `localStorage`).
- Tablas, migraciones, RLS y reemplazo de los mocks (`app/data/scores.ts`, `app/data/games.ts`, `app/data/players.ts`).
- `proxy.ts` de refresh de sesión (llega con el spec de auth).
- Realtime y edge functions.
- Clave `service_role` o cualquier acceso administrativo.
- Cambios de UI.
- Tests automatizados (heredado de SPEC 01).

## Data model

Este spec no introduce ningún modelo de datos persistente. Los clientes de Supabase son utilidades de configuración, no estructuras de datos.

## Implementation plan

1. Instalar `@supabase/supabase-js` y `@supabase/ssr`. Agregar a `.env.example` `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sin valores. Obtener URL y clave publishable del proyecto existente con MCP (`get_project_url`, `get_publishable_keys`) y escribirlas en `.env.local`. Confirmar que `.env*.local` está en `.gitignore`. Prueba manual: `npm run build` sin errores; `git status` no muestra `.env.local`.
2. Crear `lib/supabase/types.ts` con el tipo `Database` vacío (`Tables`, `Views`, `Functions` como `Record<string, never>`) y `lib/supabase/env.ts` con `getSupabaseEnv()`, que lee ambas variables con acceso literal a `process.env.NEXT_PUBLIC_*` y lanza un `Error` con el nombre de la variable ausente. Prueba manual: `npx tsc --noEmit` sin errores.
3. Crear `lib/supabase/client.ts` que exporta `createClient()` con `createBrowserClient<Database>` y `getSupabaseEnv()`. Prueba manual: `npx tsc --noEmit` y `npm run build` sin errores.
4. Crear `lib/supabase/server.ts` que exporta `async createClient()` con `createServerClient<Database>`, cookies de `await cookies()` (`getAll`, y `setAll` dentro de `try/catch`, porque en Server Components no se pueden escribir cookies). Prueba manual: `npx tsc --noEmit` sin errores.
5. Crear `app/api/health/supabase/types.ts` (`SupabaseHealthResult`) y `app/api/health/supabase/route.ts` con `GET` que llama `createClient()` de servidor y `auth.getSession()`. Responde `{ status: 'ok' }` (200) si no hay `error`, o `{ status: 'error' }` (500) si hay `error` o una excepción, registrada con `console.error`. Prueba manual: `npm run dev` y `curl localhost:3000/api/health/supabase` devuelve 200 `{"status":"ok"}`; sin `NEXT_PUBLIC_SUPABASE_URL` devuelve 500 `{"status":"error"}`.

## Acceptance criteria

- [x] `package.json` lista `@supabase/supabase-js` y `@supabase/ssr` como dependencias.
- [x] `.env.example` contiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sin valores.
- [x] `.env.local` existe con valores reales y `git status` no lo muestra.
- [x] Existen `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/env.ts` y `lib/supabase/types.ts`.
- [x] `npx tsc --noEmit` termina sin errores.
- [x] `npm run build` termina sin errores.
- [x] `npm run lint` termina sin errores.
- [x] `GET /api/health/supabase` responde HTTP 200 con `{"status":"ok"}` con las variables configuradas.
- [x] `GET /api/health/supabase` responde HTTP 500 con `{"status":"error"}` si falta `NEXT_PUBLIC_SUPABASE_URL`, sin exponer el mensaje de error en el cuerpo.
- [x] La clave `service_role` no aparece en el repositorio (`grep -ri service_role` sin resultados fuera de `specs/`).
- [x] `/`, `/games`, `/auth`, `/leaderboard` y `/about` se ven y funcionan igual que antes (el login fake sigue funcionando).

## Decisions

- **Yes:** `@supabase/supabase-js` + `@supabase/ssr`. `@supabase/ssr` es el estándar para App Router y maneja sesión por cookies. La auth futura lo necesita igual, así se evita migrar clientes después.
- **No:** `@supabase/supabase-js` solo. Más simple hoy, pero obligaría a reescribir los clientes en el spec de auth.
- **Yes:** dos archivos, `lib/supabase/client.ts` y `lib/supabase/server.ts`. Navegador y servidor usan APIs distintas (`createBrowserClient` vs `createServerClient` con cookies).
- **No:** un solo `lib/supabase.ts`. Mezclaría `next/headers` (solo servidor) con código que debe poder importarse desde componentes cliente.
- **Yes:** `lib/supabase/env.ts` con `getSupabaseEnv()`. Una sola validación de variables para ambos clientes (DRY) y error claro con el nombre de la variable ausente.
- **Yes:** instancia nueva de cliente por llamada, sin singleton de módulo. En servidor, un singleton compartiría cookies entre peticiones.
- **Yes:** `GET /api/health/supabase` con `auth.getSession()` como verificación. No requiere tablas y es consistente con `app/api/contact/`. Sin sesión cuenta como `ok`: prueba conexión, no usuario.
- **No:** script manual de verificación. No queda en el repo ni se puede repetir en despliegue.
- **Yes:** variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. La clave publishable está pensada para el navegador. La seguridad real la dará RLS en specs de base de datos.
- **No:** clave `service_role` en esta fase. Acceso administrativo sin necesidad actual.
- **Yes:** tipo `Database` vacío como placeholder. Los clientes quedan tipados desde ya y se reemplaza por tipos generados cuando existan tablas.
- **No:** `proxy.ts` de refresh de sesión ahora. Sin auth no hace nada. Llega con el spec de auth.
- **Yes:** `SessionProvider` (`localStorage`) y mocks de `app/data/` intactos. Este spec es solo infraestructura, sin cambios de comportamiento ni de UI.
- **Yes:** archivos de migración versionados aplicados por MCP en specs futuros, cuando haya tablas. Aquí no hay migraciones.
- **No:** realtime y edge functions. Son specs futuros, apoyados en esta base.

## Risks

| Risk                                                                                      | Mitigation                                                                                                            |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Variables ausentes en un entorno de despliegue                                            | `getSupabaseEnv()` lanza error con el nombre de la variable. El health check responde 500 y lo registra en servidor.  |
| `NEXT_PUBLIC_*` no se inlinea si se lee con acceso dinámico (`process.env[name]`)         | `getSupabaseEnv()` usa acceso literal a cada variable.                                                                |
| `setAll` de cookies falla al llamarse desde un Server Component                           | `setAll` va en `try/catch`. El refresco real de sesión llega con `proxy.ts` en el spec de auth.                       |
| Clave publishable expuesta en el navegador sin RLS                                        | No hay tablas todavía, así que no hay datos expuestos. Los specs de base de datos activan RLS desde la primera tabla. |
| API de `@supabase/ssr` distinta a la esperada (`getAll`/`setAll` vs `get`/`set`/`remove`) | Verificar la versión instalada y su documentación en el paso 4 antes de escribir `server.ts`.                         |

## What is **not** in this spec

- Autenticación real, `proxy.ts` y reemplazo del login fake.
- Tablas, migraciones, RLS y reemplazo de los mocks de `app/data/`.
- Realtime y edge functions.
- Clave `service_role`.
- Cambios de UI.

Cada uno de esos puntos, si llega, va en su propio spec.
