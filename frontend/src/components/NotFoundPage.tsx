import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { ButtonPrimaryHero, ButtonGlassUtility } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-hero px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-text-primary/70">
        404
      </p>
      <h1
        className="mt-4 font-display text-6xl text-text-primary md:text-8xl lg:text-[140px]"
        style={{ lineHeight: 0.85 }}
      >
        Lost?
      </h1>
      <p className="mt-6 max-w-md text-lg text-text-secondary">
        This page doesn't exist. Maybe it got lost in a group project dispute.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link to="/">
          <ButtonPrimaryHero>
            <Home size={18} />
            Back home
          </ButtonPrimaryHero>
        </Link>
        <ButtonGlassUtility onClick={() => window.history.back()}>
          <ArrowLeft size={18} />
          Go back
        </ButtonGlassUtility>
      </div>
    </div>
  );
}
