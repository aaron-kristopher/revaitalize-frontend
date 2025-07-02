import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import LandingPage from "./pages/landing/LandingPage.tsx";
import ExercisesOverview from "./pages/exercisesOverview/ExercisesOverview.tsx";
import ModelsPage from "./pages/models/ModelsPage.tsx"; 
import LoginPage from "./pages/login/LoginPage.tsx";
import SignupPage from "./pages/signup/SignupPage.tsx";

import AppLayout from "./components/layout/AppLayout";
import Sidebar from "./components/common/Sidebar/Sidebar.tsx";
import MainContentLayout from "./components/layout/MainContentLayout.tsx";
import DashboardPage from "./pages/dashboard/DashboardPage.tsx"; 
import SessionPage from "./pages/session/SessionPage.tsx";
import ProfilePage from './pages/profile/ProfilePage.tsx';
import OnboardingPage from './pages/onboarding/OnboardingPage.tsx';

function App() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exercises" element={<ExercisesOverview />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/signup" element={<SignupPage />}/>
      </Route>

      <Route path="/onboarding" element={<OnboardingPage />} />
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
        <Route path="/app/session" element={<SessionPage />} /> 
        <Route path="/app/profile" element={<ProfilePage />} /> 
      </Route>

    </Routes>
  );
}

export default App;