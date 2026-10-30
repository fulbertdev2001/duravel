import { useSite } from '../lib/site';
import { PageShell } from '../components/motion';
import CTA from '../sections/CTA';
import Method from '../sections/Method';

export default function ContactPage() {
  const { data } = useSite();
  return (
    <PageShell className="page--contact">
      <div className="contact-top" />
      <CTA s={data.settings} />
      <Method s={data.settings} />
    </PageShell>
  );
}
