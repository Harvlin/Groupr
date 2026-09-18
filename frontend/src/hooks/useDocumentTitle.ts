import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} — Truth Layer` : 'Truth Layer';
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
