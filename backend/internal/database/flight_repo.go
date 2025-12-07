package database

import (
    "context"
    "database/sql"
    "fmt"
    "time"
    "skyflow/internal/models"
)

type FlightRepository struct {
    db *sql.DB
}

func NewFlightRepository(db *sql.DB) *FlightRepository {
    return &FlightRepository{db: db}
}

// Создание рейса с защитой от SQL-инъекций
func (r *FlightRepository) Create(ctx context.Context, flight *models.Flight) error {
    query := `
        INSERT INTO flights (
            id, flight_number, airline, origin, destination, 
            scheduled_time, actual_time, terminal, gate, status,
            delay_reason, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
    `
    
    flight.ID = generateID()
    flight.CreatedAt = time.Now()
    flight.UpdatedAt = time.Now()
    
    err := r.db.QueryRowContext(ctx, query,
        flight.ID,
        flight.FlightNumber,
        flight.Airline,
        flight.From,
        flight.To,
        flight.Scheduled,
        flight.Actual,
        flight.Terminal,
        flight.Gate,
        flight.Status,
        flight.DelayReason,
        flight.CreatedAt,
        flight.UpdatedAt,
    ).Scan(&flight.ID)
    
    return err
}

// Получение всех рейсов
func (r *FlightRepository) GetAll(ctx context.Context) ([]models.Flight, error) {
    query := `
        SELECT id, flight_number, airline, origin, destination, 
               scheduled_time, actual_time, terminal, gate, status,
               delay_reason, created_at, updated_at
        FROM flights
        ORDER BY scheduled_time
    `
    
    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, fmt.Errorf("failed to get flights: %w", err)
    }
    defer rows.Close()
    
    var flights []models.Flight
    for rows.Next() {
        var flight models.Flight
        err := rows.Scan(
            &flight.ID,
            &flight.FlightNumber,
            &flight.Airline,
            &flight.From,
            &flight.To,
            &flight.Scheduled,
            &flight.Actual,
            &flight.Terminal,
            &flight.Gate,
            &flight.Status,
            &flight.DelayReason,
            &flight.CreatedAt,
            &flight.UpdatedAt,
        )
        if err != nil {
            return nil, err
        }
        flights = append(flights, flight)
    }
    
    return flights, nil
}

// Получение рейса по ID
func (r *FlightRepository) GetByID(ctx context.Context, id string) (*models.Flight, error) {
    query := `
        SELECT id, flight_number, airline, origin, destination, 
               scheduled_time, actual_time, terminal, gate, status,
               delay_reason, created_at, updated_at
        FROM flights
        WHERE id = $1
    `
    
    var flight models.Flight
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &flight.ID,
        &flight.FlightNumber,
        &flight.Airline,
        &flight.From,
        &flight.To,
        &flight.Scheduled,
        &flight.Actual,
        &flight.Terminal,
        &flight.Gate,
        &flight.Status,
        &flight.DelayReason,
        &flight.CreatedAt,
        &flight.UpdatedAt,
    )
    
    if err == sql.ErrNoRows {
        return nil, nil
    }
    
    if err != nil {
        return nil, fmt.Errorf("failed to get flight: %w", err)
    }
    
    return &flight, nil
}

// Обновление рейса
func (r *FlightRepository) Update(ctx context.Context, flight *models.Flight) error {
    query := `
        UPDATE flights SET
            flight_number = $1,
            airline = $2,
            origin = $3,
            destination = $4,
            scheduled_time = $5,
            actual_time = $6,
            terminal = $7,
            gate = $8,
            status = $9,
            delay_reason = $10,
            updated_at = $11
        WHERE id = $12
    `
    
    flight.UpdatedAt = time.Now()
    
    result, err := r.db.ExecContext(ctx, query,
        flight.FlightNumber,
        flight.Airline,
        flight.From,
        flight.To,
        flight.Scheduled,
        flight.Actual,
        flight.Terminal,
        flight.Gate,
        flight.Status,
        flight.DelayReason,
        flight.UpdatedAt,
        flight.ID,
    )
    
    if err != nil {
        return fmt.Errorf("failed to update flight: %w", err)
    }
    
    rows, _ := result.RowsAffected()
    if rows == 0 {
        return fmt.Errorf("flight not found")
    }
    
    return nil
}

// Удаление рейса
func (r *FlightRepository) Delete(ctx context.Context, id string) error {
    query := `DELETE FROM flights WHERE id = $1`
    
    result, err := r.db.ExecContext(ctx, query, id)
    if err != nil {
        return fmt.Errorf("failed to delete flight: %w", err)
    }
    
    rows, _ := result.RowsAffected()
    if rows == 0 {
        return fmt.Errorf("flight not found")
    }
    
    return nil
}

// Получение рейса по номеру (для QR кода)
func (r *FlightRepository) GetByFlightNumber(ctx context.Context, flightNumber string) (*models.Flight, error) {
    query := `
        SELECT id, flight_number, airline, origin, destination, 
               scheduled_time, actual_time, terminal, gate, status,
               delay_reason, created_at, updated_at
        FROM flights
        WHERE flight_number = $1
        ORDER BY scheduled_time DESC
        LIMIT 1
    `
    
    var flight models.Flight
    err := r.db.QueryRowContext(ctx, query, flightNumber).Scan(
        &flight.ID,
        &flight.FlightNumber,
        &flight.Airline,
        &flight.From,
        &flight.To,
        &flight.Scheduled,
        &flight.Actual,
        &flight.Terminal,
        &flight.Gate,
        &flight.Status,
        &flight.DelayReason,
        &flight.CreatedAt,
        &flight.UpdatedAt,
    )
    
    if err == sql.ErrNoRows {
        return nil, nil
    }
    
    if err != nil {
        return nil, fmt.Errorf("failed to get flight by number: %w", err)
    }
    
    return &flight, nil
}

func generateID() string {
    return fmt.Sprintf("%d", time.Now().UnixNano())
}