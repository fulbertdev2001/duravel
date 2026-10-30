import { MotionMedia } from '../components/Media';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useVelocity, useSpring, useInView } from 'framer-motion';
import Icon from '../components/Icon';
import { ease, useScrollProgress } from '../components/motion';

/* Réalisations : défilement horizontal épinglé, cartes à parallaxe et skew à la vitesse */
export default function ProjectsRail({ projects = [] }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [dims, setDims] = useState({ distance: 0, height: 0 });
  const [mobile, setMobile] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const m = window.innerWidth < 860;
      setMobile(m);
      if (!trackRef.current) return;
      const distance = Math.max(0, trackRef.current.scrollWidth - window.innerWidth);
      setDims({ distance, height: distance + window.innerHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    trackRef.current && ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [projects.length]);

  const scrollYProgress = useScrollProgress({ target: sectionRef, offset: ['start start', 'end end'] });
  const { scrollY } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], [0, -dims.distance]);
  const vel = useVelocity(scrollY);
  const skew = useSpring(useTransform(vel, [-3000, 0, 3000], [4, 0, -4], { clamp: true }), { stiffness: 200, damping: 40 });
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const revealed = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      id="realisations"
      ref={sectionRef}
      className={`rail section--dark ${mobile ? 'rail--mobile' : ''}`}
      style={!mobile ? { height: dims.height || '300vh' } : undefined}
    >
      <div className="rail__sticky">
        <div className="rail__head wrap">
          <p className="eyebrow eyebrow--red">Portfolio</p>
          <div className="rail__progress">
            <motion.span style={{ scaleX: bar }} />
          </div>
          <span className="rail__count">{String(projects.length).padStart(2, '0')} projets</span>
        </div>
        <motion.div ref={trackRef} className="rail__track" style={!mobile ? { x, skewX: skew } : undefined}>
          <div className="rail__intro">
            <h2 className="rail__giant">
              <span>Nos</span>
              <span className="serif">réalisations</span>
            </h2>
            <p>
              Chaque chantier raconte une transformation. Plongez dans nos projets, de l’état d’origine au dernier joint.
            </p>
            <span className="rail__hint">
              <Icon name="arrow" size={18} /> Faites défiler
            </span>
          </div>

          {projects.map((p, i) => (
            <RailCard key={p.id} p={p} i={i} progress={scrollYProgress} total={projects.length} revealed={revealed} />
          ))}

          <Link to="/contact" className="rail__cta" data-cursor="Écrire">
            <span className="rail__cta-ring">
              <Icon name="arrowUpRight" size={42} />
            </span>
            <strong>Votre projet ici ?</strong>
            <span>Parlons de votre future rénovation</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function RailCard({ p, i, progress, total, revealed }) {
  const center = (i + 1) / (total + 1.5);
  const imgX = useTransform(progress, [center - 0.5, center + 0.5], ['-8%', '8%']);
  return (
    <Link to={`/realisations/${p.slug}`} className="rcard" data-cursor="Explorer">
      <motion.div
        className="rcard__media"
        initial={{ clipPath: 'inset(0 0 100% 0)' }}
        animate={revealed ? { clipPath: 'inset(0 0 0% 0)' } : undefined}
        transition={{ duration: 1.3, ease, delay: 0.2 + i * 0.15 }}
      >
        <MotionMedia src={p.cover} alt={p.title} lazy={false} style={{ x: imgX }} />
        {p.before_img && (
          <div className="rcard__before">
            <img src={p.before_img} alt="" />
            <span>Avant</span>
          </div>
        )}
        <span className="rcard__index">{String(i + 1).padStart(2, '0')}</span>
      </motion.div>
      <div className="rcard__info">
        <div>
          <span className="rcard__cat">{[p.category, p.year, p.location].filter(Boolean).join(' · ')}</span>
          <h3>{p.title}</h3>
        </div>
        <span className="rcard__arrow">
          <Icon name="arrowUpRight" size={22} />
        </span>
      </div>
      <div className="rcard__tags">
        {(p.tags || []).slice(0, 3).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </Link>
  );
}
