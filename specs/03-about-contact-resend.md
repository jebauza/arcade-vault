# SPEC 03 — Página Acerca de y contacto con Resend

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-10-14
> **Objective:** Implementar la página `/about` migrando `About` de `references/templates/home-about/` y enviar el formulario de contacto por correo con Resend mediante un Route Handler (`POST /api/contact`).

## Scope

**In:**

- Ruta `/about` (`app/about/page.tsx`) con `About` del template: hero "ACERCA DE ARCADE VAULT", 3 highlights con ícono pixel (`HEART`, `BROWSER`, `PLANT`), divisor animado y sección de contacto.
- Formulario de contacto (nombre, correo, mensaje) con el diseño del template: shake en error de validación, terminal de éxito `VAULT-OS // TERMINAL` con el nombre en mayúsculas, botón "ENVIAR OTRO MENSAJE".
- Envío real del correo con Resend desde un Route Handler (`app/api/contact/route.ts`, `POST /api/contact`) que recibe JSON, a `CONTACT_TO_EMAIL`, desde `RESEND_FROM_EMAIL` (por defecto `onboarding@resend.dev`), texto plano, `reply_to` = correo del visitante, asunto `[Arcade Vault] Mensaje de {nombre}`.
- Validación en servidor (en el Route Handler): campos requeridos, formato de correo, nombre ≤ 80 y mensaje ≤ 2000 caracteres. Honeypot (campo oculto) que descarta el envío sin avisar al bot.
- Estados extra al template: "enviando" (botón deshabilitado) y error de envío en la terminal con `[ERR]` y botón "REINTENTAR".
- Variables de entorno: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL` documentadas en `.env.example`; valores reales en `.env.local` (ya ignorado por git).
- Link "Acerca de" en `Nav` (escritorio y panel móvil), activo solo en `/about`.
- Hook `useReveal` de SPEC 02 reutilizado para las secciones `.reveal`.
- Migrar a `app/globals.css` los estilos de about desde `styles.css` (los que falten).
- Componentes en `components/about/` (`HighlightIcon`, `ContactForm`).

**Out of scope (for future specs):**

- Rate limiting, captcha o cualquier anti-spam más allá del honeypot.
- Dominio propio verificado en Resend (se usa `onboarding@resend.dev`, que solo entrega al correo de la cuenta Resend).
- Guardar mensajes en base de datos o panel de administración.
- Correo de confirmación al visitante.
- Correo en HTML, plantillas con React Email, adjuntos.
- i18n y tests automatizados (heredado de SPEC 01).

## Data model

Sin persistencia nueva. Solo tipos del formulario y variables de entorno.

```ts
// app/api/contact/types.ts
export type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactFieldError = keyof ContactFormValues;

// Cuerpo JSON de la respuesta de POST /api/contact
export type ContactResult =
  | { status: 'success'; name: string } // HTTP 200
  | { status: 'invalid'; fields: ContactFieldError[] } // HTTP 400
  | { status: 'error' }; // HTTP 500: fallo de Resend o configuración ausente

// app/api/contact/route.ts
export async function POST(request: Request): Promise<Response>;
```

Request: `POST /api/contact`, `Content-Type: application/json`, cuerpo `{ name, email, message, website }`.

```bash
# .env.example
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
CONTACT_TO_EMAIL=
```

Conventions:

- Campos del cuerpo JSON: `name`, `email`, `message` y el honeypot `website` (oculto, debe llegar vacío). Un cuerpo que no sea JSON válido o con campos que no sean `string` se trata como `invalid` (HTTP 400) con los campos afectados.
- Honeypot lleno: el Route Handler responde `success` (HTTP 200) sin llamar a Resend.
- Valores se recortan con `trim()` antes de validar.
- Límites: `name` ≤ 80, `message` ≤ 2000. Correo validado con regex simple.
- Las variables se leen solo en servidor, nunca con prefijo `NEXT_PUBLIC_`.
- El `ContactResult` `error` no expone el mensaje de Resend al cliente; se registra con `console.error` en servidor.
- Dependencia nueva: paquete `resend`.

## Implementation plan

1. Instalar `resend` y crear `.env.example` con `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`. Confirmar que `.env*.local` está en `.gitignore`. Prueba manual: `npm run build` sin errores y `.env.example` sin valores secretos.
2. Migrar a `app/globals.css` los estilos de about desde `references/templates/home-about/styles.css` (sección about/contact), sin duplicar clases existentes. Prueba manual: build sin errores de CSS y `/games`, `/auth`, `/leaderboard` sin cambios visuales.
3. Crear `components/about/highlight-icon.tsx` (`HEART`, `BROWSER`, `PLANT`) y la página `app/about/page.tsx` con hero, highlights y divisor, usando `useReveal`. Prueba manual: `/about` muestra hero y 3 highlights con color correcto; `.reveal` pasa a `.in` al hacer scroll.
4. Agregar la sección de contacto en `app/about/page.tsx` con la columna de intro (título, subtítulo, 3 tips con LED) y `components/about/contact-form.tsx` solo con UI: campos controlados, shake por validación de cliente, terminal de éxito simulada. Prueba manual: campos vacíos hacen shake; formulario completo muestra la terminal con el nombre en mayúsculas; "ENVIAR OTRO MENSAJE" limpia el formulario.
5. Crear `app/api/contact/types.ts` y `app/api/contact/route.ts` con `POST`: parseo del JSON, honeypot, `trim`, validación y límites, lectura de variables, envío con Resend (texto plano, `reply_to`, asunto `[Arcade Vault] Mensaje de {nombre}`), `ContactResult` con códigos 200/400/500. Prueba manual: `curl` o `fetch` con datos inválidos devuelve 400 `invalid` con los campos; sin `RESEND_API_KEY` devuelve 500 `error`.
6. Conectar `ContactForm` al endpoint con `fetch('/api/contact')` dentro de `useTransition`: estado "enviando" (botón deshabilitado), `invalid` con shake, `error` con `[ERR]` y botón "REINTENTAR" que conserva los valores, `success` con terminal. Incluir el campo honeypot oculto (`tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`). Sin código temporal del paso 5. Prueba manual: con API key real, el correo llega a `CONTACT_TO_EMAIL` con `reply_to` correcto.
7. Agregar "Acerca de" a `components/nav.tsx` (escritorio y panel móvil), activo solo en `/about`. Prueba manual: recorrer `/`, `/games`, `/leaderboard`, `/about` y ver el active correcto en ambos menús.
8. Revisión final: `npm run lint`, `npm run build`, consola del navegador limpia y viewport de 375px sin scroll horizontal en `/about`.

## Acceptance criteria

- [ ] `/about` muestra hero "ACERCA DE ARCADE VAULT", 3 highlights (corazón, navegador, planta) y la sección de contacto, en ese orden, con el mismo diseño del template.
- [ ] `Nav` muestra "Acerca de" en escritorio y panel móvil; está activo solo en `/about` y navega a `/about`.
- [ ] Enviar el formulario con algún campo vacío no llama a Resend y activa el shake.
- [ ] Un correo con formato inválido, un nombre de más de 80 caracteres o un mensaje de más de 2000 caracteres es rechazado por `POST /api/contact` con HTTP 400 y `status: 'invalid'`.
- [ ] Con datos válidos y API key real, el correo llega a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de {nombre}`, cuerpo en texto plano con nombre, correo y mensaje, y `reply_to` igual al correo del visitante.
- [ ] Tras el envío exitoso se muestra la terminal con "MENSAJE RECIBIDO" y el nombre en mayúsculas; "ENVIAR OTRO MENSAJE" vuelve al formulario vacío.
- [ ] Durante el envío el botón está deshabilitado y no permite doble envío.
- [ ] Si Resend falla o falta `RESEND_API_KEY`, la terminal muestra `[ERR]` sin detalles internos y "REINTENTAR" devuelve al formulario con los valores conservados.
- [ ] Con el honeypot lleno `POST /api/contact` responde `success` y no se llama a Resend.
- [ ] `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `CONTACT_TO_EMAIL` no aparecen en el bundle del cliente ni en el repositorio; `.env.example` existe sin valores secretos.
- [ ] Las secciones `.reveal` pasan a `.in` al hacer scroll y con `prefers-reduced-motion: reduce` son visibles sin scroll.
- [ ] `/about` no tiene scroll horizontal en viewport de 375px.
- [ ] `npm run build` y `npm run lint` terminan sin errores.
- [ ] No hay errores en la consola del navegador al recorrer `/`, `/games`, `/leaderboard`, `/auth` y `/about`.

## Decisions

- **Sí:** Route Handler `POST /api/contact` para el envío. Define un contrato HTTP explícito (JSON y códigos 200/400/500), reutilizable por otros clientes (app móvil, webhook) y fácil de probar con `curl`. Las credenciales siguen leyéndose solo en servidor. Decisión del autor (2026-10-16), revierte la decisión inicial de este spec.
- **No:** Server Action. Se usó en la primera implementación; se reemplaza por el Route Handler. Tiene menos código, pero acopla el envío al formulario de React y no expone un endpoint consumible por otros clientes.
- **Sí:** Remitente `onboarding@resend.dev` configurable con `RESEND_FROM_EMAIL`. Funciona sin dominio verificado; pasar a dominio propio es cambiar una variable.
- **No:** Dominio propio verificado en este spec. Requiere DNS fuera del repo y bloquearía la implementación.
- **Sí:** Destinatario en `CONTACT_TO_EMAIL`, no hardcodeado. Cumple la regla de no versionar datos personales ni secretos y permite cambiarlo por entorno.
- **Sí:** Texto plano con `reply_to` = correo del visitante. Responder desde el cliente de correo llega directo al visitante sin exponer su dirección como remitente.
- **No:** Correo HTML o React Email. Complejidad sin valor para un mensaje interno.
- **Sí:** Honeypot + validación en servidor con límites. Frena bots básicos sin dependencias ni fricción para el usuario.
- **No:** Rate limiting ni captcha. Requieren almacenamiento o servicio externo; se evalúan en otro spec si aparece abuso.
- **Sí:** Validar siempre en servidor, aunque el cliente también haga shake. La validación de cliente es solo UX.
- **Sí:** Estados "enviando" y `[ERR]` con "REINTENTAR", más allá del template. Sin ellos un fallo de red o de Resend dejaría al usuario sin respuesta.
- **Sí:** No exponer el error de Resend al cliente; se registra en servidor. Evita filtrar detalles de configuración.
- **Sí:** Componentes en `components/about/` y estilos migrados a `app/globals.css`, igual que en SPEC 01 y 02.
- **No:** Guardar mensajes en base de datos. El proyecto no tiene persistencia; el correo es el único destino.
- **No:** Tests automatizados. El proyecto no tiene test runner; heredado de SPEC 01.

## Risks

| Risk                                                                                                                        | Mitigation                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `onboarding@resend.dev` solo entrega al correo de la cuenta Resend; si `CONTACT_TO_EMAIL` es otro, Resend rechaza el envío. | Usar como `CONTACT_TO_EMAIL` el correo con el que se registró la cuenta Resend, o verificar un dominio. Documentarlo en `.env.example`.        |
| Falta `RESEND_API_KEY` o alguna variable al desplegar y el formulario falla en silencio.                                    | El endpoint devuelve HTTP 500 con `status: 'error'` y registra con `console.error` qué variable falta; la UI muestra `[ERR]` con "REINTENTAR". |
| La API key o el correo destino se filtran al cliente o al repositorio.                                                      | Variables sin prefijo `NEXT_PUBLIC_`, leídas solo en `route.ts`; `.env.local` ignorado por git y solo `.env.example` versionado.               |
| Bots envían spam que consume la cuota gratuita de Resend.                                                                   | Honeypot y límites de longitud. Si hay abuso, abrir spec de rate limiting o captcha.                                                           |
| Los Route Handlers de Next.js 16 cambiaron respecto a lo conocido (firma de `POST`, `Request`/`Response`, caché).           | Antes del paso 5, consultar `node_modules/next/dist/docs/` sobre Route Handlers. Verificado: `POST` no se cachea por defecto.                  |
| El endpoint `/api/contact` queda público y se puede llamar sin pasar por el formulario.                                     | Misma validación en servidor, límites y honeypot; el abuso real (rate limiting) queda fuera de alcance y se evalúa en otro spec.               |
| Los estilos de about chocan con clases ya migradas (`.btn.xl`, `.field`, `.kicker`) y alteran SPEC 01 o 02.                 | Comparar clases antes de pegar, no sobrescribir las existentes y revisar `/games`, `/auth`, `/leaderboard` y `/` tras el paso 2.               |
| Doble envío por clics repetidos o reintentos rápidos.                                                                       | Botón deshabilitado mientras la transición está pendiente.                                                                                     |

## What is **not** in this spec

- Rate limiting, captcha o anti-spam más allá del honeypot.
- Dominio propio verificado en Resend.
- Persistencia de mensajes, panel de administración o correo de confirmación al visitante.
- Correo en HTML, plantillas o adjuntos.
- i18n y tests automatizados.

Cada uno de estos, si se implementa, va en su propio spec.
