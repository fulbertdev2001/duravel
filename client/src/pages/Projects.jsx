import Media from '../components/Media';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSite } from '../lib/site';
import { PageShell, SplitReveal, FadeUp, ease } from '../components/motion';
import Icon from '../components/Icon';
import CTA from '../sections/CTA';

export default function Projects() {
  const { data } = useSite();
  const projects = data.projects || [];
  const cats = useMemo(() => ['Tous', ...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);
  const [cat, setCat] = useState('Tous');
  const list = cat === 'Tous' ? projects : projects.filter((p) => p.category === cat);

  return (
    <PageShell className="page--projects">
      <header className="phead wrap">
        <motion.p className="eyebrow eyebrow--red" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          Portfolio
        </motion.p>
        <SplitReveal as="h1" text="Nos réalisations" className="display" delay={0.6} />
        <FadeUp as="p" className="lead lead--muted" delay={0.9}>
          Des chantiers menés de la dépose aux finitions. Survolez, comparez, plongez dans le détail.
        </FadeUp>
        {cats.length > 2 && (
          <div className="filters">
            {cats.map((c) => (
              <button key={c} className={c === cat ? 'is-on' : ''} onClick={() => setCat(c)}>
                {c === cat && <motion.span layoutId="filter-pill" className="filters__pill" />}
                <span>{c}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <motion.div layout className="pgrid wrap">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div
              layout
              key={p.id}
              className="pgrid__item"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease, delay: 0.7 + i * 0.08 }}
            >
              <Link to={`/realisations/${p.slug}`} className="pcard" data-cursor="Explorer">
                <div className="pcard__media">
                  <Media className="pcard__after" src={p.cover} alt={p.title} />
                  {p.before_img && <img className="pcard__before" src={p.before_img} alt="" loading="lazy" />}
                  {p.before_img && <span className="pcard__hint">Survolez : avant</span>}
                </div>
                <div className="pcard__info">
                  <span className="pcard__n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h2>{p.title}</h2>
                    <p>{p.summary}</p>
                  </div>
                  <span className="pcard__arrow">
                    <Icon name="arrowUpRight" size={24} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <CTA s={data.settings} />
    </PageShell>
  );
}
