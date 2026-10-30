import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FadeUp, SplitReveal, ParallaxImage, useScrollProgress } from '../components/motion';
import Icon from '../components/Icon';

/* La touche Duravel + le fondateur */
export default function Founder({ s }) {
  const t = s.touch || {};
  const f = s.founder || {};
  const ref = useRef(null);
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start end', 'end start'] });
  const y2 = useTransform(scrollYProgress, [0, 1], ['30%', '-30%']);
  const r2 = useTransform(scrollYProgress, [0, 1], [8, -4]);

  return (
    <section className="section section--light founder" ref={ref}>
      <div className="wrap founder__grid">
        <div className="founder__media">
          <ParallaxImage src={f.image} alt={f.name || 'Fondateur de Duravel Building'} className="founder__img" strength={8} />
          {f.image2 && (
            <motion.div className="founder__img2" style={{ y: y2, rotate: r2 }}>
              <img src={f.image2} alt="" loading="lazy" />
            </motion.div>
          )}
          <motion.div
            className="founder__label"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <strong>{f.name || s.brand?.name}</strong>
            <span>{f.role}</span>
          </motion.div>
        </div>

        <div className="founder__text">
          <FadeUp as="p" className="eyebrow eyebrow--red">
            {t.eyebrow}
          </FadeUp>
          <SplitReveal text={t.title} className="h2" stagger={0.035} />
          <FadeUp as="p" className="lead" delay={0.1}>
            {t.text}
          </FadeUp>
          <ul className="checks">
            {(t.checks || []).map((c, i) => (
              <FadeUp as="li" key={i} delay={0.15 + i * 0.1}>
                <span>
                  <Icon name="check" size={16} stroke={2.4} />
                </span>
                {c}
              </FadeUp>
            ))}
          </ul>
          {(f.journey || f.years) && (
            <FadeUp className="journey" delay={0.15}>
              {f.years && (
                <div className="journey__num">
                  <strong>{f.years}</strong>
                  <span>{f.yearsLabel}</span>
                </div>
              )}
              <div className="journey__body">
                {f.journey && <p>{f.journey}</p>}
                {(f.steps || []).length > 0 && (
                  <ol className="journey__steps">
                    {f.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                )}
              </div>
            </FadeUp>
          )}
          {f.quote && (
            <FadeUp as="blockquote" className="quote" delay={0.2}>
              <span className="quote__mark">“</span>
              <p className="serif">{f.quote}</p>
              {f.text && <footer>{f.text}</footer>}
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  );
}
