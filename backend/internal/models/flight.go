package models

import (
    "time"
)

type Flight struct {
    ID           string    `json:"id" db:"id"`
    FlightNumber string    `json:"flightNumber" db:"flight_number"`
    Airline      string    `json:"airline" db:"airline"`
    From         string    `json:"from" db:"origin"`
    To           string    `json:"to" db:"destination"`
    Scheduled    time.Time `json:"scheduled" db:"scheduled_time"`
    Actual       time.Time `json:"actual" db:"actual_time"`
    Terminal     string    `json:"terminal" db:"terminal"`
    Gate         string    `json:"gate" db:"gate"`
    Status       string    `json:"status" db:"status"`
    DelayReason  string    `json:"delayReason" db:"delay_reason"`
    CreatedAt    time.Time `json:"createdAt" db:"created_at"`
    UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

type FlightStatus string

const (
    StatusScheduled FlightStatus = "scheduled"
    StatusBoarding  FlightStatus = "boarding"
    StatusDelayed   FlightStatus = "delayed"
    StatusDeparted  FlightStatus = "departed"
    StatusArrived   FlightStatus = "arrived"
    StatusCancelled FlightStatus = "cancelled"
)

type FlightRequest struct {
    FlightNumber string    `json:"flightNumber" validate:"required"`
    Airline      string    `json:"airline" validate:"required"`
    From         string    `json:"from" validate:"required"`
    To           string    `json:"to" validate:"required"`
    Scheduled    string    `json:"scheduled" validate:"required"`
    Terminal     string    `json:"terminal"`
    Gate         string    `json:"gate"`
}