import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './app/login/page'
import GoalSetupPage from './app/setup/goal/page'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage from './app/dashboard/page'
import AnalyticsPage from './app/dashboard/analytics/page'
import CalendarPage from './app/dashboard/calendar/page'
import HashtagPage from './app/dashboard/tools/hashtag/page'
import SimulatorPage from './app/dashboard/simulator/page'
import OpportunitiesPage from './app/dashboard/opportunities/page'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup/goal" element={<GoalSetupPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="tools/hashtag" element={<HashtagPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
