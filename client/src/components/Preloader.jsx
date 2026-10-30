import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LogoMark } from './Logo';

const ease = [0.76, 0, 0.24, 1];

export default function Preloader({ ready, onDone }) {
  const [count, setCount] = useState(0);

  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const startRef = useRef(performance.now());

  useEffect(() => {
    let raf;
    const onDone = () => doneRef.current?.();
    const start = startRef.current;
    const MIN = 1700;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / MIN);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * (ready ? 100 : 86)));
      if (p < 1 || !ready) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  return (
    <motion.div className="preloader" exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 1, ease }}>
      <motion.div
        className="preloader__inner"
        exit={{ y: -80, opacity: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="preloader__logo">
          <LogoMark size={190} draw />
        </div>
        <div className="preloader__word">
          {'SEBAS'.split('').map((l, i) => (
            <motion.span
              key={i}
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.8, ease }}
            >
              {l}
            </motion.span>
          ))}
        </div>
        <motion.div className="preloader__sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
          Construction & rénovation intérieure
        </motion.div>
      </motion.div>
      <div className="preloader__bar">
        <motion.span style={{ scaleX: count / 100 }} />
      </div>
      <div className="preloader__count">{String(count).padStart(3, '0')}</div>
    </motion.div>
  );
}
