package models

import (
    "time"
)

type User struct {
    ID        string    `json:"id" db:"id"`
    Username  string    `json:"username" db:"username"`
    Password  string    `json:"-" db:"password"`
    Role      string    `json:"role" db:"role"`
    CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type LoginRequest struct {
    Username string `json:"username" validate:"required"`
    Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
    Token string `json:"token"`
    User  User   `json:"user"`
}