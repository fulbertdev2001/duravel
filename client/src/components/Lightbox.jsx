import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';
import Media, { isVideo } from './Media';
import { lockScroll } from '../lib/smooth';
import { ease } from './motion';

const Stage = ({ src, ...rest }) =>
  isVideo(src) ? (
    <motion.video src={src} controls autoPlay loop playsInline {...rest} />
  ) : (
    <motion.img src={src} decoding="async" {...rest} />
  );

/* Visionneuse plein écran : clavier ←/→/Échap, swipe, compteur, vignettes */
export default function Lightbox({ items = [], index, onClose, onIndex }) {
  const open = index !== null && index !== undefined;
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const k = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', k);
    return () => {
      window.removeEventListener('keydown', k);
      lockScroll(false);
    };
  }, [open, index, items.length, onClose, onIndex]);

  const item = open ? items[index] : null;
  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="lb"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="dialog"
          aria-modal="true"
        >
          <button className="lb__close" onClick={onClose} aria-label="Fermer" data-cursor="Fermer">
            <Icon name="close" size={26} />
          </button>
          <div className="lb__stage" onClick={onClose}>
            <AnimatePresence mode="popLayout" initial={false}>
              <Stage
                key={item.src}
                src={item.src}
                alt={item.caption || ''}
                className="lb__img"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.6, ease }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -80) onIndex((index + 1) % items.length);
                  if (info.offset.x > 80) onIndex((index - 1 + items.length) % items.length);
                }}
              />
            </AnimatePresence>
          </div>
          {items.length > 1 && (
            <>
              <button className="lb__nav lb__nav--prev" onClick={() => onIndex((index - 1 + items.length) % items.length)} aria-label="Précédente">
                <Icon name="left" size={28} />
              </button>
              <button className="lb__nav lb__nav--next" onClick={() => onIndex((index + 1) % items.length)} aria-label="Suivante">
                <Icon name="right" size={28} />
              </button>
            </>
          )}
          <div className="lb__bar">
            <span className="lb__count">
              {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <span className="lb__caption">{item.caption}</span>
          </div>
          {items.length > 1 && (
            <div className="lb__thumbs">
              {items.map((it, i) => (
                <button key={i} className={i === index ? 'is-active' : ''} onClick={() => onIndex(i)} aria-label={`Image ${i + 1}`}>
                  <Media src={it.src} alt="" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
