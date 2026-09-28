import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/app/landing/LandingPage';
import { DashboardPage } from '@/app/dashboard/DashboardPage';
import { TeacherReportPage } from '@/app/teacher-report/TeacherReportPage';
import { SourcesPage } from '@/app/sources/SourcesPage';
import { DisputesPage } from '@/app/disputes/DisputesPage';
import { PrivacyPage } from '@/app/privacy/PrivacyPage';
import { AIDisclosurePage } from '@/app/ai-disclosure/AIDisclosurePage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TeacherRoute } from '@/components/auth/TeacherRoute';
import { ProjectProvider } from '@/context/ProjectContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AppLayout } from '@/components/layout/AppLayout';

// Pages
import { TeamOverviewPage } from '@/pages/TeamOverviewPage';
import { CoachModePage } from '@/pages/CoachModePage';
import { OfflineLogPage } from '@/pages/OfflineLogPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';
import InvitationPage from '@/pages/InvitationPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import ProjectSettingsPage from '@/pages/ProjectSettingsPage';
import TasksPage from '@/pages/TasksPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <NotificationProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/invite/:token" element={<InvitationPage />} />

        {/* Protected — global layout (projects list, profile, teacher dashboard) */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <AppLayout mode="global">
                <ProjectsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout mode="global">
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <TeacherRoute>
                <AppLayout mode="global">
                  <TeacherDashboardPage />
                </AppLayout>
              </TeacherRoute>
            </ProtectedRoute>
          }
        />

        {/* Protected — project layout (individual project views) */}
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectProvider>
                <AppLayout mode="project" />
              </ProjectProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="team" element={<TeamOverviewPage />} />
          <Route path="coach" element={<CoachModePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="disputes" element={<DisputesPage />} />
          <Route path="ai-disclosure" element={<AIDisclosurePage />} />
          <Route path="offline-log" element={<OfflineLogPage />} />
          <Route path="teacher-report" element={<TeacherRoute><TeacherReportPage /></TeacherRoute>} />
          <Route path="settings" element={<ProjectSettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </NotificationProvider>
  );
}
