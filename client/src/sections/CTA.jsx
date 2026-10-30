import { FadeUp, SplitReveal, Marquee } from '../components/motion';
import ContactForm from '../components/ContactForm';
import Icon from '../components/Icon';
import { telHref } from '../lib/site';

export default function CTA({ s, id = 'contact' }) {
  const c = s.cta || {};
  const ct = s.contact || {};
  return (
    <section id={id} className="section section--red cta">
      <Marquee items={['Devis gratuit', 'Étude technique', 'Conseil matériaux', 'Suivi personnalisé']} speed={60} className="marquee--light" />
      <div className="wrap cta__grid">
        <div className="cta__text">
          <FadeUp as="p" className="eyebrow">
            {c.eyebrow}
          </FadeUp>
          <SplitReveal text={c.title} className="h1" stagger={0.05} />
          <FadeUp as="p" className="lead" delay={0.1}>
            {c.text}
          </FadeUp>
          <div className="cta__contacts">
            {ct.phone && (
              <a href={telHref(ct.phone)} className="cta__contact" data-cursor="Appeler">
                <Icon name="phone" size={20} />
                <span>
                  <small>Téléphone</small>
                  {ct.phone}
                </span>
              </a>
            )}
            {ct.email && (
              <a href={`mailto:${ct.email}`} className="cta__contact" data-cursor="Écrire">
                <Icon name="mail" size={20} />
                <span>
                  <small>E-mail</small>
                  {ct.email}
                </span>
              </a>
            )}
            {ct.address && (
              <div className="cta__contact">
                <Icon name="pin" size={20} />
                <span>
                  <small>Adresse</small>
                  {ct.address}
                </span>
              </div>
            )}
            {ct.zone && (
              <div className="cta__contact">
                <Icon name="pin" size={20} />
                <span>
                  <small>Zone d’intervention</small>
                  {ct.zone}
                </span>
              </div>
            )}
          </div>
        </div>
        <FadeUp delay={0.2}>
          <ContactForm />
        </FadeUp>
      </div>
    </section>
  );
}
