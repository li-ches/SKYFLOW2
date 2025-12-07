package handlers

import (
    "encoding/json"
    "net/http"
    "time"
    "skyflow/internal/database"
    "skyflow/internal/models"
    "github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
    userRepo *database.UserRepository
    jwtSecret string
}

func NewAuthHandler(userRepo *database.UserRepository, jwtSecret string) *AuthHandler {
    return &AuthHandler{
        userRepo:  userRepo,
        jwtSecret: jwtSecret,
    }
}

// Логин с паролем 0000
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    var req models.LoginRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    
    // Проверяем пользователя
    user, err := h.userRepo.CheckPassword(r.Context(), req.Username, req.Password)
    if err != nil {
        http.Error(w, "Invalid username or password", http.StatusUnauthorized)
        return
    }
    
    // Создаем JWT токен
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "username": user.Username,
        "role": user.Role,
        "exp": time.Now().Add(time.Hour * 24).Unix(),
    })
    
    tokenString, err := token.SignedString([]byte(h.jwtSecret))
    if err != nil {
        http.Error(w, "Failed to generate token", http.StatusInternalServerError)
        return
    }
    
    response := models.LoginResponse{
        Token: tokenString,
        User:  *user,
    }
    
    jsonResponse(w, response, http.StatusOK)
}

// Получить текущего пользователя
func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
    // Получаем пользователя из контекста (установлено middleware)
    user, ok := r.Context().Value("user").(*models.User)
    if !ok {
        http.Error(w, "User not found in context", http.StatusUnauthorized)
        return
    }
    
    // Не возвращаем пароль
    user.Password = ""
    jsonResponse(w, user, http.StatusOK)
}