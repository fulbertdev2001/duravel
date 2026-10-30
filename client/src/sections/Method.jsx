import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { FadeUp, SplitReveal, useScrollProgress } from '../components/motion';

/* Méthode : section épinglée, la ligne se trace et active chaque étape au scroll */
export default function Method({ s }) {
  const m = s.method || {};
  const steps = m.steps || [];
  const ref = useRef(null);
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start start', 'end end'] });
  const line = useTransform(scrollYProgress, [0.05, 0.9], [0, 1]);
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(((v - 0.05) / 0.85) * steps.length))));
  });

  return (
    <section id="methode" ref={ref} className="method section--dark" style={{ height: `${100 + steps.length * 45}vh` }}>
      <div className="method__sticky">
        <div className="wrap">
          <div className="section-head">
            <FadeUp as="p" className="eyebrow eyebrow--red">
              {m.eyebrow}
            </FadeUp>
            <SplitReveal text={m.title || ''} className="h2" />
          </div>
          <div className="method__line">
            <motion.span style={{ scaleX: line }} />
          </div>
          <div className="method__steps" style={{ '--n': steps.length }}>
            {steps.map((st, i) => (
              <div key={i} className={`step ${i <= active ? 'is-on' : ''} ${i === active ? 'is-current' : ''}`}>
                <span className="step__dot" />
                <span className="step__n">Étape {String(i + 1).padStart(2, '0')}</span>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </div>
            ))}
          </div>
          <div className="method__big" aria-hidden="true">
            {String(active + 1).padStart(2, '0')}
          </div>
        </div>
      </div>
    </section>
  );
}
