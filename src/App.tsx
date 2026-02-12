import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import { PrivateRoute } from './components/guards'
import { Home, Login, Register, Dashboard, Profile, Recommendations, PracticeLog } from './pages'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/practice-log" element={<PracticeLog />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
