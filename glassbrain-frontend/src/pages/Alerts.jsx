import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

const Nav = () => (
  <nav className="flex gap-6 mb-8">
    <a href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</a>
    <a href="/traces" className="text-gray-400 hover:text-white">Traces</a>
    <a href="/keys" className="text-gray-400 hover:text-white">API Keys</a>
    <a href="/alerts" className="text-blue-400 hover:text-blue-300">Alerts</a>
    <a href="/login" onClick={() => localStorage.removeItem('token')} className="text-red-400 hover:text-red-300 ml-auto">Logout</a>
  </nav>
)

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [metric, setMetric] = useState('cost')
  const [threshold, setThreshold] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get(`${API}/alerts`, { headers: { 'x-api-key': token } })
      .then(res => setAlerts(res.data.alerts))
      .catch(() => navigate('/login'))
  }, [])

  const createAlert = async () => {
    await axios.post(`${API}/alerts/create`, { metric, threshold: parseFloat(threshold) }, { headers: { 'x-api-key': token } })
    setAlerts([...alerts, { metric, threshold: parseFloat(threshold), created_at: new Date().toISOString() }])
    setThreshold('')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold text-white mb-6">GlassBrain</h1>
      <Nav />
      <h2 className="text-xl font-semibold mb-4">Alerts</h2>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h3 className="text-sm text-gray-400 mb-4">Create Alert Rule</h3>
        <div className="flex gap-4">
          <select value={metric} onChange={e => setMetric(e.target.value)} className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg">
            <option value="cost">Cost ($)</option>
            <option value="latency">Latency (s)</option>
            <option value="tokens">Tokens</option>
          </select>
          <input
            placeholder="Threshold value"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg flex-1 outline-none"
          />
          <button onClick={createAlert} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Create Alert</button>
        </div>
      </div>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-4 text-gray-400 text-sm">Metric</th>
              <th className="text-left p-4 text-gray-400 text-sm">Threshold</th>
              <th className="text-left p-4 text-gray-400 text-sm">Created</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a, i) => (
              <tr key={i} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="p-4 text-sm capitalize">{a.metric}</td>
                <td className="p-4 text-sm">{a.threshold}</td>
                <td className="p-4 text-sm text-gray-400">{a.created_at?.slice(0, 19)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}