'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type {
  ContactFormValues as FormValues,
  ContactResult,
} from '@/app/api/contact/types';

const CONTACT_ENDPOINT = '/api/contact';

const EMPTY_VALUES: FormValues = { name: '', email: '', message: '' };
const SHAKE_DURATION_MS = 400;

// Visually hidden but still in the DOM so bots fill it in.
const HONEYPOT_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '-9999px',
  width: 1,
  height: 1,
  overflow: 'hidden',
};

type Phase =
  | { kind: 'form' }
  | { kind: 'success'; name: string }
  | { kind: 'error' };

export function ContactForm(): React.ReactElement {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [phase, setPhase] = useState<Phase>({ kind: 'form' });
  const [isPending, startTransition] = useTransition();
  const [shake, setShake] = useState(false);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  }, []);

  const setField =
    (field: keyof FormValues) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ): void => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const triggerShake = (): void => {
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    setShake(true);
    shakeTimer.current = setTimeout(() => setShake(false), SHAKE_DURATION_MS);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (isPending) return;
    if (
      !values.name.trim() ||
      !values.email.trim() ||
      !values.message.trim()
    ) {
      triggerShake();
      return;
    }

    const website = new FormData(event.currentTarget).get('website');
    startTransition(async () => {
      try {
        const response = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
            website: typeof website === 'string' ? website : '',
          }),
        });
        const result = (await response.json()) as ContactResult;
        if (result.status === 'success') {
          setPhase({ kind: 'success', name: result.name || values.name.trim() });
        } else if (result.status === 'invalid') {
          triggerShake();
        } else {
          setPhase({ kind: 'error' });
        }
      } catch {
        setPhase({ kind: 'error' });
      }
    });
  };

  const backToForm = (): void => setPhase({ kind: 'form' });

  const reset = (): void => {
    setPhase({ kind: 'form' });
    setValues(EMPTY_VALUES);
  };

  return (
    <form
      className={'contact-form' + (shake ? ' shake' : '')}
      onSubmit={handleSubmit}
      noValidate
    >
      {phase.kind === 'form' ? (
        <>
          <div className="field">
            <label htmlFor="contact-name">NOMBRE</label>
            <input
              id="contact-name"
              name="name"
              value={values.name}
              onChange={setField('name')}
              placeholder="px_kai"
            />
          </div>
          <div className="field">
            <label htmlFor="contact-email">CORREO ELECTRÓNICO</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={values.email}
              onChange={setField('email')}
              placeholder="jugador@vault.gg"
            />
          </div>
          <div className="field">
            <label htmlFor="contact-message">MENSAJE</label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={values.message}
              onChange={setField('message')}
              placeholder="Cuéntanos qué tienes en mente…"
            />
          </div>
          <div style={HONEYPOT_STYLE} aria-hidden="true">
            <label htmlFor="contact-website">WEBSITE</label>
            <input
              id="contact-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>
          <button
            className="btn xl press"
            type="submit"
            style={{ width: '100%' }}
            disabled={isPending}
          >
            {isPending ? 'ENVIANDO…' : '▶ ENVIAR MENSAJE'}
          </button>
        </>
      ) : phase.kind === 'error' ? (
        <div className="terminal-success">
          <div className="term-bar">
            <span className="dot r" />
            <span className="dot y" />
            <span className="dot g" />
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message
              --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line err">[ERR] No se pudo transmitir el paquete.</div>
            <div className="line success">
              &gt; ERROR AL ENVIAR EL MENSAJE. INTÉNTALO DE NUEVO.
              <span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={backToForm}>
                REINTENTAR
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="terminal-success">
          <div className="term-bar">
            <span className="dot r" />
            <span className="dot y" />
            <span className="dot g" />
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message
              --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS,{' '}
              {phase.name.toUpperCase()}.<span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={reset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
