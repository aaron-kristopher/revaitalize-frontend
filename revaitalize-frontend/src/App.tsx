import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";

// Layouts
import PublicLayout from "@/shared/components/layout/PublicLayout";
import AppLayout from "@/shared/components/layout/AppLayout";

// Pages
import LandingPage from "@/pages/LandingPage";
import ExercisesOverview from "@/pages/ExercisesOverview";
import ModelsPage from "@/pages/ModelsPage";
import NotFoundPage from "@/pages/404_NotFound"
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import SessionPage from "@/pages/session";
import ProfilePage from "@/pages/profile";

import { RecordDatasetPage } from "./pages/dataset/RecordDatasetPage";

import { PoseLandmarkerProvider } from "@/shared/context/PoseLandmarkerContext";
import { SidebarProvider } from "@/shared/context/SidebarContext"
import { AuthProvider, useAuth } from "@/shared/context/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading Application...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <PoseLandmarkerProvider>
          <BrowserRouter>
            <Routes>

              {/* --- PUBLIC ROUTES --- */}
              {/* These routes are for users not logged in. Provides information about the app */}

              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/exercises" element={<ExercisesOverview />} />
                <Route path="/models" element={<ModelsPage />} />

                {/* --- AUTHENTICATION ROUTES --- */}

                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>

              {/* --- ONBOARDING ROUTE (Standalone) --- */}
              {/* This route needs a dynamic parameter `:userId` to know which user is being onboarded */}
              <Route path="/onboarding/:userId" element={<OnboardingPage />} />


              {/* --- PROTECTED APP ROUTES --- */}
              {/* This is a nested route structure. All child routes will be rendered inside the AppLayout */}

              <Route path="/app" element={<ProtectedRoute />}>
                <Route element={<AppLayout />} >
                  <Route index element={<DashboardPage />} />
                  <Route path="session/:requirementId" element={< SessionPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="dataset" element={<RecordDatasetPage />} />
                </Route>
              </Route>

              {/* Catchall for paths that should return 404 not found */}
              <Route path="*" element={<NotFoundPage />} />

            </Routes>

          </BrowserRouter>
        </PoseLandmarkerProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
