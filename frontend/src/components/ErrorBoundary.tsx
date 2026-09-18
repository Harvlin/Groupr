import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonPrimaryHero } from '@/components/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            Something went wrong
          </p>
          <h1
            className="mt-4 font-display text-5xl text-text-primary md:text-7xl"
            style={{ lineHeight: 0.85 }}
          >
            Oops.
          </h1>
          <p className="mt-4 max-w-md text-text-secondary">
            An unexpected error occurred. Try refreshing the page, or return
            home.
          </p>
          {this.state.error && (
            <pre className="mt-6 max-w-lg overflow-auto rounded-card bg-surface-muted p-4 text-left text-xs text-text-tertiary">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-8 flex gap-4">
            <ButtonPrimaryHero onClick={() => window.location.reload()}>
              Refresh page
            </ButtonPrimaryHero>
            <Link to="/">
              <ButtonPrimaryHero className="bg-white text-text-primary hover:bg-surface-muted">
                Go home
              </ButtonPrimaryHero>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
