import { motion } from 'framer-motion';

/* Logo Sebas Rénovation : toit orange + « S » en blocs (charte graphique).
   `draw` anime le tracé du toit puis fait apparaître le S (préloader), `mono` force une seule couleur.
   `size` = hauteur du pictogramme en px. */
const ROOF = 'M258 415 L343 358 L427 415 L414 432 L343 384 L270 432 Z';
const S = 'M284 448 H401 V471 H307 V497 H401 V566 H284 V543 H378 V520 H284 Z';

export function LogoMark({ size = 64, draw = false, mono = false, className = '' }) {
  const ink = mono ? 'currentColor' : 'var(--logo-ink, currentColor)';
  const accent = mono ? 'currentColor' : 'var(--crimson)';
  const h = size * 0.7;
  return (
    <svg className={className} width={(h * 185) / 220} height={h} viewBox="250 352 185 220" aria-hidden="true">
      {draw ? (
        <>
          <motion.path
            d={ROOF}
            fill={accent}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.path
            d={S}
            fill={ink}
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: 0.35 }}
          />
        </>
      ) : (
        <>
          <path d={ROOF} fill={accent} />
          <path d={S} fill={ink} />
        </>
      )}
    </svg>
  );
}

export default function Logo({ compact = false, light = false }) {
  return (
    <span className={`logo ${light ? 'logo--light' : ''}`}>
      <LogoMark size={compact ? 52 : 64} />
      <span className="logo__bar" aria-hidden="true" />
      <span className="logo__type">
        <span className="logo__name">SEBAS</span>
        <span className="logo__sub">Renovation</span>
      </span>
    </span>
  );
}
