import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { LoginForm } from './components/auth/LoginForm'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { Dashboard } from './pages/Dashboard'
import { Personnel } from './pages/Personnel'
import { Committees } from './pages/Committees'
import { Meetings } from './pages/Meetings'
import { Motions } from './pages/Motions'
import { Policies } from './pages/Policies'
import { NewsEvents } from './pages/NewsEvents'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading application..." />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <LoginForm />
        <Toaster position="top-right" />
      </>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="personnel" element={<Personnel />} />
            <Route path="committees" element={<Committees />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="motions" element={<Motions />} />
            <Route path="policies" element={<Policies />} />
            <Route path="news-events" element={<NewsEvents />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App