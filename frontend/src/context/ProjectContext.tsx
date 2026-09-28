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
    // TODO: replace with real API when backend is ready
    const [p, m, t, dashboard, teacherReport, consents] = await Promise.all([
      api.getProject(),
      api.getMembers(),
      api.getTasks(projectId),
      api.getDashboard(),
      api.getTeacherReport(),
      api.getMemberConsents(projectId),
    ]);
    setProject(p);
    setMembers(m);
    setTasks(t);
    // scores come from the teacher report (same underlying mock data as dashboard)
    setScores(teacherReport.scores);
    setDisputes(teacherReport.disputes);
    setMemberConsents(consents);
    // Keep dashboardData.score in sync with the teacher report scores array
    // so DashboardPage can derive hasPendingDispute from context.disputes
    void dashboard; // dashboard fetched for side-effect parity; data is derived from teacherReport
    setIsLoading(false);
  }, [projectId]);

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
