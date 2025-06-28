import Sidebar from "./components/common/Sidebar/Sidebar.tsx"
import AppLayout from "./components/layout/AppLayout"
import SessionPage from "./pages/session/SessionPage.tsx"
import MainContentLayout from "./components/layout/MainContentLayout.tsx"

function App() {
  return (
    <>
      <AppLayout>
        <Sidebar />
        <MainContentLayout>
          <SessionPage />
        </MainContentLayout>
      </AppLayout>
    </>
  )
}

export default App
