import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useEffect, useRef } from 'react';

export function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const toastShown = useRef(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'teacher' && !toastShown.current) {
      toastShown.current = true;
      addToast('This page is for teachers only.', 'error');
    }
  }, [currentUser, addToast]);

  if (!currentUser || currentUser.role !== 'teacher') {
    return <Navigate to="/projects" replace />;
  }

  return <>{children}</>;
}
