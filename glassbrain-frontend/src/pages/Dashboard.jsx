import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Nav = () => (
  <nav className="flex gap-6 mb-8">
    <a href="/dashboard" className="text-blue-400 hover:text-blue-300">Dashboard</a>
    <a href="/traces" className="text-gray-400 hover:text-white">Traces</a>
    <a href="/keys" className="text-gray-400 hover:text-white">API Keys</a>
    <a href="/alerts" className="text-gray-400 hover:text-white">Alerts</a>
    <a href="/login" onClick={() => localStorage.removeItem('token')} className="text-red-400 hover:text-red-300 ml-auto">Logout</a>
  </nav>
)

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get(`${API}/analytics`, { headers: { 'x-api-key': token } })
      .then(res => setAnalytics(res.data))
      .catch(() => navigate('/login'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold text-white mb-6">GlassBrain</h1>
      <Nav />
      {analytics && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Traces', value: analytics.total_traces },
            { label: 'Total Cost', value: `$${analytics.total_cost.toFixed(4)}` },
            { label: 'Avg Latency', value: `${analytics.avg_latency.toFixed(2)}s` },
            { label: 'Total Tokens', value: analytics.total_tokens },
          ].map((card, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <p className="text-gray-400 text-sm mb-2">{card.label}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}