# SPEC 01 — Pantallas visuales del MVP de Arcade Vault

> **Status:** Aprobado
> **Depends on:** —
> **Date:** 2026-07-26
> **Objective:** Implementar como rutas reales de Next.js App Router las cinco pantallas visuales de Arcade Vault (biblioteca, detalle de juego, reproductor simulado, autenticación y salón de la fama) migrando el diseño de `references/templates/`, con datos ficticios locales y persistencia en `localStorage`, sin implementar lógica de juego real.

## Scope

**In:**

- Ruta `/` — Biblioteca (`Library`): hero, buscador, filtros por categoría (chips), grid de tarjetas de juego (`GameCard`) con tilt al hover.
- Ruta `/games/[id]` — Detalle de juego (`GameDetail`): portada, tags, descripción, estadísticas, botón "Jugar ahora", tabla de mejores puntuaciones del juego.
- Ruta `/games/[id]/play` — Reproductor simulado (`GamePlayer`): HUD (jugador, puntuación, vidas, nivel), marco CRT con arena de juego decorativa (estática, sin lógica jugable real), simulación automática de puntuación (igual que el template: incrementa cada ~220ms), pausa, fin de partida, modal de guardar puntuación con iniciales.
- Ruta `/auth` — Autenticación (`Auth`): tabs iniciar sesión / crear cuenta, formulario ficticio (cualquier input "loguea"), botón "jugar como invitado", botones sociales decorativos (sin funcionalidad real).
- Ruta `/leaderboard` — Salón de la fama (`HallOfFame`): tabs por juego, podio (top 3), tabla de ranking, fila destacada con la marca del usuario si hay sesión iniciada.
- `Nav`: barra de navegación superior + panel móvil, con estado activo por ruta (usando `usePathname`), contador de créditos estático, botón de sesión (iniciar sesión / nombre de usuario).
- Footer fijo con el texto de copyright del template.
- Datos ficticios en `app/data/` (varios archivos por dominio: juegos, jugadores/puntuaciones).
- Sesión ficticia y puntuaciones guardadas persistidas en `localStorage` (mismas claves del template: `av_user`, `av_scores`).
- Componentes compartidos en `components/` (Nav, GameCard, y los que se requieran).
- Revisión puntual de `app/globals.css` (ya migrado) solo si falta alguna clase usada por las pantallas; todo estilo nuevo se resuelve con Tailwind.

**Out of scope (for future specs):**

- Lógica real de cualquier juego (Bloque Buster, Caída, Serpentina, etc.) — la arena del reproductor es decorativa.
- Autenticación real (backend, validación de credenciales, OAuth con Google/GitHub).
- Persistencia en base de datos — todo vive en `localStorage` y datos estáticos en código.
- Sistema de créditos/monedas funcional (el contador es solo visual).
- Internacionalización (todo el contenido queda en español, como en el template).
- Tests automatizados (el proyecto no tiene test runner configurado).

## Data model

Datos ficticios, tipados en TypeScript, repartidos en `app/data/`:

```ts
// app/data/games.ts
export type GameCategory = 'ARCADE' | 'PUZZLE' | 'SHOOTER' | 'VERSUS';

export type Game = {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string; // clase CSS de la portada (cover-bricks, cover-tetro, ...)
  color: 'cyan' | 'magenta' | 'yellow' | 'green';
  best: number;
  plays: string; // ej. "12.4K"
};

export const GAMES: Game[] = [
  /* 8 juegos, migrados de data.jsx */
];
export const CATS: ('TODOS' | GameCategory)[] = [
  'TODOS',
  'ARCADE',
  'PUZZLE',
  'SHOOTER',
  'VERSUS',
];
```

```ts
// app/data/players.ts
export const PLAYERS: string[] = [
  /* 18 nombres, migrados de data.jsx */
];
```

```ts
// app/data/scores.ts
export type ScoreRow = {
  rank: number;
  name: string;
  score: number;
  date: string;
};

export function seededScores(seed: number, count?: number): ScoreRow[];
// Migración directa de seededScores en data.jsx (mismo PRNG determinista).
```

Estado persistido en `localStorage` (sin cambios respecto al template):

```ts
// clave "av_user"
type StoredUser = { name: string } | null;

// clave "av_scores"
type SavedScoreEntry = {
  game: string;
  score: number;
  name: string;
  at: number;
};
// se guarda como SavedScoreEntry[]
```

Conventions:

- IDs de juego en `kebab-case` en español (`bloque-buster`, `caida`, ...), tal como en el template — son contenido, no rutas del sistema.
- `seededScores` es determinista por `seed`, para que el detalle de un juego y su fila en el leaderboard sean reproducibles entre renders.

## Implementation plan

1. Crear `app/data/games.ts`, `app/data/players.ts`, `app/data/scores.ts` con los datos y tipos migrados de `data.jsx`. Prueba manual: importarlos en `app/page.tsx` temporalmente y verificar en consola que `GAMES.length === 8`.
2. Crear `components/session-provider.tsx`: contexto cliente que expone `user`, `login(name)`, `logout()`, leyendo/escribiendo `localStorage` (`av_user`). Envolverlo en `app/layout.tsx` alrededor de `children`.
3. Crear `components/nav.tsx` (`Nav`): barra superior + panel móvil, usando `usePathname` para el estado activo, `Link` de `next/navigation` para las rutas, y el contexto de sesión para mostrar "Iniciar sesión" o el nombre de usuario. Añadirlo a `app/layout.tsx` junto con el footer fijo. La app es navegable de extremo a extremo con nav y footer visibles aunque las páginas sigan siendo placeholders.
4. Implementar `app/page.tsx` como la Biblioteca: `GameCard` (en `components/game-card.tsx`) con tilt al hover, buscador y chips de categoría, grid de resultados y estado vacío. Prueba manual: buscar y filtrar en `/`.
5. Implementar `app/games/[id]/page.tsx` (Detalle): portada, tags, descripción, stat strip, tabla de mejores puntuaciones vía `seededScores`, botones "Jugar ahora" (enlaza a `/games/[id]/play`) y "Volver al Vault". Prueba manual: navegar desde una tarjeta de la biblioteca.
6. Implementar `app/auth/page.tsx` (Auth): tabs iniciar sesión / crear cuenta, formulario ficticio que llama a `login()` del contexto y redirige a `/`, botón "jugar como invitado" (`login(null)`), botones sociales decorativos sin acción. Prueba manual: loguearse y ver el nombre reflejado en el `Nav`.
7. Implementar `app/games/[id]/play/page.tsx` (Reproductor): HUD, marco CRT con arena decorativa estática, simulación de puntuación por `setInterval` (igual que el template), pausa, fin de partida, modal para guardar puntuación (escribe en `localStorage` bajo `av_scores`). Prueba manual: jugar, pausar, terminar y guardar una puntuación.
8. Implementar `app/leaderboard/page.tsx` (Salón de la fama): tabs por juego, podio top 3, tabla completa, fila destacada del usuario si hay sesión iniciada. Prueba manual: cambiar de tab y verificar que el podio y la tabla cambian.
9. Revisión final: recorrer las 5 rutas, confirmar que `Nav` marca la ruta activa correctamente (incluida la relación `/games/[id]` y `/games/[id]/play` con el link "Biblioteca" inactivo, como en el template), que el panel móvil abre/cierra, y que no falta ninguna clase de `app/globals.css` usada por las pantallas.

## Acceptance criteria

- [ ] La ruta `/` muestra la biblioteca con hero, buscador y chips de categoría funcionales (filtran el grid en cliente).
- [ ] Buscar un término que no coincide con ningún juego muestra el estado "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta o en "JUGAR" navega a `/games/[id]` con el juego correcto.
- [ ] `/games/[id]` muestra la portada, descripción, stat strip y una tabla de mejores puntuaciones con 10 filas.
- [ ] El botón "▶ JUGAR AHORA" en `/games/[id]` navega a `/games/[id]/play`.
- [ ] En `/games/[id]/play`, la puntuación aumenta automáticamente cada ~220ms mientras no está en pausa ni terminada la partida.
- [ ] Pulsar "PAUSA" detiene el incremento de puntuación; pulsar "REANUDAR" lo reanuda.
- [ ] Pulsar "FIN" abre el modal de fin de partida con la puntuación final.
- [ ] Guardar la puntuación en el modal la persiste en `localStorage` bajo la clave `av_scores` y muestra el mensaje "▸ PUNTUACIÓN GUARDADA\_".
- [ ] En `/auth`, enviar el formulario de "Iniciar sesión" (con cualquier valor) guarda el usuario en `localStorage` bajo `av_user` y redirige a `/`.
- [ ] Tras iniciar sesión, `Nav` muestra el nombre de usuario en vez del botón "Iniciar Sesión".
- [ ] "JUGAR COMO INVITADO" en `/auth` navega a `/` sin dejar usuario guardado en `localStorage`.
- [ ] Cerrar sesión desde `Nav` elimina `av_user` de `localStorage` y vuelve a mostrar el botón "Iniciar Sesión".
- [ ] `/leaderboard` muestra un podio (top 3) y una tabla con 12 filas para el juego seleccionado en las tabs.
- [ ] Cambiar de tab en `/leaderboard` actualiza tanto el podio como la tabla al instante.
- [ ] Si hay sesión iniciada, `/leaderboard` muestra una fila adicional destacada con el nombre del usuario actual.
- [ ] `Nav` marca como activo "Biblioteca" también cuando la ruta actual es `/games/[id]` o `/games/[id]/play`.
- [ ] En viewport móvil, el botón hamburguesa abre el panel lateral y un clic en el backdrop lo cierra.
- [ ] Recargar la página en cualquier ruta conserva la sesión y las puntuaciones guardadas (persistencia real de `localStorage`, no solo en memoria).
- [ ] No hay errores en la consola del navegador al recorrer las 5 rutas.

## Decisions

- **Sí:** Migrar a rutas reales de Next.js App Router (`/`, `/games/[id]`, `/games/[id]/play`, `/auth`, `/leaderboard`) en vez de mantener el router por hash del template. Es lo idiomático en App Router y habilita navegación real (back/forward, deep links).
- **No:** Mantener el router casero por hash de `app.jsx`. Reinventaría algo que Next.js ya resuelve.
- **Sí:** Nombres de ruta en inglés (`games`, `play`, `auth`, `leaderboard`), pero contenido e IDs de juego en español, igual que el template. Separa la convención técnica del contenido de producto.
- **Sí:** Reusar `app/globals.css` tal como ya está migrado (variables, `.btn`, `.card`, `.crt`, etc.) y usar Tailwind solo para lo que falte. Evita re-derivar un sistema visual pixel/neón/CRT ya resuelto.
- **Sí:** Mantener la simulación de puntuación automática del reproductor (opción b) en vez de un HUD completamente estático. Hace demostrable el flujo completo (jugar → fin → guardar) sin implementar un juego real.
- **Sí:** Contexto de sesión cliente (`components/session-provider.tsx`) en vez de que cada página lea `localStorage` por su cuenta. `Nav` necesita reflejar el login/logout de forma reactiva entre navegaciones de cliente sin recargar la página.
- **No:** Autenticación real (validación de credenciales, OAuth). Fuera de alcance del MVP visual; los botones sociales quedan decorativos.
- **Sí:** Datos ficticios repartidos en `app/data/games.ts`, `app/data/players.ts`, `app/data/scores.ts` (varios archivos por dominio), tipados en TypeScript, en vez de un único archivo. Facilita que en el futuro cada dominio migre a su propia fuente de datos (DB) de forma independiente.
- **Sí:** `components/` en la raíz del repo para componentes compartidos (`Nav`, `GameCard`, `SessionProvider`). Convención estándar de Next.js App Router para código reutilizable fuera de `app/`.
- **No:** Tests automatizados. El proyecto no tiene test runner configurado; fuera de alcance de este spec.

## Risks

| Risk                                                                                                                                                                      | Mitigation                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El `setInterval` de puntuación del reproductor sigue corriendo si el usuario navega fuera de `/games/[id]/play` sin desmontar el componente a tiempo.                     | Limpiar el intervalo en el `useEffect` de retorno (cleanup), como ya hace el template; verificar manualmente saliendo con "SALIR" a mitad de partida.                                                |
| `localStorage` no disponible (modo privado estricto o SSR en el primer render).                                                                                           | Envolver lecturas/escrituras en `try/catch` (igual que el template) y leer el estado inicial solo en cliente (`useEffect` o `"use client"` con acceso diferido) para evitar mismatch de hidratación. |
| Los componentes que leen `localStorage` (`Nav`, `Auth`, `GamePlayer`) deben ser `"use client"`; si se omite, Next.js falla en build o en runtime al usar hooks de estado. | Marcar explícitamente `"use client"` en `session-provider.tsx`, `nav.tsx`, y las páginas `auth`, `play` que usan `useState`/`useEffect`.                                                             |
| El nombre de ruta `/games/[id]` puede no encontrar el juego si `id` no existe en `GAMES` (URL manual inválida).                                                           | Usar `notFound()` de `next/navigation` cuando `GAMES.find` no encuentra coincidencia, en vez de renderizar `null` silenciosamente como el template.                                                  |

## What is **not** in this spec

- Lógica real de cualquier juego (todos los juegos quedan como arena decorativa estática).
- Autenticación real, backend o base de datos.
- Sistema de créditos/monedas funcional.
- Internacionalización.
- Tests automatizados.

Cada uno de estos, si se implementa, va en su propio spec.
