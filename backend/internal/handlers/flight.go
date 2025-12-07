package handlers

import (
    "encoding/json"
    "net/http"
    "time"
    "skyflow/internal/database"
    "skyflow/internal/models"
    "github.com/go-chi/chi/v5"
)

type FlightHandler struct {
    flightRepo *database.FlightRepository
}

func NewFlightHandler(flightRepo *database.FlightRepository) *FlightHandler {
    return &FlightHandler{flightRepo: flightRepo}
}

// Получить все рейсы
func (h *FlightHandler) GetAllFlights(w http.ResponseWriter, r *http.Request) {
    flights, err := h.flightRepo.GetAll(r.Context())
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    jsonResponse(w, flights, http.StatusOK)
}

// Получить рейс по ID
func (h *FlightHandler) GetFlight(w http.ResponseWriter, r *http.Request) {
    flightID := chi.URLParam(r, "id")
    
    flight, err := h.flightRepo.GetByID(r.Context(), flightID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    if flight == nil {
        http.Error(w, "Flight not found", http.StatusNotFound)
        return
    }
    
    jsonResponse(w, flight, http.StatusOK)
}

// Получить рейс по номеру (для QR)
func (h *FlightHandler) GetFlightByNumber(w http.ResponseWriter, r *http.Request) {
    flightNumber := chi.URLParam(r, "number")
    
    flight, err := h.flightRepo.GetByFlightNumber(r.Context(), flightNumber)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    if flight == nil {
        http.Error(w, "Flight not found", http.StatusNotFound)
        return
    }
    
    jsonResponse(w, flight, http.StatusOK)
}

// Создать рейс
func (h *FlightHandler) CreateFlight(w http.ResponseWriter, r *http.Request) {
    var req models.FlightRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    
    // Парсим время
    scheduled, err := time.Parse(time.RFC3339, req.Scheduled)
    if err != nil {
        http.Error(w, "Invalid scheduled time format", http.StatusBadRequest)
        return
    }
    
    flight := &models.Flight{
        FlightNumber: req.FlightNumber,
        Airline:      req.Airline,
        From:         req.From,
        To:           req.To,
        Scheduled:    scheduled,
        Actual:       scheduled, // по умолчанию совпадает с запланированным
        Terminal:     req.Terminal,
        Gate:         req.Gate,
        Status:       string(models.StatusScheduled),
    }
    
    if err := h.flightRepo.Create(r.Context(), flight); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    jsonResponse(w, flight, http.StatusCreated)
}

// Обновить рейс
func (h *FlightHandler) UpdateFlight(w http.ResponseWriter, r *http.Request) {
    flightID := chi.URLParam(r, "id")
    
    // Получаем существующий рейс
    flight, err := h.flightRepo.GetByID(r.Context(), flightID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    if flight == nil {
        http.Error(w, "Flight not found", http.StatusNotFound)
        return
    }
    
    var updates map[string]interface{}
    if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    
    // Обновляем поля
    if status, ok := updates["status"].(string); ok {
        flight.Status = status
    }
    if delayReason, ok := updates["delayReason"].(string); ok {
        flight.DelayReason = delayReason
    }
    if gate, ok := updates["gate"].(string); ok {
        flight.Gate = gate
    }
    if terminal, ok := updates["terminal"].(string); ok {
        flight.Terminal = terminal
    }
    if actualTime, ok := updates["actualTime"].(string); ok {
        if t, err := time.Parse(time.RFC3339, actualTime); err == nil {
            flight.Actual = t
        }
    }
    
    if err := h.flightRepo.Update(r.Context(), flight); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    jsonResponse(w, flight, http.StatusOK)
}

// Удалить рейс
func (h *FlightHandler) DeleteFlight(w http.ResponseWriter, r *http.Request) {
    flightID := chi.URLParam(r, "id")
    
    if err := h.flightRepo.Delete(r.Context(), flightID); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.WriteHeader(http.StatusNoContent)
}

// Вспомогательная функция для JSON ответов
func jsonResponse(w http.ResponseWriter, data interface{}, statusCode int) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    json.NewEncoder(w).Encode(data)
}