import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lightbox from '../components/Lightbox';
import Media from '../components/Media';
import { FadeUp, SplitReveal, useScrollProgress } from '../components/motion';

/* Mur d'images à colonnes en parallaxe inversée + visionneuse plein écran */
export default function GalleryWall({ projects = [] }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(null);
  const items = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const p of projects)
      for (const g of [...(p.gallery || []), { src: p.cover, caption: p.title }])
        if (g.src && !seen.has(g.src)) {
          seen.add(g.src);
          out.push({ ...g, caption: g.caption || p.title, project: p.title });
        }
    return out;
  }, [projects]);

  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start end', 'end start'] });
  // parallaxe douce, sans rotation ni zoom (les images restent droites et nettes)
  const y1 = useTransform(scrollYProgress, [0, 1], ['3%', '-10%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['-8%', '4%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['6%', '-14%']);

  if (items.length < 2) return null;
  // remplit 3 colonnes d'au moins 3 visuels chacune
  const pool = [];
  while (pool.length < Math.max(9, items.length)) pool.push(...items.map((it, k) => ({ ...it, k })));
  const cols = [[], [], []];
  pool.slice(0, Math.max(9, Math.ceil(pool.length / 3) * 3)).forEach((it, n) => cols[n % 3].push(it));
  const ys = [y1, y2, y3];

  return (
    <section className="section section--dark wall" ref={ref}>
      <div className="wall__head wrap">
        <FadeUp as="p" className="eyebrow eyebrow--red">
          Dans le détail
        </FadeUp>
        <SplitReveal text="Raccords invisibles, lignes épurées." className="h2" />
        <FadeUp as="p" className="lead lead--muted">
          Cliquez sur une image pour l’ouvrir en plein écran.
        </FadeUp>
      </div>
      <motion.div className="wall__grid">
        {cols.map((col, c) => (
          <motion.div className="wall__col" key={c} style={{ y: ys[c] }}>
            {col.map((it, n) => (
              <motion.button
                key={`${c}-${n}`}
                className="wall__item"
                onClick={() => setIdx(it.k)}
                data-cursor="Agrandir"
                whileHover={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Media src={it.src} alt={it.caption} />
                <span className="wall__cap">{it.caption}</span>
              </motion.button>
            ))}
          </motion.div>
        ))}
      </motion.div>
      <Lightbox items={items} index={idx} onClose={() => setIdx(null)} onIndex={setIdx} />
    </section>
  );
}
