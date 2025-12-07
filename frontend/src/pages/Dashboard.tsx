import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { flightAPI, Flight } from '../services/api'
import { useFlightStore } from '../stores/flightStore'

export const Dashboard: React.FC = () => {
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    airline: 'S7 Airlines',
    from: 'SKY',
    to: 'SVO',
    scheduled: '',
    terminal: 'A',
    gate: '',
  })
  
  const { flights, setFlights, addFlight, deleteFlight } = useFlightStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadFlights()
  }, [])

  const loadFlights = async () => {
    try {
      const response = await flightAPI.getAllFlights()
      setFlights(response.data)
    } catch (error) {
      console.error('Failed to load flights:', error)
    }
  }

  const handleCreateFlight = async () => {
    try {
      const response = await flightAPI.createFlight({
        ...newFlight,
        scheduled: new Date(newFlight.scheduled).toISOString(),
      })
      addFlight(response.data)
      setNewFlight({
        flightNumber: '',
        airline: 'S7 Airlines',
        from: 'SKY',
        to: 'SVO',
        scheduled: '',
        terminal: 'A',
        gate: '',
      })
    } catch (error) {
      console.error('Failed to create flight:', error)
    }
  }

  const handleDeleteFlight = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await flightAPI.deleteFlight(id)
        deleteFlight(id)
      } catch (error) {
        console.error('Failed to delete flight:', error)
      }
    }
  }

  const handleUpdateStatus = async (flight: Flight, status: string) => {
    try {
      await flightAPI.updateFlight(flight.id, { status })
      // Обновляем локальное состояние
      const updatedFlights = flights.map(f => 
        f.id === flight.id ? { ...f, status } : f
      )
      setFlights(updatedFlights)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'boarding': return 'bg-yellow-100 text-yellow-800'
      case 'delayed': return 'bg-orange-100 text-orange-800'
      case 'departed': return 'bg-green-100 text-green-800'
      case 'arrived': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">SKYFLOW Control Panel</h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token')
                navigate('/login')
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Форма создания рейса */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Flight</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Flight Number (e.g., S7 123)"
              value={newFlight.flightNumber}
              onChange={(e) => setNewFlight({...newFlight, flightNumber: e.target.value})}
              className="px-3 py-2 border rounded-md"
            />
            <select
              value={newFlight.airline}
              onChange={(e) => setNewFlight({...newFlight, airline: e.target.value})}
              className="px-3 py-2 border rounded-md"
            >
              <option>S7 Airlines</option>
              <option>Aeroflot</option>
              <option>Turkish Airlines</option>
              <option>Emirates</option>
              <option>Nordwind</option>
            </select>
            <input
              type="datetime-local"
              value={newFlight.scheduled}
              onChange={(e) => setNewFlight({...newFlight, scheduled: e.target.value})}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="From (SKY)"
              value={newFlight.from}
              onChange={(e) => setNewFlight({...newFlight, from: e.target.value})}
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="To (e.g., SVO)"
              value={newFlight.to}
              onChange={(e) => setNewFlight({...newFlight, to: e.target.value})}
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Gate"
              value={newFlight.gate}
              onChange={(e) => setNewFlight({...newFlight, gate: e.target.value})}
              className="px-3 py-2 border rounded-md"
            />
          </div>
          <button
            onClick={handleCreateFlight}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Flight
          </button>
        </div>

        {/* Список рейсов */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gate/Terminal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flights.map((flight) => (
                <tr key={flight.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{flight.flightNumber}</div>
                    <div className="text-sm text-gray-500">{flight.airline}</div>
                  </td>
                  <td className="px-6 py-4">
                    {flight.from} → {flight.to}
                  </td>
                  <td className="px-6 py-4">
                    <div>{new Date(flight.scheduled).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-sm text-gray-500">
                      Actual: {new Date(flight.actual).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {flight.gate ? `Gate ${flight.gate}` : 'TBA'} / Term {flight.terminal}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={flight.status}
                      onChange={(e) => handleUpdateStatus(flight, e.target.value)}
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(flight.status)}`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="boarding">Boarding</option>
                      <option value="delayed">Delayed</option>
                      <option value="departed">Departed</option>
                      <option value="arrived">Arrived</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/flight/${flight.flightNumber}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      target="_blank"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteFlight(flight.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}