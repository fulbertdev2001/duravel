import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate, useMotionValue, useTransform } from 'framer-motion';
import Icon from './Icon';

/* Comparateur Avant / Après : glisser, clic, clavier. Démo automatique à l'entrée. */
export default function BeforeAfter({ before, after, alt = '', className = '', hint = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  const pos = useMotionValue(50);
  const clip = useTransform(pos, (v) => `inset(0 0 0 ${v}%)`);
  const left = useTransform(pos, (v) => `${v}%`);
  const [val, setVal] = useState(50);
  const dragging = useRef(false);
  const touched = useRef(false);

  useEffect(() => pos.on('change', (v) => setVal(Math.round(v))), [pos]);

  useEffect(() => {
    if (!inView || !hint) return;
    const seq = async () => {
      await new Promise((r) => setTimeout(r, 300));
      for (const to of [18, 82, 50]) {
        if (touched.current) return;
        await animate(pos, to, { duration: 1.1, ease: [0.65, 0, 0.35, 1] });
      }
    };
    seq();
  }, [inView, hint, pos]);

  const setFromEvent = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    pos.set(Math.max(0, Math.min(100, (x / r.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className={`ba ${className}`}
      data-cursor="Glisser"
      onPointerDown={(e) => {
        touched.current = true;
        dragging.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setFromEvent(e);
      }}
      onPointerMove={(e) => dragging.current && setFromEvent(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <img className="ba__img" src={before} alt={`Avant — ${alt}`} draggable="false" />
      <motion.img className="ba__img ba__after" src={after} alt={`Après — ${alt}`} style={{ clipPath: clip }} draggable="false" />
      <span className="ba__tag ba__tag--before">Avant</span>
      <span className="ba__tag ba__tag--after">Après</span>
      <motion.div className="ba__handle" style={{ left }}>
        <span className="ba__knob">
          <Icon name="drag" size={20} stroke={2} />
        </span>
      </motion.div>
      <input
        className="ba__range"
        type="range"
        min="0"
        max="100"
        value={val}
        aria-label="Comparer avant et après"
        onChange={(e) => {
          touched.current = true;
          pos.set(Number(e.target.value));
        }}
      />
    </div>
  );
}
