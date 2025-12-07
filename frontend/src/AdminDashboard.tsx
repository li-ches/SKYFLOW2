import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Flight {
  id: string;
  number: string;
  airline: string;
  from: string;
  to: string;
  time: string;
  date: string;
  status: string;
}

export const AdminDashboard: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [newFlight, setNewFlight] = useState({
    number: '',
    airline: 'S7 Airlines',
    from: 'SKY',
    to: 'SVO',
    time: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      navigate('/login');
      return;
    }
    loadFlights();
    const interval = setInterval(loadFlights, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  const loadFlights = async () => {
    try {
      const response = await fetch('/api/flights');
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const handleAddFlight = async () => {
    if (!newFlight.number || !newFlight.time) {
      alert('Заполните номер рейса и время');
      return;
    }

    try {
      const response = await fetch('/api/flights/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: newFlight.number,
          airline: newFlight.airline,
          from: newFlight.from,
          to: newFlight.to,
          time: newFlight.time,
          status: 'scheduled'
        })
      });

      if (response.ok) {
        const timePart = newFlight.time.split('T')[1]?.substring(0, 5) || '--:--';
        alert(`Рейс ${newFlight.number} добавлен на ${timePart}`);
        loadFlights();
        
        setNewFlight({
          number: '',
          airline: 'S7 Airlines',
          from: 'SKY',
          to: 'SVO',
          time: '',
        });
      } else {
        const errorText = await response.text();
        alert(`Ошибка: ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      alert('Ошибка при добавлении рейса');
    }
  };

  const handleUpdateStatus = async (flightId: string, newStatus: string, flightNumber: string) => {
    try {
      const response = await fetch('/api/flights/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flightId, status: newStatus })
      });

      if (response.ok) {
        alert(`Статус рейса ${flightNumber} изменен на "${newStatus}"`);
        loadFlights();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при изменении статуса');
    }
  };

  const handleDeleteFlight = async (flightId: string, flightNumber: string) => {
    if (!window.confirm(`Удалить рейс ${flightNumber}?`)) return;

    try {
      const response = await fetch('/api/flights/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flightId })
      });

      if (response.ok) {
        alert(`Рейс ${flightNumber} удален`);
        loadFlights();
      }
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Ошибка при удалении рейса');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">✈️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Панель управления</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Добавить новый рейс</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Номер рейса (S7 123)"
              value={newFlight.number}
              onChange={(e) => setNewFlight({...newFlight, number: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newFlight.airline}
              onChange={(e) => setNewFlight({...newFlight, airline: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>S7 Airlines</option>
              <option>Aeroflot</option>
              <option>Turkish Airlines</option>
              <option>Emirates</option>
              <option>Nordwind</option>
              <option>Ural Airlines</option>
            </select>
            <input
              type="text"
              placeholder="Откуда (SKY)"
              value={newFlight.from}
              onChange={(e) => setNewFlight({...newFlight, from: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Куда (SVO)"
              value={newFlight.to}
              onChange={(e) => setNewFlight({...newFlight, to: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="datetime-local"
              value={newFlight.time}
              onChange={(e) => setNewFlight({...newFlight, time: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddFlight}
              className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Добавить рейс
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-800">Управление рейсами</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Рейс</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Авиакомпания</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Маршрут</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {flights.map((flight) => (
                  <tr key={flight.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg">{flight.number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{flight.airline}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{flight.from} → {flight.to}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{formatDate(flight.date)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lg">{flight.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={flight.status}
                        onChange={(e) => handleUpdateStatus(flight.id, e.target.value, flight.number)}
                        className="px-3 py-2 rounded bg-blue-100 text-blue-800 font-medium"
                      >
                        <option value="scheduled">По расписанию</option>
                        <option value="boarding">Идет посадка</option>
                        <option value="delayed">Задерживается</option>
                        <option value="departed">Вылетел</option>
                        <option value="arrived">Прибыл</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteFlight(flight.id, flight.number)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};