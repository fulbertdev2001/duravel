import { forwardRef, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const isVideo = (src = '') => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);

/* Image ou vidéo selon l'extension. Fondu net à l'arrivée (pas de saut au chargement),
   vidéos muettes en boucle, lues seulement quand elles sont visibles. */
const Media = forwardRef(function Media(
  { src, alt = '', className = '', lazy = true, controls = false, onMeta, style, ...rest },
  fwd
) {
  const ref = useRef(null);
  // ref locale + ref transmise (objet ou fonction, ex. framer-motion)
  const setRef = (el) => {
    ref.current = el;
    if (typeof fwd === 'function') fwd(el);
    else if (fwd) fwd.current = el;
  };
  const [ready, setReady] = useState(false);
  const video = isVideo(src);

  useEffect(() => {
    setReady(false);
    const el = ref.current;
    if (el && !video && el.complete && el.naturalWidth) {
      setReady(true);
      onMeta?.(el.naturalWidth, el.naturalHeight);
    }
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = ref.current;
    if (!video || !el || controls || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [src, video, controls]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = `media ${ready ? 'is-ready' : ''} ${className}`;
  if (video)
    return (
      <video
        ref={setRef}
        src={src}
        className={cls}
        style={style}
        muted={!controls}
        loop={!controls}
        controls={controls}
        autoPlay={!controls}
        playsInline
        preload={lazy ? 'metadata' : 'auto'}
        onLoadedData={() => setReady(true)}
        onLoadedMetadata={(e) => onMeta?.(e.target.videoWidth, e.target.videoHeight)}
        aria-label={alt}
        {...rest}
      />
    );
  return (
    <img
      ref={setRef}
      src={src}
      alt={alt}
      className={cls}
      style={style}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      draggable="false"
      onLoad={(e) => {
        setReady(true);
        onMeta?.(e.target.naturalWidth, e.target.naturalHeight);
      }}
      {...rest}
    />
  );
});

export default Media;
export const MotionMedia = motion.create(Media);
