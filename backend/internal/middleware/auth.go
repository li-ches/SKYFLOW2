package middleware

import (
    "context"
    "net/http"
    "strings"
    "skyflow/internal/models"
    "github.com/golang-jwt/jwt/v5"
)

func JWTAuth(jwtSecret string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            authHeader := r.Header.Get("Authorization")
            if authHeader == "" {
                http.Error(w, "Authorization header required", http.StatusUnauthorized)
                return
            }
            
            tokenString := strings.TrimPrefix(authHeader, "Bearer ")
            if tokenString == authHeader {
                http.Error(w, "Bearer token required", http.StatusUnauthorized)
                return
            }
            
            token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
                return []byte(jwtSecret), nil
            })
            
            if err != nil || !token.Valid {
                http.Error(w, "Invalid token", http.StatusUnauthorized)
                return
            }
            
            claims, ok := token.Claims.(jwt.MapClaims)
            if !ok {
                http.Error(w, "Invalid token claims", http.StatusUnauthorized)
                return
            }
            
            user := &models.User{
                ID:       claims["user_id"].(string),
                Username: claims["username"].(string),
                Role:     claims["role"].(string),
            }
            
            ctx := context.WithValue(r.Context(), "user", user)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}