import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';

const SiteCtx = createContext(null);

const IMG = /\.(webp|jpe?g|png|avif)(\?|$)/i;
function warm(d) {
  const h = d.settings?.hero || {};
  const urls = [h.image, d.projects?.[0]?.cover, d.projects?.[0]?.before_img].filter((u) => u && IMG.test(u));
  const imgs = urls.map((u) => {
    const i = new Image();
    i.src = u;
    return i.decode ? i.decode().catch(() => {}) : Promise.resolve();
  });
  return Promise.all([...imgs, document.fonts?.ready]).catch(() => {});
}

export function SiteProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(() => {
    api
      .get('/api/site')
      .then(async (d) => {
        // on attend le visuel du hero (décodé) + les polices : la page apparaît nette, sans saut d'image
        await Promise.race([warm(d), new Promise((r) => setTimeout(r, 5000))]);
        setData(d);
        if (d.settings?.seo?.title) document.title = d.settings.seo.title;
        const meta = document.querySelector('meta[name="description"]');
        if (meta && d.settings?.seo?.description) meta.setAttribute('content', d.settings.seo.description);
      })
      .catch(setError);
  }, []);
  useEffect(load, [load]);
  return <SiteCtx.Provider value={{ data, error, reload: load }}>{children}</SiteCtx.Provider>;
}

export const useSite = () => useContext(SiteCtx);

export const telHref = (p = '') => `tel:${p.replace(/[^\d+]/g, '')}`;
export const pad = (n) => String(n).padStart(2, '0');
