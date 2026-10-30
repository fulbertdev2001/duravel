import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import Logo from './Logo';
import Icon from './Icon';
import { Magnetic, ease } from './motion';
import { useSite, telHref } from '../lib/site';
import { lockScroll } from '../lib/smooth';

const LINKS = [
  { to: '/', label: 'Accueil', img: 'hero' },
  { to: '/#expertises', label: 'Expertises', img: 0 },
  { to: '/realisations', label: 'Réalisations', img: 1 },
  { to: '/#avant-apres', label: 'Avant / Après', img: 'before' },
  { to: '/#methode', label: 'Méthode', img: 2 },
  { to: '/contact', label: 'Contact', img: 'founder' },
];

export default function Nav() {
  const { data } = useSite();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoverImg, setHoverImg] = useState(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 300 && y > prev && !open);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  const s = data.settings;
  const projects = data.projects || [];
  const imgFor = (k) => {
    if (k === 'hero') return s.hero?.image;
    if (k === 'founder') return s.founder?.image;
    if (k === 'before') return projects[0]?.before_img;
    return projects[k % Math.max(1, projects.length)]?.cover || data.services?.[k]?.image || s.hero?.image;
  };

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}
        animate={{ y: hidden ? '-110%' : 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <Link to="/" className="nav__brand" aria-label="Duravel Building — accueil">
          <Logo compact light />
        </Link>
        <nav className="nav__links" aria-label="Navigation principale">
          {LINKS.slice(1, 5).map((l) => (
            <Link key={l.to} to={l.to} className="nav__link">
              <span data-text={l.label}>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="nav__actions">
          {s.contact?.phone && (
            <a className="nav__phone" href={telHref(s.contact.phone)}>
              <Icon name="phone" size={16} /> {s.contact.phone}
            </a>
          )}
          <Magnetic>
            <Link to="/contact" className="btn btn--red btn--sm">
              Devis gratuit
            </Link>
          </Magnetic>
          <button className={`burger ${open ? 'is-open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <span />
            <span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 48px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 48px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 48px) 44px)' }}
            transition={{ duration: 0.9, ease }}
          >
            <div className="menu__preview" aria-hidden="true">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={hoverImg ?? 'hero'}
                  src={imgFor(hoverImg ?? 'hero')}
                  initial={{ opacity: 0, scale: 1.15, clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ opacity: 1, scale: 1, clipPath: 'inset(0 0 0% 0)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease }}
                  alt=""
                />
              </AnimatePresence>
            </div>
            <ul className="menu__list">
              {LINKS.map((l, i) => (
                <li key={l.to} className="menu__item">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.8, ease, delay: 0.25 + i * 0.06 }}
                  >
                    <Link to={l.to} onMouseEnter={() => setHoverImg(l.img)} onClick={() => setOpen(false)}>
                      <small>{String(i + 1).padStart(2, '0')}</small>
                      {l.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div
              className="menu__foot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {s.contact?.email && <a href={`mailto:${s.contact.email}`}>{s.contact.email}</a>}
              {s.contact?.phone && <a href={telHref(s.contact.phone)}>{s.contact.phone}</a>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
