import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Traces from './pages/Traces'
import Keys from './pages/Keys'
import Alerts from './pages/Alerts'

function App() {
  const token = localStorage.getItem('token')

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/traces" element={token ? <Traces /> : <Navigate to="/login" />} />
      <Route path="/keys" element={token ? <Keys /> : <Navigate to="/login" />} />
      <Route path="/alerts" element={token ? <Alerts /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App