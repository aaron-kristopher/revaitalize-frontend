import Sidebar from "./components/common/Sidebar/Sidebar.tsx"
import AppLayout from "./components/layout/AppLayout"
import SessionPage from "./pages/session/SessionPage.tsx"
import MainContentLayout from "./components/layout/MainContentLayout.tsx"
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import LandingPage from "./pages/landing/LandingPage.tsx";
import ModelsPage from "./pages/models/ModelsPage.tsx"; 
import ExercisesOverview from "./pages/exercisesOverview/ExercisesOverview.tsx";
import LoginPage from "./pages/login/LoginPage.tsx";
import SignupPage from "./pages/signup/SignupPage.tsx";

function App() {
  return (
    <Routes>
        <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/exercises" element={<ExercisesOverview />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/signup" element={<SignupPage />}/>
      </Route>

      <Route path="/app" 
        element={
          <AppLayout>
            <Sidebar />
            <MainContentLayout>
              <SessionPage /> 
            </MainContentLayout>
          </AppLayout>
        } 
      />
    

      {/* <AppLayout>
        <Sidebar />
          <MainContentLayout>
            <SessionPage />
          </MainContentLayout>
      </AppLayout> */}
    </Routes>
  )
}

export default App
