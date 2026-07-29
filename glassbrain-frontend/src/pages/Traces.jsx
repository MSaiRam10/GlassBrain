import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

const Nav = () => (
  <nav className="flex gap-6 mb-8">
    <a href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</a>
    <a href="/traces" className="text-blue-400 hover:text-blue-300">Traces</a>
    <a href="/keys" className="text-gray-400 hover:text-white">API Keys</a>
    <a href="/alerts" className="text-gray-400 hover:text-white">Alerts</a>
    <a href="/login" onClick={() => localStorage.removeItem('token')} className="text-red-400 hover:text-red-300 ml-auto">Logout</a>
  </nav>
)

export default function Traces() {
  const [traces, setTraces] = useState([])
  const [replay, setReplay] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get(`${API}/traces`, { headers: { 'x-api-key': token } })
      .then(res => setTraces(res.data.traces))
      .catch(() => navigate('/login'))
  }, [])

  const handleReplay = async (traceId) => {
    const res = await axios.get(`${API}/traces/${traceId}/replay`, { headers: { 'x-api-key': token } })
    setReplay(res.data)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold text-white mb-6">GlassBrain</h1>
      <Nav />
      <h2 className="text-xl font-semibold mb-4">Traces</h2>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-4 text-gray-400 text-sm">Prompt</th>
              <th className="text-left p-4 text-gray-400 text-sm">Model</th>
              <th className="text-left p-4 text-gray-400 text-sm">Latency</th>
              <th className="text-left p-4 text-gray-400 text-sm">Tokens</th>
              <th className="text-left p-4 text-gray-400 text-sm">Cost</th>
              <th className="text-left p-4 text-gray-400 text-sm">Time</th>
              <th className="text-left p-4 text-gray-400 text-sm">Replay</th>
            </tr>
          </thead>
          <tbody>
            {traces.map((t, i) => (
              <tr key={i} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="p-4 text-sm">{t.prompt?.slice(0, 40)}...</td>
                <td className="p-4 text-sm text-blue-400">{t.model}</td>
                <td className="p-4 text-sm">{t.latency}s</td>
                <td className="p-4 text-sm">{t.tokens}</td>
                <td className="p-4 text-sm">${t.cost}</td>
                <td className="p-4 text-sm text-gray-400">{t.created_at?.slice(0, 19)}</td>
                <td className="p-4">
                  <button onClick={() => handleReplay(t.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">Replay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {replay && (
        <div className="mt-6 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Replay Result</h3>
          <p className="text-gray-400 text-sm mb-1">Prompt</p>
          <p className="mb-4">{replay.prompt}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Original Response</p>
              <p className="bg-gray-800 p-3 rounded text-sm">{replay.original_response}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">New Response</p>
              <p className="bg-gray-800 p-3 rounded text-sm">{replay.new_response}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}