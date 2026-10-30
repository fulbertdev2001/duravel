import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { SplitReveal, Magnetic, easeOut } from '../components/motion';
import Icon from '../components/Icon';
import Media, { isVideo } from '../components/Media';
import { scrollToTarget } from '../lib/smooth';

/* Hero immersif : l'image (carte à droite) s'ouvre en plein écran au scroll,
   le titre s'efface, puis la signature apparaît. */
export default function Hero({ s, intro }) {
  const ref = useRef(null);
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches);
  useEffect(() => {
    const m = window.matchMedia('(max-width: 860px)');
    const f = () => setMobile(m.matches);
    f();
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);

  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // transformation JS explicite : évite l'accélération ScrollTimeline native, instable sur mobile
  const p = useTransform(raw, (v) => v);
  const start = mobile ? [74, 5, 3, 5, 20] : [13, 6, 11, 54, 28];
  const clipPath = useTransform(p, [0, 0.55], [
    `inset(${start[0]}% ${start[1]}% ${start[2]}% ${start[3]}% round ${start[4]}px)`,
    'inset(0% 0% 0% 0% round 0px)',
  ]);
  const imgScale = useTransform(p, [0, 0.7], [1.06, 1]);
  const contentY = useTransform(p, [0, 0.4], ['0%', '-30%']);
  const contentO = useTransform(p, [0, 0.32], [1, 0]);
  const shade = useTransform(p, [0.3, 0.7], [0, 0.55]);
  const sigO = useTransform(p, [0.55, 0.75, 0.95], [0, 1, 1]);
  const sigY = useTransform(p, [0.55, 0.8], [60, 0]);
  const sigScale = useTransform(p, [0.55, 1], [0.94, 1.04]);

  // inclinaison au mouvement de souris
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [1.5, -1.5]), { stiffness: 80, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-2, 2]), { stiffness: 80, damping: 20 });

  const hero = s.hero || {};
  const src = hero.video || hero.image;
  const video = isVideo(src);
  // photo verticale sur écran large : affichée entière (nette) sur un fond flouté, au lieu d'être agrandie et recadrée
  const [portrait, setPortrait] = useState(false);
  const contain = portrait && !mobile;
  // la photo suit le centre de la carte (à droite) puis se recentre pendant l'ouverture
  const fgX = useTransform(p, [0, 0.55], contain ? ['24vw', '0vw'] : ['0vw', '0vw']);
  const words = (s.marquee || []).slice(0, 3);

  return (
    <section
      ref={ref}
      className="hero"
      onPointerMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      <div className="hero__sticky">
        <motion.div className="hero__media" style={{ clipPath }}>
          <motion.div className="hero__tilt" style={{ rotateX: rx, rotateY: ry, scale: imgScale }}>
            {contain && !video && <img className="hero__bg" src={src} alt="" aria-hidden="true" />}
            <motion.div
              className="hero__fg"
              style={{ x: fgX }}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={intro ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1.6, ease: easeOut, delay: 0.15 }}
            >
              <Media
                src={src}
                alt="Salle de bain rénovée par Duravel Building"
                lazy={false}
                className={contain ? 'is-contain' : ''}
                onMeta={(w, h) => setPortrait(h > w * 1.05)}
              />
            </motion.div>
          </motion.div>
          <motion.div className="hero__shade" style={{ opacity: shade }} />
        </motion.div>

        <motion.div className="hero__content wrap" style={{ y: contentY, opacity: contentO }}>
          <motion.p
            className="eyebrow eyebrow--red"
            initial={{ opacity: 0, x: -20 }}
            animate={intro ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {hero.eyebrow}
          </motion.p>
          <SplitReveal as="h1" text={hero.title} className="hero__title" play={intro} delay={0.3} stagger={0.07} />
          <motion.p
            className="hero__text"
            initial={{ opacity: 0, y: 20 }}
            animate={intro ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1, duration: 1, ease: easeOut }}
          >
            {hero.text}
          </motion.p>
          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={intro ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2, duration: 1, ease: easeOut }}
          >
            <Magnetic>
              <Link to="/contact" className="btn btn--red btn--lg">
                {hero.cta || 'Demander un devis'} <Icon name="arrow" size={18} />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link to="/realisations" className="btn btn--ghost btn--lg">
                Nos réalisations
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div className="hero__signature" style={{ opacity: sigO, y: sigY, scale: sigScale }}>
          <span className="serif">Le style</span> <span>en plus.</span>
          <small>{words.join(' • ')}</small>
        </motion.div>

        <motion.button
          className="hero__scroll"
          onClick={() => scrollToTarget('#vision')}
          style={{ opacity: contentO }}
          initial={{ opacity: 0 }}
          animate={intro ? { opacity: 1 } : {}}
          transition={{ delay: 1.6 }}
          aria-label="Défiler"
        >
          <span className="hero__scroll-line" />
          Scroll
        </motion.button>

        <motion.div className="hero__meta wrap" style={{ opacity: contentO }}>
          <span>{words.join(' • ')}</span>
          <span>{s.brand?.baseline}</span>
        </motion.div>
      </div>
    </section>
  );
}
