import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-4 text-center">
      <p className="font-display text-[96px] font-black leading-none text-text-primary opacity-10">404</p>
      <h1 className="mt-0 text-2xl font-semibold text-text-primary">Page not found</h1>
      <p className="mt-2 text-base text-text-secondary">This page doesn't exist or you don't have access.</p>
      <Link
        to={isAuthenticated ? '/projects' : '/'}
        className="mt-8 inline-flex h-10 items-center rounded-control bg-accent-lime px-6 font-semibold text-text-primary hover:bg-[#80E142] focus-visible:outline-2 focus-visible:outline-accent-lime"
      >
        Go to your projects
      </Link>
    </div>
  );
}
