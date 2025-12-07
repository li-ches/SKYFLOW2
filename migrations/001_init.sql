-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица рейсов
CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    flight_number TEXT NOT NULL,
    airline TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    actual_time TIMESTAMP NOT NULL,
    terminal TEXT,
    gate TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    delay_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_flights_scheduled ON flights(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_number ON flights(flight_number);

-- Тестовые данные
INSERT INTO flights (id, flight_number, airline, origin, destination, scheduled_time, actual_time, terminal, gate, status) VALUES
('1', 'S7 123', 'S7 Airlines', 'SKY', 'SVO', '2024-03-20 14:30:00', '2024-03-20 14:30:00', 'A', '12', 'scheduled'),
('2', 'SU 456', 'Aeroflot', 'SKY', 'LED', '2024-03-20 15:45:00', '2024-03-20 15:45:00', 'A', '8', 'boarding'),
('3', 'TK 789', 'Turkish Airlines', 'SKY', 'IST', '2024-03-20 16:20:00', '2024-03-20 16:45:00', 'B', '15', 'delayed'),
('4', 'S7 987', 'S7 Airlines', 'SVO', 'SKY', '2024-03-20 17:30:00', '2024-03-20 17:30:00', 'A', '22', 'scheduled');