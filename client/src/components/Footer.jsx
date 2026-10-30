import { Link } from 'react-router-dom';
import { useScrollProgress } from './motion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useSite, telHref } from '../lib/site';
import { LogoMark } from './Logo';
import Icon from './Icon';
import { scrollToTarget } from '../lib/smooth';

export default function Footer() {
  const { data } = useSite();
  const s = data.settings;
  const ref = useRef(null);
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-40%', '0%']);
  const socials = Object.entries(s.social || {}).filter(([, v]) => v);

  return (
    <footer className="footer" ref={ref}>
      <motion.div className="footer__inner" style={{ y }}>
        <div className="footer__top">
          <div className="footer__brand">
            <LogoMark size={120} />
            <p>{s.brand?.baseline}</p>
          </div>
          <div className="footer__cols">
            <div>
              <h4>Navigation</h4>
              <Link to="/">Accueil</Link>
              <Link to="/#expertises">Expertises</Link>
              <Link to="/realisations">Réalisations</Link>
              <Link to="/#methode">Méthode</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div>
              <h4>Expertises</h4>
              {(data.services || []).map((sv) => (
                <Link key={sv.id} to="/#expertises">
                  {sv.title}
                </Link>
              ))}
            </div>
            <div>
              <h4>Contact</h4>
              {s.contact?.phone && (
                <a href={telHref(s.contact.phone)}>
                  <Icon name="phone" size={15} /> {s.contact.phone}
                </a>
              )}
              {s.contact?.email && (
                <a href={`mailto:${s.contact.email}`}>
                  <Icon name="mail" size={15} /> {s.contact.email}
                </a>
              )}
              {s.contact?.address && (
                <span>
                  <Icon name="pin" size={15} /> {s.contact.address}
                </span>
              )}
              {s.contact?.hours && (
                <span>
                  <Icon name="clock" size={15} /> {s.contact.hours}
                </span>
              )}
              {socials.length > 0 && (
                <div className="footer__social">
                  {socials.map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noreferrer" aria-label={k}>
                      <Icon name={k} size={18} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="footer__giant" aria-hidden="true">
          <span>SEBAS</span>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {s.brand?.name}. Tous droits réservés.</span>
          <span>{s.brand?.tagline}</span>
          <button onClick={() => scrollToTarget(0)} className="footer__top-btn" data-cursor="Haut">
            Haut de page ↑
          </button>
        </div>
      </motion.div>
    </footer>
  );
}
