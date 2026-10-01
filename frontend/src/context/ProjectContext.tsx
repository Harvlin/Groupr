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
import { useAuth } from '@/hooks/useAuth';
import type {
  ProjectContextValue,
  Project,
  ProjectMember,
  ProjectTask,
  TaskStatus,
  ContributionScore,
  Dispute,
  MemberConsent,
} from '@/types';

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { projectId } = useParams<{ projectId?: string }>();
  const { currentUser } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [scores, setScores] = useState<ContributionScore[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [memberConsents, setMemberConsents] = useState<MemberConsent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      // Fetch core data that every role can access in parallel
      const [p, m, t, consents] = await Promise.all([
        api.getProject(),
        api.getMembers(),
        api.getTasks(projectId),
        api.getMemberConsents(projectId),
      ]);
      setProject(p);
      setMembers(m);
      setTasks(t);
      setMemberConsents(consents);

      // Fetch role-specific data separately so a 403 doesn't break the whole context
      const isTeacher = currentUser?.role === 'teacher';
      if (isTeacher) {
        // Teachers get the full report including all member scores
        const teacherReport = await api.getTeacherReport().catch(() => null);
        if (teacherReport) {
          setScores(teacherReport.scores);
          setDisputes(teacherReport.disputes);
        }
      } else {
        // Students get their own score from the dashboard + disputes list
        const [dashboard, projectDisputes] = await Promise.allSettled([
          api.getDashboard(),
          api.getDisputes(projectId),
        ]);
        if (dashboard.status === 'fulfilled') {
          // Wrap the single score into an array for uniform context shape
          setScores([dashboard.value.score]);
        }
        if (projectDisputes.status === 'fulfilled') {
          setDisputes(projectDisputes.value);
        }
      }
    } catch (error) {
      console.error('[ProjectContext] Failed to load project data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, currentUser?.role]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const currentMember = useMemo(() => {
    return members.find(m => m.userId === currentUser?.id) ?? members[0] ?? null;
  }, [members, currentUser]);

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
      scores,
      disputes,
      memberConsents,
      isLoading,
      refetch: fetch,
      updateTask,
    }),
    [project, members, currentMember, tasks, scores, disputes, memberConsents, isLoading, fetch, updateTask]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
