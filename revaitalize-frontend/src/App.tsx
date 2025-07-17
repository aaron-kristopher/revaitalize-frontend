import { Routes, Route } from 'react-router-dom';

// Import all your layout and page components
import PublicLayout from './components/layout/PublicLayout';
import LandingPage from "./pages/landing/LandingPage.tsx";
import ExercisesOverview from "./pages/exercisesOverview/ExercisesOverview.tsx";
import ModelsPage from "./pages/models/ModelsPage.tsx";
import LoginPage from "./pages/login/LoginPage.tsx";
import SignupPage from "./pages/signup/SignupPage.tsx";
import OnboardingPage from './pages/onboarding/OnboardingPage.tsx';

import AppLayout from "./components/layout/AppLayout";
import Sidebar from "./components/common/Sidebar/Sidebar.tsx";
import MainContentLayout from "./components/layout/MainContentLayout.tsx";
import DashboardPage from "./pages/dashboard/DashboardPage.tsx";
import SessionPage from "./pages/session/SessionPage.tsx";
import ProfilePage from './pages/profile/ProfilePage.tsx';
import { RecordDatasetPage } from './pages/dataset/RecordDatasetPage.tsx';


function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      {/* These routes are wrapped in a layout that likely has a public navbar/footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exercises" element={<ExercisesOverview />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* --- ONBOARDING ROUTE (Standalone) --- */}
      {/* This route needs a dynamic parameter `:userId` to know which user is being onboarded */}
      <Route path="/onboarding/:userId" element={<OnboardingPage />} />

      {/* --- PROTECTED APP ROUTES --- */}
      {/* This is a nested route structure. All child routes will be rendered inside the AppLayout */}
      <Route
        path="/app"
        element={
          <AppLayout>
            <Sidebar />
            <MainContentLayout />
          </AppLayout>
        }
      >
        <Route index element={<DashboardPage />} />

        <Route path="session/:requirementId" element={<SessionPage />} />

        <Route path="profile" element={<ProfilePage />} />
        <Route path="dataset" element={<RecordDatasetPage />} />
      </Route>

      {/* Optional: Add a catch-all "Not Found" route at the end */}
      <Route path="*" element={<h1>404: Page Not Found</h1>} />

    </Routes>
  );
}

export default App;
