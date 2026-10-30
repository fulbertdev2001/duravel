import { motion } from 'framer-motion';
import { FadeUp, ParallaxImage, ScrollWords, Counter, Marquee } from '../components/motion';

export default function Vision({ s }) {
  const v = s.vision || {};
  return (
    <section id="vision" className="section section--light vision">
      <Marquee items={s.marquee || []} className="marquee--outline" speed={30} />
      <div className="wrap vision__grid">
        <div className="vision__text">
          <FadeUp as="p" className="eyebrow eyebrow--red">
            {v.eyebrow}
          </FadeUp>
          <ScrollWords text={v.title} className="h2" />
          <FadeUp as="p" className="lead" delay={0.1}>
            {v.text}
          </FadeUp>
        </div>
        <div className="vision__media">
          <ParallaxImage src={v.image} alt="Détail de finition" className="vision__img" strength={10} />
          <motion.div
            className="vision__badge"
            initial={{ rotate: -40, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <svg viewBox="0 0 120 120" className="spin">
              <defs>
                <path id="circ" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
              </defs>
              <text>
                <textPath href="#circ">EXCELLENCE TECHNIQUE • LE STYLE EN PLUS • </textPath>
              </text>
            </svg>
            <span>DB</span>
          </motion.div>
        </div>
      </div>

      <div className="wrap pillars">
        {(v.pillars || []).map((p, i) => (
          <FadeUp key={i} className="pillar" delay={i * 0.12}>
            <span className="pillar__n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
            <span className="pillar__line" />
          </FadeUp>
        ))}
      </div>

      {(s.stats || []).length > 0 && (
        <div className="wrap stats">
          {s.stats.map((st, i) => (
            <FadeUp key={i} className="stat" delay={i * 0.1}>
              <strong>
                <Counter value={st.value} suffix={st.suffix} />
              </strong>
              <span>{st.label}</span>
            </FadeUp>
          ))}
        </div>
      )}
    </section>
  );
}
