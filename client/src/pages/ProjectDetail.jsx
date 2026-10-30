import Media from '../components/Media';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useSite } from '../lib/site';
import { api } from '../lib/api';
import { PageShell, SplitReveal, FadeUp, ease, easeOut, useScrollProgress } from '../components/motion';
import BeforeAfter from '../components/BeforeAfter';
import Lightbox from '../components/Lightbox';
import Icon from '../components/Icon';
import NotFound from './NotFound';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data } = useSite();
  const fromList = data.projects.find((p) => p.slug === slug);
  const [p, setP] = useState(fromList || null);
  const [missing, setMissing] = useState(false);
  const [idx, setIdx] = useState(null);

  useEffect(() => {
    if (fromList) return setP(fromList);
    api.get(`/api/projects/${slug}`).then(setP).catch(() => setMissing(true));
  }, [slug, fromList]);

  if (missing) return <NotFound />;
  if (!p) return <PageShell />;

  const list = data.projects;
  const pos = list.findIndex((x) => x.slug === p.slug);
  const next = list.length > 1 ? list[(pos + 1) % list.length] : null;
  const gallery = (p.gallery || []).length ? p.gallery : [{ src: p.cover, caption: p.title }];
  const meta = [
    ['Catégorie', p.category],
    ['Année', p.year],
    ['Lieu', p.location],
    ['Durée', p.duration],
  ].filter(([, v]) => v);

  return (
    <PageShell className="page--project">
      <ProjectHero p={p} meta={meta} />

      <section className="section section--light pintro">
        <div className="wrap pintro__grid">
          <aside className="pintro__aside">
            <FadeUp as="p" className="eyebrow eyebrow--red">
              Le projet
            </FadeUp>
            <ul className="taglist">
              {(p.tags || []).map((t, i) => (
                <FadeUp as="li" key={t} delay={i * 0.05}>
                  {t}
                </FadeUp>
              ))}
            </ul>
          </aside>
          <div className="pintro__body">
            <SplitReveal as="p" text={p.summary} className="pintro__summary" stagger={0.02} />
            {(p.description || '').split(/\n{2,}/).map((para, i) => (
              <FadeUp as="p" key={i} className="pintro__para" delay={i * 0.08}>
                {para}
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {p.before_img && (
        <section className="section section--marble pba">
          <div className="wrap pba__grid">
            <div className="pba__text">
              <FadeUp as="p" className="eyebrow eyebrow--red">
                Avant / Après
              </FadeUp>
              <SplitReveal text="Glissez pour révéler la transformation." className="h2" />
              <FadeUp as="p" className="lead" delay={0.1}>
                Même pièce, deux époques. Faites glisser la poignée — ou utilisez les flèches du clavier — pour comparer l’état d’origine et le résultat livré.
              </FadeUp>
              <div className="pba__thumbs">
                <FadeUp className="pba__thumb" delay={0.15}>
                  <img src={p.before_img} alt="" />
                  <span>Avant</span>
                </FadeUp>
                <FadeUp className="pba__thumb is-after" delay={0.25}>
                  <img src={p.after_img || p.cover} alt="" />
                  <span>Après</span>
                </FadeUp>
              </div>
            </div>
            <FadeUp className="pba__slider">
              <BeforeAfter before={p.before_img} after={p.after_img || p.cover} alt={p.title} />
            </FadeUp>
          </div>
        </section>
      )}

      <section className="section section--dark pstack">
        <div className="wrap section-head">
          <FadeUp as="p" className="eyebrow eyebrow--red">
            Galerie — {String(gallery.length).padStart(2, '0')} vues
          </FadeUp>
          <SplitReveal text="Chaque angle, chaque finition." className="h2" />
        </div>
        <div className="stack wrap">
          {gallery.map((g, i) => (
            <StackCard key={i} g={g} i={i} total={gallery.length} onOpen={() => setIdx(i)} />
          ))}
        </div>
        <div className="wrap thumbs">
          {gallery.map((g, i) => (
            <motion.button
              key={i}
              onClick={() => setIdx(i)}
              data-cursor="Agrandir"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
            >
              <Media src={g.src} alt={g.caption || ''} />
            </motion.button>
          ))}
        </div>
        <Lightbox items={gallery} index={idx} onClose={() => setIdx(null)} onIndex={setIdx} />
      </section>

      {next && <NextProject next={next} />}
    </PageShell>
  );
}

function ProjectHero({ p, meta }) {
  const ref = useRef(null);
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start start', 'end start'] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.35]);
  const cardY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const cardRot = useTransform(scrollYProgress, [0, 1], [0, -4]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 90, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 90, damping: 18 });
  return (
    <section
      ref={ref}
      className="phero"
      onPointerMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      <motion.div className="phero__bg" style={{ scale: bgScale }}>
        <img src={p.cover} alt="" aria-hidden="true" />
      </motion.div>
      <div className="phero__shade" />
      <div className="phero__grid wrap">
        <motion.div className="phero__content" style={{ y: textY, opacity: fade }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Link to="/realisations" className="back">
              <Icon name="left" size={16} /> Toutes les réalisations
            </Link>
          </motion.div>
          <SplitReveal as="h1" text={p.title} className="display phero__title" delay={0.7} />
          {meta.length > 0 && (
            <motion.dl className="phero__meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </motion.dl>
          )}
        </motion.div>
        <motion.div className="phero__card-wrap" style={{ y: cardY, rotate: cardRot, scale: cardScale }}>
          <motion.div
            className="phero__card"
            style={{ rotateX: rx, rotateY: ry }}
            initial={{ clipPath: 'inset(100% 0% 0% 0% round 26px)', y: 80 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 26px)', y: 0 }}
            transition={{ duration: 1.4, ease, delay: 0.4 }}
          >
            <motion.img
              src={p.cover}
              alt={p.title}
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: easeOut, delay: 0.4 }}
            />
          </motion.div>
          {p.before_img && (
            <motion.div
              className="phero__before"
              initial={{ opacity: 0, x: -40, rotate: -10 }}
              animate={{ opacity: 1, x: 0, rotate: -6 }}
              transition={{ delay: 1.6, duration: 1, ease: easeOut }}
            >
              <img src={p.before_img} alt="" />
              <span>Avant</span>
            </motion.div>
          )}
        </motion.div>
      </div>
      <motion.div className="phero__scroll" style={{ opacity: fade }}>
        <span /> Découvrir le projet
      </motion.div>
    </section>
  );
}

function StackCard({ g, i, total, onOpen }) {
  const ref = useRef(null);
  const scrollYProgress = useScrollProgress({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 - (total - i) * 0.03]);
  const bright = useTransform(scrollYProgress, [0, 1], [1, 0.45]);
  const filter = useTransform(bright, (b) => `brightness(${b})`);
  const rotate = (i % 2 ? 1 : -1) * (1.5 + (i % 3));
  const capO = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const capY = useTransform(scrollYProgress, [0, 0.2], [0, -30]);
  return (
    <div ref={ref} className="stack__slot" style={{ top: `calc(10vh + ${i * 14}px)` }}>
      <motion.button className="stack__card" style={{ scale, filter, rotate }} onClick={onOpen} data-cursor="Agrandir">
        <Media src={g.src} alt={g.caption || ''} />
      </motion.button>
      <motion.div className={`stack__cap ${i % 2 ? 'is-left' : ''}`} style={{ opacity: capO, y: capY }}>
        <b>{String(i + 1).padStart(2, '0')}</b>
        <span>{g.caption}</span>
      </motion.div>
    </div>
  );
}

function NextProject({ next }) {
  return (
    <section className="next">
      <Link to={`/realisations/${next.slug}`} className="next__link" data-cursor="Suivant">
        <motion.img
          src={next.cover}
          alt=""
          className="next__bg"
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.6, ease }}
        />
        <div className="next__shade" />
        <div className="next__content wrap">
          <span className="eyebrow">Projet suivant</span>
          <h2 className="display">{next.title}</h2>
          <span className="next__arrow">
            <Icon name="arrow" size={40} />
          </span>
        </div>
      </Link>
    </section>
  );
}
