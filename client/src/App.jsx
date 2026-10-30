import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SiteProvider, useSite } from './lib/site';
import { startSmooth, stopSmooth, scrollToTarget } from './lib/smooth';
import Preloader from './components/Preloader';
import Nav from './components/Nav';
import Cursor from './components/Cursor';
import Footer from './components/Footer';
import Grain from './components/Grain';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ContactPage from './pages/ContactPage';
import NotFound from './pages/NotFound';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function PublicSite() {
  const { data } = useSite();
  const location = useLocation();
  const [loaded, setLoaded] = useState(() => sessionStorageSafe('dv_seen') === '1');

  useEffect(() => {
    startSmooth();
    return () => stopSmooth();
  }, []);

  // remonte en haut à chaque changement de page (ou vers l'ancre)
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => scrollToTarget(location.hash), 700);
    } else {
      scrollToTarget(0, { immediate: true });
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <Grain />
      <Cursor />
      <AnimatePresence>
        {(!loaded || !data) && (
          <Preloader
            ready={!!data}
            onDone={() => {
              setLoaded(true);
              sessionStorageSafe('dv_seen', '1');
            }}
          />
        )}
      </AnimatePresence>
      {data && (
        <>
          <Nav />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home intro={loaded} />} />
              <Route path="/realisations" element={<Projects />} />
              <Route path="/realisations/:slug" element={<ProjectDetail />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <Footer />
        </>
      )}
    </>
  );
}

function sessionStorageSafe(k, v) {
  try {
    if (v === undefined) return sessionStorage.getItem(k);
    sessionStorage.setItem(k, v);
  } catch {
    return null;
  }
}

export default function App() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin'))
    return (
      <Suspense fallback={<div className="adm-loading">Chargement…</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  return (
    <SiteProvider>
      <PublicSite />
    </SiteProvider>
  );
}
