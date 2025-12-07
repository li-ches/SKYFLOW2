// Функция для получения URL сервера с поддержкой Docker
export const getServerUrl = async (): Promise<string> => {
  // Если уже на сервере (не localhost), используем текущий URL
  if (window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }

  try {
    // Пытаемся получить информацию с бэкенда
    const response = await fetch('/api/server/info');
    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        console.log('📡 Получен URL с сервера:', data.url);
        localStorage.setItem('skyflow_server_url', data.url);
        return data.url;
      }
    }
  } catch (error) {
    console.log('⚠️ Не удалось получить информацию с сервера:', error);
  }
  
  // Пробуем получить из localStorage
  const savedUrl = localStorage.getItem('skyflow_server_url');
  if (savedUrl) {
    return savedUrl;
  }
  
  // Fallback - проверяем несколько вариантов
  const currentHost = window.location.hostname;
  
  // Если мы в Docker или на localhost
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    const possibleUrls = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://host.docker.internal:3000',
    ];
    
    // Возвращаем первый вариант
    return possibleUrls[0];
  }
  
  // В продакшене используем текущий URL
  return window.location.origin;
};

// Функция для получения доступных адресов для отображения в UI
export const getAvailableUrls = (): string[] => {
  const currentHost = window.location.hostname;
  
  const urls = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://host.docker.internal:3000',
  ];
  
  // Добавляем адрес из localStorage если есть
  const savedUrl = localStorage.getItem('skyflow_server_url');
  if (savedUrl && !urls.includes(savedUrl)) {
    urls.push(savedUrl);
  }
  
  return [...new Set(urls)]; // Убираем дубликаты
};

// Функция для получения инструкций по подключению
export const getConnectionInstructions = (): string[] => {
  return [
    '1. Убедитесь, что телефон и компьютер в одной Wi-Fi сети',
    '2. Узнайте IP адрес компьютера:',
    '   - Windows: откройте командную строку и введите "ipconfig"',
    '   - Mac/Linux: откройте терминал и введите "ifconfig" или "ip addr"',
    '3. На телефоне введите в браузере: http://ВАШ-IP:3000',
    '4. Или отсканируйте QR код с этой страницы',
    '',
    'Если не работает:',
    '- Проверьте брандмауэр на компьютере',
    '- Убедитесь, что порт 3000 открыт',
    '- Попробуйте отключить VPN на обоих устройствах',
  ];
};

// Функция для получения локального IP через WebRTC (ваша функция)
export const getLocalIp = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Используем WebRTC для получения локального IP
    const pc = new RTCPeerConnection({ iceServers: [] });
    
    pc.createDataChannel('');
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(reject);

    pc.onicecandidate = (event) => {
      if (!event.candidate) {
        // Все кандидаты получены
        pc.close();
        reject(new Error('Не удалось определить IP'));
        return;
      }

      const candidate = event.candidate.candidate;
      const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
      
      if (match) {
        const ip = match[1];
        // Проверяем, что это локальный IP (не публичный)
        if (ip.startsWith('192.168.') || 
            ip.startsWith('10.') || 
            ip.startsWith('172.16.') || 
            ip.startsWith('172.17.') ||
            ip.startsWith('172.18.') ||
            ip.startsWith('172.19.') ||
            ip.startsWith('172.20.') ||
            ip.startsWith('172.21.') ||
            ip.startsWith('172.22.') ||
            ip.startsWith('172.23.') ||
            ip.startsWith('172.24.') ||
            ip.startsWith('172.25.') ||
            ip.startsWith('172.26.') ||
            ip.startsWith('172.27.') ||
            ip.startsWith('172.28.') ||
            ip.startsWith('172.29.') ||
            ip.startsWith('172.30.') ||
            ip.startsWith('172.31.')) {
          pc.close();
          resolve(ip);
        }
      }
    };
    
    setTimeout(() => {
      pc.close();
      reject(new Error('Таймаут получения IP'));
    }, 3000);
  });
};

// Функция для получения информации о сети (ваша функция)
export const getNetworkInfo = async () => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  let localIp = '';
  try {
    localIp = await getLocalIp();
  } catch (error) {
    console.log('Не удалось получить локальный IP');
  }

  return {
    isLocalhost,
    currentUrl: window.location.origin,
    localIp,
    port: window.location.port || '3000',
    instructions: isLocalhost ? 
      `Для доступа с телефона:
1. Убедитесь, что телефон и компьютер в одной Wi-Fi сети
2. Используйте адрес: http://${localIp || 'ВАШ-IP'}:3000
3. Чтобы узнать IP компьютера:
   - Windows: ipconfig в командной строке
   - Mac/Linux: ifconfig в терминале
   - Или проверьте настройки сети` : 
      'QR код работает на любом устройстве'
  };
};