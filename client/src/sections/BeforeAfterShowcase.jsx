import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BeforeAfter from '../components/BeforeAfter';
import { FadeUp, SplitReveal, ease } from '../components/motion';
import Icon from '../components/Icon';

export default function BeforeAfterShowcase({ projects = [] }) {
  const list = projects.filter((p) => p.before_img && (p.after_img || p.cover));
  const [i, setI] = useState(0);
  if (!list.length) return null;
  const p = list[i];
  return (
    <section id="avant-apres" className="section section--marble showcase">
      <div className="wrap">
        <div className="section-head section-head--row">
          <div>
            <FadeUp as="p" className="eyebrow eyebrow--red">
              Avant / Après
            </FadeUp>
            <SplitReveal text="La transformation, sans retouche." className="h2" />
          </div>
          <div className="tabs" role="tablist">
            {list.map((pp, k) => (
              <button key={pp.id} role="tab" aria-selected={k === i} className={k === i ? 'is-on' : ''} onClick={() => setI(k)}>
                {k === i && <motion.span layoutId="tab-pill" className="tabs__pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span>{pp.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="showcase__grid">
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              className="showcase__slider"
              initial={{ opacity: 0, clipPath: 'inset(8% 8% 8% 8% round 24px)' }}
              animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.9, ease }}
            >
              <BeforeAfter before={p.before_img} after={p.after_img || p.cover} alt={p.title} />
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.aside
              key={p.id}
              className="showcase__info"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease }}
            >
              <span className="showcase__n">
                {String(i + 1).padStart(2, '0')}
                <small>/{String(list.length).padStart(2, '0')}</small>
              </span>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <ul className="taglist">
                {(p.tags || []).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <Link to={`/realisations/${p.slug}`} className="link-arrow">
                Voir le projet complet <Icon name="arrow" size={18} />
              </Link>
              <p className="showcase__help">
                <Icon name="drag" size={16} /> Glissez le curseur pour comparer
              </p>
            </motion.aside>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
