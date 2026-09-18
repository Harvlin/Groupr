/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/services/api';
import type {
  ProjectContextValue,
  Project,
  ProjectMember,
  ProjectTask,
  TaskStatus,
} from '@/types';

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId?: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    const [p, m, t] = await Promise.all([
      api.getProject(),
      api.getMembers(),
      api.getTasks(projectId),
    ]);
    setProject(p);
    setMembers(m);
    setTasks(t);
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const currentMember = useMemo(() => {
    // In a real app this would match the logged-in user.
    return members[0] ?? null;
  }, [members]);

  const updateTask = useCallback((taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    api.updateTaskStatus(taskId, status);
  }, []);

  const value = useMemo(
    () => ({
      project,
      members,
      currentMember,
      tasks,
      isLoading,
      refetch: fetch,
      updateTask,
    }),
    [project, members, currentMember, tasks, isLoading, fetch, updateTask]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
