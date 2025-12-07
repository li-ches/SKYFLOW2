import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PublicPage } from './PublicPage';
import { LoginPage } from './LoginPage';
import { AdminDashboard } from './AdminDashboard';
import { FlightPage } from './FlightPage';
import { getServerUrl } from './services/network';

function App() {
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUrl = async () => {
      try {
        const url = await getServerUrl();
        setBaseUrl(url);
        console.log('Base URL установлен:', url);
      } catch (error) {
        console.error('Ошибка при получении URL:', error);
        setBaseUrl(window.location.origin);
      } finally {
        setLoading(false);
      }
    };
    
    initUrl();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-4">SKYFLOW Airport</div>
          <div className="text-gray-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicPage baseUrl={baseUrl} />} />
        <Route path="/flight/:number" element={<FlightPage baseUrl={baseUrl} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;