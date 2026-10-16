import type { Metadata } from 'next';
import { AboutShell } from '@/components/about/about-shell';
import { ContactForm } from '@/components/about/contact-form';
import {
  HighlightIcon,
  type HighlightKind,
} from '@/components/about/highlight-icon';

export const metadata: Metadata = {
  title: 'Acerca de | Arcade Vault',
  description: 'La misión detrás de Arcade Vault y cómo contactarnos.',
};

type Highlight = {
  kind: HighlightKind;
  text: string;
  color: 'cyan' | 'magenta' | 'green';
};

const HIGHLIGHTS: Highlight[] = [
  { kind: 'HEART', text: 'HECHO CON ❤️ PARA JUGADORES', color: 'magenta' },
  {
    kind: 'BROWSER',
    text: 'JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR',
    color: 'cyan',
  },
  {
    kind: 'PLANT',
    text: 'PROYECTO EN CONSTANTE CRECIMIENTO',
    color: 'green',
  },
];

const DIVIDER_PIXELS = Array.from({ length: 24 }, (_, i) => i);

export default function AboutPage(): React.ReactElement {
  return (
    <AboutShell>
      <section className="about-hero">
        <div className="kicker pixel neon-yellow">▸ ACERCA DE</div>
        <h1 className="about-title">ACERCA DE ARCADE VAULT</h1>
        <p className="about-mission">
          ARCADE VAULT nació del amor por los videojuegos clásicos. Nuestra
          misión es preservar y celebrar los arcades que definieron una
          generación, haciéndolos accesibles para todos, en cualquier lugar y
          sin costo.
        </p>

        <div className="highlight-row">
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={h.kind}
              className={`highlight ${h.color}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <HighlightIcon kind={h.kind} />
              <div className="hl-text pixel">{h.text}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="about-divider reveal" aria-hidden="true">
        <div className="div-bar" />
        <div className="div-pixels">
          {DIVIDER_PIXELS.map((i) => (
            <span key={i} style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="div-bar" />
      </div>

      <section className="about-contact reveal">
        <div className="contact-grid">
          <div className="contact-intro">
            <div className="kicker pixel neon-cyan">▸ CONTACTO</div>
            <h2 className="contact-title">CONTÁCTANOS</h2>
            <p className="contact-sub">
              ¿Tienes alguna sugerencia, quieres proponer un juego, o
              simplemente quieres saludar? Escríbenos.
            </p>
            <div className="contact-tips">
              <div className="tip">
                <span className="tip-led" />
                RESPUESTA EN 24-48H
              </div>
              <div className="tip">
                <span className="tip-led y" />
                SUGERENCIAS BIENVENIDAS
              </div>
              <div className="tip">
                <span className="tip-led m" />
                SIN SPAM, JAMÁS
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </AboutShell>
  );
}
