import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

/* Curseur personnalisé : point + anneau, avec label contextuel
   (data-cursor="Voir" sur n'importe quel élément). Désactivé au tactile. */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('');
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add('has-cursor');
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target.closest?.('[data-cursor], a, button, input, textarea, select, [role="button"]');
      setLabel(t?.getAttribute?.('data-cursor') || '');
      setHover(!!t);
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', d);
    window.addEventListener('pointerup', u);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', d);
      window.removeEventListener('pointerup', u);
      document.documentElement.classList.remove('has-cursor');
    };
  }, [x, y]);

  if (!enabled) return null;
  const big = !!label;
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} animate={{ scale: big ? 0 : down ? 0.6 : 1 }} />
      <motion.div
        className={`cursor-ring ${big ? 'is-label' : ''}`}
        style={{ x: sx, y: sy }}
        animate={{ width: big ? 104 : hover ? 56 : 36, height: big ? 104 : hover ? 56 : 36, scale: down ? 0.85 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <AnimatePresence>
          {big && (
            <motion.span key={label} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
