# SPEC 02 — Landing page (Home)

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-06
> **Objective:** Implementar la landing page en `/` migrando el `Home` de `references/templates/home-about/`, moviendo la biblioteca actual a `/games` y actualizando `Nav` y enlaces internos.

## Scope

**In:**

- Ruta `/` — Landing (`Home`) con 7 secciones del template: Hero (con siluetas flotantes), ¿Por qué Arcade Vault?, Juegos disponibles (6 `MiniCard`), Stats, Actividad en vivo (últimas puntuaciones + top jugadores hoy), Precios (plan único + FAQ), CTA final.
- Mover la Biblioteca actual de `/` a `/games` (`app/games/page.tsx`).
- Actualizar enlaces que apuntan a la biblioteca: "Volver al Vault" en `/games/[id]`, enlaces en `/games/[id]/play` y `/leaderboard`.
- `Nav` (escritorio y panel móvil): links Inicio (`/`), Biblioteca (`/games`), Salón de la Fama (`/leaderboard`). "Biblioteca" activo en `/games`, `/games/[id]` y `/games/[id]/play`; "Inicio" activo solo en `/`.
- Logo del `Nav` sigue apuntando a `/`.
- Redirecciones post-login (`/auth`) y post-logout (`Nav`) siguen yendo a `/` (ahora la landing).
- CTAs: "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS" e "INSERTAR MONEDA" → `/games`; "CREAR CUENTA" y "EMPEZAR GRATIS" → `/auth`; "VER SALÓN" → `/leaderboard`; clic en `MiniCard` → `/games/[id]`.
- Datos ficticios de la landing en `app/data/home.ts` (features, stats, actividad reciente, top del día, FAQ). Actividad referencia juegos por `id` de `GAMES`, no por texto libre.
- Hook cliente `useReveal` en `components/` con `IntersectionObserver` + clase `.in`, respetando `prefers-reduced-motion`.
- Migrar a `app/globals.css` los estilos de home desde `styles.css` (desde `/* ===== HOME PAGE ===== */`), solo los que falten.
- Componentes de la landing en `components/home/` (siluetas, `MiniCard`, `FeatureIcon`, etc.).

**Out of scope (for future specs):**

- Página "Acerca de" (`/about`) y formulario de contacto. Link "Acerca de" no aparece en `Nav` hasta su spec.
- Datos reales de actividad/ranking/stats (todo ficticio y estático).
- Lógica real de juegos, autenticación real, i18n, tests automatizados (heredado de SPEC 01).

## Data model

Datos ficticios tipados en `app/data/home.ts`. Sin persistencia nueva.

```ts
// app/data/home.ts
import type { Game } from '@/app/data/games';

export type NeonColor = 'cyan' | 'magenta' | 'yellow' | 'green';

export type FeatureKind = 'GAMEPAD' | 'FREE' | 'TROPHY' | 'ROCKET';

export type Feature = {
  icon: FeatureKind;
  title: string;
  description: string;
  color: NeonColor;
};

export type HomeStat = { value: string; unit: string; caption: string };

export type RecentScore = {
  player: string;
  gameId: Game['id']; // título se resuelve desde GAMES
  score: number;
  ago: string; // ej. "hace 2 min"
  color: NeonColor;
};

export type TopPlayer = { rank: number; player: string; score: number };

export type FaqItem = { question: string; answer: string };

export const FEATURES: Feature[]; // 4
export const HOME_STATS: HomeStat[]; // 3
export const RECENT_SCORES: RecentScore[]; // 7
export const TOP_PLAYERS_TODAY: TopPlayer[]; // 5
export const PRICING_FEATURES: string[]; // 6 ítems del plan
export const FAQ: FaqItem[]; // 3
```

Conventions:

- Textos en español, tal cual el template (`home.jsx`).
- `gameId` usa los IDs de SPEC 01 (`drop`, `glutton`, `invaders`, `asteroids`, `brick-buster`, `snake`, `crossing`); el título mostrado sale de `GAMES`, no se duplica.
- Las 6 tarjetas de "Juegos disponibles" son `GAMES.slice(0, 6)`, sin datos nuevos.
- Números se formatean con `toLocaleString('es-ES')`, igual que el template.
- El ancho de las barras del top es `100 - index * 16` (%), calculado en el componente, no en los datos.

## Implementation plan

1. Mover la Biblioteca: crear `app/games/page.tsx` con el contenido actual de `app/page.tsx` y dejar `app/page.tsx` como placeholder mínimo (título "ARCADE VAULT"). Actualizar los enlaces "Volver al Vault" / "Biblioteca" en `app/games/[id]/page.tsx`, `app/games/[id]/play/page.tsx` y `app/leaderboard/page.tsx` a `/games`. Prueba manual: `/games` muestra la biblioteca con filtros y las tarjetas siguen navegando a `/games/[id]`.
2. Actualizar `components/nav.tsx` (escritorio y panel móvil): links Inicio (`/`), Biblioteca (`/games`), Salón de la Fama (`/leaderboard`). Inicio activo solo en `/`; Biblioteca activo en `/games`, `/games/[id]` y `/games/[id]/play`. Prueba manual: recorrer rutas y ver el active correcto en ambos menús.
3. Migrar a `app/globals.css` los estilos de home desde `references/templates/home-about/styles.css` (desde `/* ===== HOME PAGE ===== */`), sin duplicar clases ya presentes. Prueba manual: build sin errores de CSS.
4. Crear `app/data/home.ts` con tipos y constantes (`FEATURES`, `HOME_STATS`, `RECENT_SCORES`, `TOP_PLAYERS_TODAY`, `PRICING_FEATURES`, `FAQ`). Prueba manual: importar temporalmente en `app/page.tsx` y verificar `RECENT_SCORES.length === 7` y que cada `gameId` existe en `GAMES`.
5. Crear `components/use-reveal.ts` (hook cliente `useReveal`: `IntersectionObserver` + clase `.in`; con `prefers-reduced-motion` marca todo como `.in` sin observar). Prueba manual: hook montado en `app/page.tsx` con un bloque `.reveal` de prueba que aparece al hacer scroll.
6. Crear `components/home/floating-silhouettes.tsx` y la sección Hero en `app/page.tsx` (eyebrow, título 3 líneas, subtítulo, CTAs a `/games` y `/auth`, indicador de scroll). Prueba manual: hero visible en `/` con siluetas y CTAs navegando.
7. Crear `components/home/feature-icon.tsx` y la sección "¿POR QUÉ ARCADE VAULT?" con las 4 `feature-card`. Prueba manual: 4 tarjetas con ícono y color correcto.
8. Crear `components/home/mini-card.tsx` y las secciones "JUEGOS DISPONIBLES AHORA" (6 `MiniCard` → `/games/[id]`, botón "VER TODOS LOS JUEGOS" → `/games`) y Stats. Prueba manual: clic en una `MiniCard` abre el detalle correcto.
9. Sección "ACTIVIDAD EN VIVO": ticker de últimas puntuaciones (título resuelto desde `GAMES`) y top jugadores hoy con barras y enlace "VER SALÓN" → `/leaderboard`. Prueba manual: 7 filas en el ticker, 5 en el top, podio top1/top2/top3 con estilo distinto.
10. Secciones "PRECIOS" (plan único + FAQ, botón "EMPEZAR GRATIS" → `/auth`) y CTA final ("INSERTAR MONEDA" → `/games`). Quitar cualquier código temporal de pasos anteriores. Prueba manual: `/` completo de arriba abajo.

## Acceptance criteria

- [ ] `/` muestra la landing con las 7 secciones en orden: Hero, ¿Por qué Arcade Vault?, Juegos disponibles, Stats, Actividad en vivo, Precios, CTA final.
- [ ] `/games` muestra la biblioteca con buscador y chips de categoría funcionales (comportamiento de SPEC 01 intacto).
- [ ] Ninguna ruta enlaza a `/` esperando la biblioteca: "Volver al Vault" en `/games/[id]` y los enlaces equivalentes en `/games/[id]/play` y `/leaderboard` navegan a `/games`.
- [ ] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS" e "INSERTAR MONEDA" navegan a `/games`.
- [ ] "CREAR CUENTA" y "EMPEZAR GRATIS" navegan a `/auth`.
- [ ] "VER SALÓN" navega a `/leaderboard`.
- [ ] La sección "Juegos disponibles" muestra exactamente 6 `MiniCard` y cada clic navega a `/games/[id]` con el juego correcto.
- [ ] El ticker muestra 7 filas y cada título de juego coincide con el `title` de `GAMES` según su `gameId`.
- [ ] El top de jugadores muestra 5 filas; las 3 primeras tienen clases `top1`, `top2`, `top3`.
- [ ] `Nav` muestra "Inicio", "Biblioteca" y "Salón de la Fama", y no muestra "Acerca de", en escritorio y en el panel móvil.
- [ ] "Inicio" está activo solo en `/`; "Biblioteca" está activo en `/games`, `/games/[id]` y `/games/[id]/play`.
- [ ] El logo de `Nav` navega a `/`.
- [ ] Tras iniciar sesión en `/auth` y tras cerrar sesión desde `Nav`, el usuario termina en `/`.
- [ ] Las secciones `.reveal` pasan a `.in` al entrar en el viewport al hacer scroll.
- [ ] Con `prefers-reduced-motion: reduce`, todas las secciones `.reveal` son visibles sin hacer scroll.
- [ ] La landing no tiene scroll horizontal en viewport de 375px de ancho.
- [ ] `npm run build` y `npm run lint` terminan sin errores.
- [ ] No hay errores en la consola del navegador al recorrer `/`, `/games`, `/games/[id]`, `/auth` y `/leaderboard`.

## Decisions

- **Sí:** `/` pasa a ser la landing y la biblioteca se mueve a `/games`. Separa marketing de catálogo, como el template, y deja `/games` como raíz natural de `/games/[id]`.
- **No:** Dejar la biblioteca en `/` y poner la landing en otra ruta. Una landing fuera de la raíz pierde su función.
- **Sí:** Ruta de biblioteca en inglés (`/games`), coherente con SPEC 01. El texto visible sigue en español ("Biblioteca").
- **No:** Redirect de la biblioteca vieja. `/` sigue existiendo (ahora landing) y no hay URLs públicas previas que preservar.
- **Sí:** Página "Acerca de" fuera de este spec, y su link fuera de `Nav` hasta entonces. Evita un enlace a 404 y mantiene el spec en una sola pantalla.
- **Sí:** Datos de la landing ficticios y estáticos en `app/data/home.ts`, separados por dominio como en SPEC 01. Cuando existan datos reales, cada uno migra a su fuente sin tocar los componentes.
- **Sí:** Actividad reciente referencia juegos por `gameId` y resuelve el título desde `GAMES`. Evita duplicar texto que podría desincronizarse.
- **Sí:** Hook `useReveal` con `IntersectionObserver`, respetando `prefers-reduced-motion`. Replica el efecto del template sin dejar contenido oculto a quien reduce animaciones.
- **No:** Librería de animación (Framer Motion, GSAP). Excesivo para un fade-in por scroll que ya resuelve el CSS del template.
- **Sí:** Migrar el CSS de home a `app/globals.css`, como en SPEC 01. Reusa el sistema visual pixel/neón ya resuelto.
- **Sí:** Componentes de la landing en `components/home/`. Evita mezclar piezas específicas con las compartidas de `components/`.
- **Sí:** Migrar las 7 secciones del template completas, incluidos precios y FAQ, con contenido tal cual. Es lo que pidió el diseño de referencia.
- **No:** Tests automatizados. El proyecto no tiene test runner; heredado de SPEC 01.

## Risks

| Risk                                                                                                                                                 | Mitigation                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quedan enlaces a `/` que esperaban la biblioteca (`href="/"`, `router.push('/')`) y llevan a la landing sin avisar.                                  | En el paso 1, buscar `href="/"` y `push('/')` en `app/` y `components/`; solo se conservan los que deben ir a la landing (logo, post-login, post-logout).                     |
| `.reveal` deja las secciones invisibles si el JS no carga o el hook tarda en montar.                                                                 | Ocultar `.reveal` solo cuando el hook ya se montó (por ejemplo, clase en el contenedor `.home`); sin JS el contenido queda visible. Con `prefers-reduced-motion`, todo `.in`. |
| El CSS de home choca con clases ya migradas en `globals.css` (`.btn.xl`, `.pulse`, `.pixel`, `.neon-*`) y cambia el aspecto de pantallas de SPEC 01. | Antes de pegar, comparar clases con las existentes; no sobrescribir las ya presentes. Revisar `/games`, `/auth` y `/leaderboard` tras el paso 3.                              |
| `toLocaleString('es-ES')` produce texto distinto en servidor y cliente y causa error de hidratación.                                                 | Mantener la página como Server Component y limitar `'use client'` a lo que usa el hook (`useReveal`) o estado; formatear en servidor.                                         |
| El template navega con `navigate({ name })` y `onClick` en divs (`MiniCard`), lo que no sirve para SEO ni accesibilidad.                             | Usar `Link` de `next/link` en `MiniCard`, CTAs y enlaces, no `onClick` con `router.push`.                                                                                     |

## What is **not** in this spec

- Página "Acerca de" (`/about`) y formulario de contacto.
- Datos reales de actividad, ranking o estadísticas.
- Lógica real de juegos, autenticación real, i18n, tests automatizados.

Cada uno de estos, si se implementa, va en su propio spec.
