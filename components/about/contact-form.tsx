'use client';

import { useEffect, useRef, useState } from 'react';

type FormValues = {
  name: string;
  email: string;
  message: string;
};

const EMPTY_VALUES: FormValues = { name: '', email: '', message: '' };
const SHAKE_DURATION_MS = 400;

export function ContactForm(): React.ReactElement {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [sentName, setSentName] = useState<string | null>(null);
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
    const name = values.name.trim();
    if (!name || !values.email.trim() || !values.message.trim()) {
      triggerShake();
      return;
    }
    setSentName(name);
  };

  const reset = (): void => {
    setSentName(null);
    setValues(EMPTY_VALUES);
  };

  return (
    <form
      className={'contact-form' + (shake ? ' shake' : '')}
      onSubmit={handleSubmit}
      noValidate
    >
      {sentName === null ? (
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
          <button className="btn xl press" type="submit" style={{ width: '100%' }}>
            ▶ ENVIAR MENSAJE
          </button>
        </>
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
              {sentName.toUpperCase()}.<span className="caret">_</span>
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
