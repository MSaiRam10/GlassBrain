import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Nav = () => (
  <nav className="flex gap-6 mb-8">
    <a href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</a>
    <a href="/traces" className="text-gray-400 hover:text-white">Traces</a>
    <a href="/keys" className="text-blue-400 hover:text-blue-300">API Keys</a>
    <a href="/alerts" className="text-gray-400 hover:text-white">Alerts</a>
    <a href="/login" onClick={() => localStorage.removeItem('token')} className="text-red-400 hover:text-red-300 ml-auto">Logout</a>
  </nav>
)

export default function Keys() {
  const [keys, setKeys] = useState([])
  const [newKey, setNewKey] = useState(null)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get(`${API}/keys`, { headers: { 'x-api-key': token } })
      .then(res => setKeys(res.data.api_keys))
      .catch(() => navigate('/login'))
  }, [])

  const createKey = async () => {
    const res = await axios.post(`${API}/keys/create`, {}, { headers: { 'x-api-key': token } })
    setNewKey(res.data.api_key)
    setKeys([...keys, { name: 'New Key', key: res.data.api_key }])
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold text-white mb-6">GlassBrain</h1>
      <Nav />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">API Keys</h2>
        <button onClick={createKey} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">Create New Key</button>
      </div>
      {newKey && (
        <div className="bg-green-900 border border-green-700 rounded-xl p-4 mb-4">
          <p className="text-green-300 text-sm font-semibold mb-1">New API Key — copy now, won't show again</p>
          <p className="font-mono text-sm break-all">{newKey}</p>
        </div>
      )}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-4 text-gray-400 text-sm">Name</th>
              <th className="text-left p-4 text-gray-400 text-sm">Key</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k, i) => (
              <tr key={i} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="p-4 text-sm">{k.name}</td>
                <td className="p-4 text-sm font-mono text-gray-400">{k.key?.slice(0, 24)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}