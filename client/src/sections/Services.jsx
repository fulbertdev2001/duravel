import { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { FadeUp, SplitReveal, ease } from '../components/motion';
import Icon from '../components/Icon';

/* Expertises : lignes XXL, image flottante qui suit la souris, accordéon de détails */
export default function Services({ services = [] }) {
  const [hover, setHover] = useState(null);
  const [open, setOpen] = useState(0);
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 20 });
  const sy = useSpring(y, { stiffness: 150, damping: 20 });

  return (
    <section id="expertises" className="section section--dark services">
      <div className="wrap">
        <div className="section-head">
          <FadeUp as="p" className="eyebrow eyebrow--red">
            02 / Domaines d’intervention
          </FadeUp>
          <SplitReveal text="Trois métiers, une seule exigence." className="h2" />
        </div>

        <div
          ref={ref}
          className="svc-list"
          onPointerMove={(e) => {
            const r = ref.current.getBoundingClientRect();
            x.set(e.clientX - r.left);
            y.set(e.clientY - r.top);
          }}
          onPointerLeave={() => setHover(null)}
        >
          <motion.div className="svc-float" style={{ x: sx, y: sy }} aria-hidden="true">
            <AnimatePresence>
              {hover !== null && services[hover]?.image && (
                <motion.img
                  key={hover}
                  src={services[hover].image}
                  alt=""
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7, rotate: 6 }}
                  transition={{ duration: 0.5, ease }}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {services.map((sv, i) => (
            <FadeUp key={sv.id} className={`svc ${open === i ? 'is-open' : ''}`} delay={i * 0.08}>
              <button
                className="svc__row"
                onMouseEnter={() => setHover(i)}
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                data-cursor={open === i ? 'Fermer' : 'Ouvrir'}
              >
                <span className="svc__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="svc__icon">
                  <Icon name={sv.icon} size={30} />
                </span>
                <span className="svc__title">{sv.title}</span>
                <span className="svc__tag">{sv.tag}</span>
                <span className="svc__plus" />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    className="svc__body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                  >
                    <div className="svc__inner">
                      <p>{sv.summary}</p>
                      <ul>
                        {(sv.points || []).map((pt, k) => (
                          <motion.li
                            key={k}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + k * 0.06 }}
                          >
                            <Icon name="check" size={16} stroke={2.2} /> {pt}
                          </motion.li>
                        ))}
                      </ul>
                      {sv.image && <img className="svc__mobile-img" src={sv.image} alt="" loading="lazy" />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
