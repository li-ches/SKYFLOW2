import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Flight {
  id: string
  flightNumber: string
  airline: string
  from: string
  to: string
  scheduled: string
  actual: string
  terminal: string
  gate: string
  status: string
  delayReason: string
}

export interface User {
  id: string
  username: string
  role: string
}

export const flightAPI = {
  // Публичные методы
  getAllFlights: () => api.get<Flight[]>('/flights'),
  getFlightByNumber: (flightNumber: string) => 
    api.get<Flight>(`/flights/number/${flightNumber}`),
  
  // Защищенные методы
  createFlight: (flight: Omit<Flight, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Flight>('/flights', flight),
  
  updateFlight: (id: string, updates: Partial<Flight>) =>
    api.put<Flight>(`/flights/${id}`, updates),
  
  deleteFlight: (id: string) =>
    api.delete(`/flights/${id}`),
}

export const authAPI = {
  login: (username: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { username, password }),
  
  getCurrentUser: () =>
    api.get<User>('/auth/me'),
}

export default api