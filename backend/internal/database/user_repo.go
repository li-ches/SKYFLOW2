package database

import (
    "context"
    "database/sql"
    "fmt"
    "skyflow/internal/models"
    "golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

// Создание пользователя с паролем 0000 по умолчанию
func (r *UserRepository) CreateDefaultAdmin(ctx context.Context) error {
    // Проверяем, есть ли уже админ
    var count int
    err := r.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM users WHERE username = 'admin'").Scan(&count)
    if err != nil {
        return err
    }
    
    if count > 0 {
        return nil // Админ уже существует
    }
    
    // Хэшируем пароль 0000
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte("0000"), bcrypt.DefaultCost)
    if err != nil {
        return fmt.Errorf("failed to hash password: %w", err)
    }
    
    query := `
        INSERT INTO users (id, username, password, role)
        VALUES ($1, $2, $3, $4)
    `
    
    _, err = r.db.ExecContext(ctx, query,
        generateID(),
        "admin",
        string(hashedPassword),
        "admin",
    )
    
    return err
}

// Поиск пользователя по имени
func (r *UserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
    query := `SELECT id, username, password, role, created_at FROM users WHERE username = $1`
    
    var user models.User
    err := r.db.QueryRowContext(ctx, query, username).Scan(
        &user.ID,
        &user.Username,
        &user.Password,
        &user.Role,
        &user.CreatedAt,
    )
    
    if err == sql.ErrNoRows {
        return nil, nil
    }
    
    if err != nil {
        return nil, fmt.Errorf("failed to find user: %w", err)
    }
    
    return &user, nil
}

// Проверка пароля
func (r *UserRepository) CheckPassword(ctx context.Context, username, password string) (*models.User, error) {
    user, err := r.FindByUsername(ctx, username)
    if err != nil {
        return nil, err
    }
    
    if user == nil {
        return nil, fmt.Errorf("user not found")
    }
    
    err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
    if err != nil {
        return nil, fmt.Errorf("invalid password")
    }
    
    return user, nil
}