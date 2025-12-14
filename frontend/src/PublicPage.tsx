import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableUrls, getConnectionInstructions, getNetworkInfo } from './services/network';

interface Flight {
  id: string;
  number: string;
  airline: string;
  from: string;
  to: string;
  time: string; // "14:30"
  date: string; // "2024-03-20"
  status: string;
}

interface PublicPageProps {
  baseUrl: string;
}

export const PublicPage: React.FC<PublicPageProps> = ({ baseUrl }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [search, setSearch] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [availableUrls, setAvailableUrls] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [showConnectionHelp, setShowConnectionHelp] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const navigate = useNavigate();

  const siteUrl = baseUrl || window.location.origin;

  // Загружаем рейсы при монтировании
  useEffect(() => {
    loadFlights();
    updateTime();
    
    const timeInterval = setInterval(updateTime, 1000);
    const flightInterval = setInterval(loadFlights, 5000);
    
    // Получаем доступные инструкции
    setAvailableUrls(getAvailableUrls());
    setInstructions(getConnectionInstructions());
    
    // Получаем информацию о сети
    const loadNetworkInfo = async () => {
      const info = await getNetworkInfo();
      setNetworkInfo(info);
    };
    loadNetworkInfo();
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(flightInterval);
    };
  }, [baseUrl]);

  // Обновляем время
  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }));
    setCurrentDate(now.toLocaleDateString('ru-RU', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
  };

  // Загружаем рейсы
  const loadFlights = async () => {
    try {
      const response = await fetch('/api/flights');
      const data = await response.json();
      setFlights(data);
      
      // Если выбранный рейс существует в новых данных, обновляем его
      if (selectedFlight) {
        const updatedFlight = data.find((f: Flight) => f.id === selectedFlight.id);
        if (updatedFlight) {
          setSelectedFlight(updatedFlight);
        } else {
          // Если выбранный рейс удалили, ничего не выбираем автоматически
          // Оставляем selectedFlight как есть (null или удаленный рейс)
        }
      }
    } catch (error) {
      console.error('Error loading flights:', error);
    }
  };

  // Фильтрация рейсов
  const filteredFlights = flights.filter(flight =>
    flight.number.toLowerCase().includes(search.toLowerCase()) ||
    flight.airline.toLowerCase().includes(search.toLowerCase()) ||
    flight.from.toLowerCase().includes(search.toLowerCase()) ||
    flight.to.toLowerCase().includes(search.toLowerCase())
  );

  // Форматируем дату из "2024-03-20" в "20.03.2024"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
  };

  // Цвет статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'boarding': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-orange-100 text-orange-800';
      case 'departed': return 'bg-blue-100 text-blue-800';
      case 'arrived': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Текст статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'По расписанию';
      case 'boarding': return 'Идет посадка';
      case 'delayed': return 'Задерживается';
      case 'departed': return 'Вылетел';
      case 'arrived': return 'Прибыл';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">✈️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">SKYFLOW Airport</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-gray-600">{currentDate}</div>
                  <div className="font-bold text-blue-600">{currentTime}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Вход для персонала
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Поиск рейса (номер, авиакомпания, направление...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={() => loadFlights()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Обновить
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-2xl font-bold text-blue-600">{flights.length}</div>
              <div className="text-gray-600">Всего рейсов</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-2xl font-bold text-green-600">
                {flights.filter(f => f.status === 'scheduled').length}
              </div>
              <div className="text-gray-600">По расписанию</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-2xl font-bold text-orange-600">
                {flights.filter(f => f.status === 'delayed').length}
              </div>
              <div className="text-gray-600">Задерживается</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="text-2xl font-bold text-yellow-600">
                {flights.filter(f => f.status === 'boarding').length}
              </div>
              <div className="text-gray-600">На посадке</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая часть - список рейсов */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-bold text-gray-800">Расписание рейсов</h2>
                <p className="text-gray-600 text-sm mt-1">Обновляется автоматически</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Рейс</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Авиакомпания</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Направление</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Время вылета</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFlights.map((flight) => (
                      <tr 
                        key={flight.id} 
                        className={`hover:bg-gray-50 cursor-pointer ${selectedFlight?.id === flight.id ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedFlight(flight)}
                      >
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
                          <div className="font-bold">{flight.time}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(flight.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(flight.status)}`}>
                            {getStatusText(flight.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Правая часть - информация о рейсе */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Информация о рейсе</h2>
              
              {selectedFlight ? (
                <div className="space-y-6">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{selectedFlight.number}</div>
                    <div className="text-gray-600 mt-1">{selectedFlight.airline}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">Откуда</div>
                      <div className="text-xl font-bold">{selectedFlight.from}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">Куда</div>
                      <div className="text-xl font-bold">{selectedFlight.to}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm">Дата вылета</div>
                    <div className="text-xl font-bold">{formatDate(selectedFlight.date)}</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm">Время вылета</div>
                    <div className="text-2xl font-bold">{selectedFlight.time}</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 text-sm">Статус</div>
                    <div className={`text-xl font-bold inline-block px-4 py-2 rounded-lg ${getStatusColor(selectedFlight.status)}`}>
                      {getStatusText(selectedFlight.status)}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-bold text-green-800 mb-2">Для пассажиров:</h4>
                    <ul className="space-y-2 text-green-700">
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Регистрация за 2 часа до вылета
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Посадка за 40 минут до вылета
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> При себе иметь паспорт и посадочный талон
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Выберите рейс для просмотра информации
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Информация об аэропорте */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Информация об аэропорте</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Контакты</h3>
              <p className="text-gray-600">+7 (383) 123-45-67</p>
              <p className="text-gray-600">info@skyflow-airport.ru</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Как добраться</h3>
              <p className="text-gray-600">Автобусы: 111, 222</p>
              <p className="text-gray-600">Такси: 10 мин до центра</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-700 mb-2">Услуги</h3>
              <p className="text-gray-600">Wi-Fi: Free_SKYFLOW</p>
              <p className="text-gray-600">Камеры хранения: 1 этаж</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-xl font-bold mb-2">SKYFLOW International Airport</p>
            <p className="text-gray-400">Новосибирск, Россия • Код: SKY</p>
            <p className="text-gray-400 text-sm mt-4">
              Текущее время: {currentTime} • {currentDate}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
