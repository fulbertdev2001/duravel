import { motion } from 'framer-motion';

/* Logo Duravel Building vectorisé (trois toits, fenêtres, socle).
   `draw` anime le tracé (preloader), `mono` force une seule couleur. */
export function LogoMark({ size = 64, draw = false, mono = false, className = '' }) {
  const ink = mono ? 'currentColor' : 'var(--logo-ink, currentColor)';
  const red = mono ? 'currentColor' : 'var(--crimson)';
  const P = draw ? motion.path : 'path';
  const anim = (d = 0) =>
    draw
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 1.1, delay: d, ease: [0.65, 0, 0.35, 1] },
        }
      : {};
  const fade = (d = 0) =>
    draw
      ? { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay: d } }
      : {};
  const R = draw ? motion.rect : 'rect';
  const Poly = draw ? motion.path : 'path';
  return (
    <svg className={className} width={size} height={size * 0.42} viewBox="0 0 220 92" fill="none" aria-hidden="true">
      {/* accents rouges derrière les pignons */}
      <Poly d="M64 30 L98 30 L83 47 Z" fill={red} {...fade(0.9)} />
      <Poly d="M122 30 L156 30 L137 47 Z" fill={red} {...fade(1)} />
      {/* toit gauche */}
      <P d="M14 78 L62 30 L84 52" stroke={ink} strokeWidth="9" strokeLinejoin="miter" {...anim(0.1)} />
      {/* toit droit */}
      <P d="M136 52 L158 30 L206 78" stroke={ink} strokeWidth="9" strokeLinejoin="miter" {...anim(0.2)} />
      {/* toit central */}
      <P d="M46 84 L110 10 L174 84" stroke={ink} strokeWidth="11" strokeLinejoin="miter" {...anim(0)} />
      {/* fenêtres */}
      {[
        [50, 52, 13],
        [101, 38, 17],
        [158, 52, 13],
      ].map(([x, y, s], i) => (
        <g key={i}>
          <R x={x} y={y} width={s / 2 - 1} height={s / 2 - 1} fill={ink} {...fade(0.7 + i * 0.08)} />
          <R x={x + s / 2 + 1} y={y} width={s / 2 - 1} height={s / 2 - 1} fill={ink} {...fade(0.72 + i * 0.08)} />
          <R x={x} y={y + s / 2 + 1} width={s / 2 - 1} height={s / 2 - 1} fill={ink} {...fade(0.74 + i * 0.08)} />
          <R x={x + s / 2 + 1} y={y + s / 2 + 1} width={s / 2 - 1} height={s / 2 - 1} fill={ink} {...fade(0.76 + i * 0.08)} />
        </g>
      ))}
      {/* socle effilé */}
      <Poly d="M4 84 Q110 76 216 82 L216 84 Q110 82 4 90 Z" fill={ink} {...fade(1.1)} />
    </svg>
  );
}

export default function Logo({ compact = false, light = false }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`}>
      <LogoMark size={compact ? 46 : 58} />
      <span className="logo__type">
        <span className="logo__name">Duravel</span>
        <span className="logo__sub">Building</span>
      </span>
    </span>
  );
}
