import { Link } from 'react-router-dom';
import { PageShell, SplitReveal } from '../components/motion';
import { LogoMark } from '../components/Logo';

export default function NotFound() {
  return (
    <PageShell className="page--404">
      <div className="nf wrap">
        <LogoMark size={160} draw />
        <SplitReveal as="h1" text="Cette pièce n’existe pas (encore)." className="h1" delay={0.6} />
        <Link to="/" className="btn btn--red btn--lg">
          Retour à l’accueil
        </Link>
      </div>
    </PageShell>
  );
}
