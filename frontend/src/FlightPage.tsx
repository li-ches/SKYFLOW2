import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAvailableUrls, getConnectionInstructions, getNetworkInfo } from './services/network';

interface Flight {
  id: string;
  number: string;
  airline: string;
  from: string;
  to: string;
  time: string;
  status: string;
}

interface FlightPageProps {
  baseUrl: string;
}

export const FlightPage: React.FC<FlightPageProps> = ({ baseUrl }) => {
  const { number } = useParams<{ number: string }>();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [showQrHelp, setShowQrHelp] = useState(false);
  const [availableUrls, setAvailableUrls] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const navigate = useNavigate();

  const siteUrl = baseUrl || window.location.origin;

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    loadFlight();
    
    // Получаем доступные URL и инструкции
    setAvailableUrls(getAvailableUrls());
    setInstructions(getConnectionInstructions());
    
    // Получаем информацию о сети
    const loadNetworkInfo = async () => {
      const info = await getNetworkInfo();
      setNetworkInfo(info);
    };
    loadNetworkInfo();
    
    return () => clearInterval(interval);
  }, [number, baseUrl]);

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }));
  };

  const loadFlight = async () => {
    try {
      const response = await fetch('/api/flights');
      const flights = await response.json();
      const foundFlight = flights.find((f: Flight) => f.number === number);
      if (foundFlight) {
        setFlight(foundFlight);
      }
    } catch (error) {
      console.error('Error loading flight:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'boarding': return 'bg-yellow-100 text-yellow-800';
      case 'delayed': return 'bg-orange-100 text-orange-800';
      case 'departed': return 'bg-blue-100 text-blue-800';
      case 'arrived': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'По расписанию';
      case 'boarding': return 'Идет посадка';
      case 'delayed': return 'Задерживается';
      case 'departed': return 'Вылетел';
      case 'arrived': return 'Прибыл';
      default: return status;
    }
  };

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Рейс не найден</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">✈️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">SKYFLOW Airport</h1>
                <div className="text-gray-600 text-sm">{currentTime}</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Все рейсы
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">{flight.number}</h1>
            <div className="text-xl text-gray-600">{flight.airline}</div>
            <div className={`inline-block px-6 py-2 rounded-full text-lg font-bold mt-4 ${getStatusColor(flight.status)}`}>
              {getStatusText(flight.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-bold text-blue-800 mb-4 text-lg">Маршрут</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold">{flight.from}</div>
                  <div className="text-gray-600">Вылет</div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{flight.to}</div>
                  <div className="text-gray-600">Прилет</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-4 text-lg">Время</h3>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {new Date(flight.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="text-gray-600 mt-2">
                  {new Date(flight.time).toLocaleDateString('ru-RU', { 
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-xl">
              <h4 className="font-bold text-green-800 mb-2">Регистрация</h4>
              <p className="text-green-700">За 2 часа до вылета</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <h4 className="font-bold text-yellow-800 mb-2">Посадка</h4>
              <p className="text-yellow-700">За 40 минут до вылета</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-bold text-blue-800 mb-2">Контакты</h4>
              <p className="text-blue-700">+7 (383) 123-45-67</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium"
          >
            ← Назад ко всем рейсам
          </button>
          <p className="text-gray-500 text-sm mt-4">
            Обновлено: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
      </main>

      <footer className="bg-gray-800 text-white mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-lg font-bold mb-2">SKYFLOW Airport</p>
            <p className="text-gray-400 text-sm">Информация о рейсах в реальном времени</p>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <a href="/" className="text-gray-300 hover:text-white">Главная</a>
              <a href="/login" className="text-gray-300 hover:text-white">Для персонала</a>
              <span className="text-gray-400">Текущее время: {currentTime}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};