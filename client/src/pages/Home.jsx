import { useSite } from '../lib/site';
import { PageShell } from '../components/motion';
import Hero from '../sections/Hero';
import Vision from '../sections/Vision';
import Services from '../sections/Services';
import ProjectsRail from '../sections/ProjectsRail';
import BeforeAfterShowcase from '../sections/BeforeAfterShowcase';
import GalleryWall from '../sections/GalleryWall';
import Founder from '../sections/Founder';
import Method from '../sections/Method';
import CTA from '../sections/CTA';

export default function Home({ intro }) {
  const { data } = useSite();
  const s = data.settings;
  return (
    <PageShell>
      <Hero s={s} intro={intro} />
      <Vision s={s} />
      <Services services={data.services} />
      <ProjectsRail projects={data.projects} />
      <BeforeAfterShowcase projects={data.projects} />
      <GalleryWall projects={data.projects} founder={s.founder} />
      <Founder s={s} />
      <Method s={s} />
      <CTA s={s} id="devis" />
    </PageShell>
  );
}
