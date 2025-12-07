import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode.react'
import { flightAPI, Flight } from '../services/api'

export const FlightInfo: React.FC = () => {
  const { flightNumber } = useParams<{ flightNumber: string }>()
  const [flight, setFlight] = useState<Flight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFlight()
  }, [flightNumber])

  const loadFlight = async () => {
    try {
      const response = await flightAPI.getFlightByNumber(flightNumber || '')
      setFlight(response.data)
    } catch (error) {
      console.error('Failed to load flight:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return '🟢'
      case 'boarding': return '🟡'
      case 'delayed': return '🟠'
      case 'departed': return '✈️'
      case 'arrived': return '🛬'
      case 'cancelled': return '🔴'
      default: return '⚪'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'По расписанию'
      case 'boarding': return 'Идет посадка'
      case 'delayed': return 'Задерживается'
      case 'departed': return 'Вылетел'
      case 'arrived': return 'Прибыл'
      case 'cancelled': return 'Отменен'
      default: return status
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Flight Not Found</h1>
          <p>Flight {flightNumber} not found in the system.</p>
        </div>
      </div>
    )
  }

  const flightUrl = `${window.location.origin}/flight/${flight.flightNumber}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Шапка */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SKYFLOW Airport</h1>
          <p className="text-gray-600">Real-time flight information</p>
        </div>

        {/* Основная информация */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-5xl">{getStatusIcon(flight.status)}</span>
                <div>
                  <h2 className="text-3xl font-bold">{flight.flightNumber}</h2>
                  <p className="text-gray-600">{flight.airline}</p>
                </div>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-lg font-semibold ${
                flight.status === 'delayed' ? 'bg-orange-100 text-orange-800' :
                flight.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getStatusText(flight.status)}
              </div>
            </div>
            
            {/* QR код */}
            <div className="text-center">
              <QRCode value={flightUrl} size={120} />
              <p className="text-sm text-gray-500 mt-2">Scan for quick access</p>
            </div>
          </div>

          {/* Маршрут и время */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Маршрут</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold">{flight.from}</div>
                  <div className="text-gray-600">Вылет</div>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{flight.to}</div>
                  <div className="text-gray-600">Прилет</div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Время</h3>
              <div className="flex justify-between">
                <div>
                  <div className="font-bold">Плановое:</div>
                  <div className="text-lg">{new Date(flight.scheduled).toLocaleTimeString()}</div>
                  <div className="text-sm text-gray-600">{new Date(flight.scheduled).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="font-bold">Фактическое:</div>
                  <div className={`text-lg ${
                    flight.status === 'delayed' ? 'text-orange-600' : 'text-gray-800'
                  }`}>
                    {new Date(flight.actual).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Детали */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Терминал</div>
              <div className="text-xl font-bold">{flight.terminal || 'TBA'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Гейт</div>
              <div className="text-xl font-bold">{flight.gate || 'TBA'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Статус</div>
              <div className="text-xl font-bold">{getStatusText(flight.status)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Авиакомпания</div>
              <div className="text-xl font-bold">{flight.airline}</div>
            </div>
          </div>

          {flight.delayReason && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-1">Причина задержки:</h4>
              <p className="text-yellow-700">{flight.delayReason}</p>
            </div>
          )}
        </div>

        {/* Информация для пассажиров */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-4">Информация для пассажиров</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold mb-2">Регистрация</div>
              <div>За 2 часа до вылета</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold mb-2">Посадка</div>
              <div>За 40 минут до вылета</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="font-semibold mb-2">Контакты</div>
              <div>+7 (383) 123-45-67</div>
            </div>
          </div>
        </div>

        {/* Кнопка для персонала */}
        <div className="text-center mt-8">
          <a
            href="/login"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900"
          >
            Для персонала аэропорта
          </a>
        </div>
      </div>
    </div>
  )
}