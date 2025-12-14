import { create } from 'zustand'
import { Flight } from '../services/api'

interface FlightState {
  flights: Flight[]
  currentFlight: Flight | null
  isLoading: boolean
  error: string | null
  
  setFlights: (flights: Flight[]) => void
  setCurrentFlight: (flight: Flight | null) => void
  addFlight: (flight: Flight) => void
  updateFlight: (id: string, updates: Partial<Flight>) => void
  deleteFlight: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useFlightStore = create<FlightState>((set) => ({
  flights: [],
  currentFlight: null,
  isLoading: false,
  error: null,
  
  setFlights: (flights) => set({ flights }),
  setCurrentFlight: (flight) => set({ currentFlight: flight }),
  
  addFlight: (flight) => 
    set((state) => ({ flights: [...state.flights, flight] })),
  
  updateFlight: (id, updates) =>
    set((state) => ({
      flights: state.flights.map((flight) =>
        flight.id === id ? { ...flight, ...updates } : flight
      ),
    })),
  
  deleteFlight: (id) =>
    set((state) => ({
      flights: state.flights.filter((flight) => flight.id !== id),
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
