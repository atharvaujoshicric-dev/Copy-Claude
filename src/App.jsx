import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import GeneratePage from './pages/GeneratePage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import { isAuthed } from './utils/store.js'

function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<GeneratePage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<Protected><AdminDashboard /></Protected>} />
      </Route>
    </Routes>
  )
}
