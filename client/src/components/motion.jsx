import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useAnimationFrame,
  animate,
} from 'framer-motion';

export const ease = [0.76, 0, 0.24, 1];
export const easeOut = [0.16, 1, 0.3, 1];

/* Titre découpé en mots qui montent depuis un masque */
export function SplitReveal({ text = '', as = 'h2', className = '', delay = 0, stagger = 0.05, once = true, play }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '0px 0px -12% 0px' });
  const show = play === undefined ? inView : play && inView;
  const Tag = motion[as] || motion.h2;
  const words = text.split(' ');
  return (
    <Tag ref={ref} className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span className="split__mask" key={i} aria-hidden="true">
          <motion.span
            className="split__word"
            initial={{ y: '115%', rotate: 4 }}
            animate={show ? { y: 0, rotate: 0 } : { y: '115%', rotate: 4 }}
            transition={{ duration: 1, ease: easeOut, delay: delay + i * stagger }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

/* Fondu + translation à l'entrée dans le viewport */
export function FadeUp({ children, delay = 0, y = 40, className = '', as = 'div', ...rest }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1, ease: easeOut, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Paragraphe dont les mots s'éclairent au fil du scroll */
export function ScrollWords({ text = '', className = '' }) {
  const ref = useRef(null);
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start 85%', 'end 45%'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={`scrollwords ${className}`}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}
function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span className="scrollwords__w">
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </span>
  );
}

/* Image avec révélation par masque + parallaxe interne */
export function ParallaxImage({ src, alt = '', className = '', strength = 12, reveal = true, cursor, onClick }) {
  const ref = useRef(null);
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <motion.div
      ref={ref}
      className={`pimg ${className}`}
      data-cursor={cursor}
      onClick={onClick}
      initial={reveal ? { clipPath: 'inset(100% 0% 0% 0%)' } : false}
      whileInView={reveal ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.3, ease }}
    >
      <motion.img src={src} alt={alt} style={{ y, scale: 1 + strength / 50 }} loading="lazy" draggable="false" />
    </motion.div>
  );
}

/* Bouton/élément magnétique */
export function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });
  return (
    <motion.div
      ref={ref}
      className={`magnetic ${className}`}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* Bandeau défilant infini, accéléré par la vitesse de scroll */
export function Marquee({ items = [], speed = 40, className = '', reverse = false, separator = '✦' }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(0, { damping: 50, stiffness: 400 });
  const lastY = useRef(0);
  const dir = useRef(reverse ? 1 : -1);
  const trackRef = useRef(null);
  const [w, setW] = useState(1);

  useEffect(() => {
    const measure = () => trackRef.current && setW(trackRef.current.scrollWidth / 2 || 1);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [items]);

  useAnimationFrame((_t, delta) => {
    const y = scrollY.get();
    const v = y - lastY.current;
    lastY.current = y;
    velocity.set(v);
    const boost = 1 + Math.min(6, Math.abs(velocity.get()) / 6);
    let next = baseX.get() + dir.current * speed * (delta / 1000) * boost;
    if (next <= -w) next += w;
    if (next > 0) next -= w;
    baseX.set(next);
  });

  const row = items.flatMap((it, i) => [
    <span className="marquee__item" key={`i${i}`}>
      {it}
    </span>,
    <span className="marquee__sep" key={`s${i}`}>
      {separator}
    </span>,
  ]);
  return (
    <div className={`marquee ${className}`}>
      <motion.div className="marquee__track" ref={trackRef} style={{ x: baseX }}>
        <div className="marquee__row">{row}</div>
        <div className="marquee__row" aria-hidden="true">
          {row}
        </div>
      </motion.div>
    </div>
  );
}

/* Compteur animé */
export function Counter({ value = 0, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, Number(value) || 0, { duration, ease: easeOut, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, value, duration]);
  return (
    <span ref={ref}>
      {String(v).padStart(2, '0')}
      {suffix}
    </span>
  );
}

/* Rideau de transition entre pages */
export function PageShell({ children, className = '' }) {
  return (
    <motion.main className={`page ${className}`} initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}>
      <motion.div
        className="curtain"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.9, ease, delay: 0.15 } }}
        exit={{ scaleY: 1, transition: { duration: 0.7, ease } }}
        style={{ originY: 0 }}
      />
      <motion.div
        className="curtain curtain--red"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.9, ease } }}
        exit={{ scaleY: 1, transition: { duration: 0.7, ease, delay: 0.1 } }}
        style={{ originY: 0 }}
      />
      {children}
    </motion.main>
  );
}

/* Progression de scroll calculée en JS (désactive l'accélération ScrollTimeline
   native de framer-motion, incohérente sur certains navigateurs mobiles) */
export function useScrollProgress(opts) {
  const { scrollYProgress } = useScroll(opts);
  return useTransform(scrollYProgress, (v) => v);
}
