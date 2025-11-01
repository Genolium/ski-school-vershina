package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port           string
	DBPath         string
	JWTSecret      string
	CORSOrigins    []string
	Environment    string
	AdminPassword  string
	DBType         string
	DBHost         string
	DBPort         string
	DBName         string
	DBUser         string
	DBPassword     string
	TelegramToken  string
	TelegramChatID string
}

// ValidateConfig проверяет конфигурацию и возвращает ошибки валидации
func (c *Config) ValidateConfig() []error {
	var errors []error

	env := c.Environment

	// Валидация обязательных переменных в production
	if env == "production" {
		if c.JWTSecret == "" || c.JWTSecret == "your-secret-key-change-in-production" {
			errors = append(errors, fmt.Errorf("JWT_SECRET must be set in production environment"))
		}
		if c.AdminPassword == "" {
			errors = append(errors, fmt.Errorf("ADMIN_PASSWORD must be set in production environment"))
		}
	}

	// Валидация порта
	if port, err := strconv.Atoi(c.Port); err != nil || port < 1 || port > 65535 {
		errors = append(errors, fmt.Errorf("PORT must be a valid number between 1 and 65535, got: %s", c.Port))
	}

	// Валидация CORS origins
	if len(c.CORSOrigins) == 0 && env == "production" {
		errors = append(errors, fmt.Errorf("CORS_ORIGINS must be set in production environment"))
	}
	for _, origin := range c.CORSOrigins {
		if !strings.HasPrefix(origin, "http://") && !strings.HasPrefix(origin, "https://") {
			errors = append(errors, fmt.Errorf("invalid CORS origin format: %s (must start with http:// or https://)", origin))
		}
	}

	// Валидация JWT secret (минимальная длина)
	if len(c.JWTSecret) < 32 && env == "production" {
		errors = append(errors, fmt.Errorf("JWT_SECRET must be at least 32 characters long in production"))
	}

	// Валидация пароля администратора (минимальная длина)
	if len(c.AdminPassword) < 8 && env == "production" {
		errors = append(errors, fmt.Errorf("ADMIN_PASSWORD must be at least 8 characters long in production"))
	}

	// Валидация типа БД
	if c.DBType != "" && c.DBType != "sqlite" && c.DBType != "postgres" {
		errors = append(errors, fmt.Errorf("DB_TYPE must be either 'sqlite' or 'postgres', got: %s", c.DBType))
	}

	// Валидация PostgreSQL параметров
	if c.DBType == "postgres" {
		if c.DBHost == "" {
			errors = append(errors, fmt.Errorf("DB_HOST must be set when DB_TYPE=postgres"))
		}
		if c.DBName == "" {
			errors = append(errors, fmt.Errorf("DB_NAME must be set when DB_TYPE=postgres"))
		}
		if c.DBUser == "" {
			errors = append(errors, fmt.Errorf("DB_USER must be set when DB_TYPE=postgres"))
		}
		if c.DBPassword == "" && env == "production" {
			errors = append(errors, fmt.Errorf("DB_PASSWORD must be set when DB_TYPE=postgres in production"))
		}
	}

	return errors
}

func LoadConfig() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "data.db"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		env := os.Getenv("ENVIRONMENT")
		if env == "production" {
			log.Fatal("JWT_SECRET must be set in production environment")
		}
		jwtSecret = "your-secret-key-change-in-production"
		log.Printf("WARNING: Using default JWT_SECRET. This is insecure for production!")
	}

	corsOrigins := []string{"http://localhost:5173", "http://localhost:3000"}
	if origins := os.Getenv("CORS_ORIGINS"); origins != "" {
		// Разделение по запятой для поддержки нескольких источников
		corsOrigins = []string{}
		for _, origin := range strings.Split(origins, ",") {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				corsOrigins = append(corsOrigins, origin)
			}
		}
	}

	env := os.Getenv("ENVIRONMENT")
	if env == "" {
		env = "development"
	}

	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		if env == "production" {
			log.Fatal("ADMIN_PASSWORD must be set in production environment")
		}
		log.Fatal("ADMIN_PASSWORD must be set. Use environment variable ADMIN_PASSWORD to set admin password.")
	}

	dbType := os.Getenv("DB_TYPE")
	if dbType == "" {
		dbType = "sqlite"
	}

	cfg := &Config{
		Port:           port,
		DBPath:         dbPath,
		JWTSecret:      jwtSecret,
		CORSOrigins:    corsOrigins,
		Environment:    env,
		AdminPassword:  adminPassword,
		DBType:         dbType,
		DBHost:         os.Getenv("DB_HOST"),
		DBPort:         getEnvOrDefault("DB_PORT", "5432"),
		DBName:         os.Getenv("DB_NAME"),
		DBUser:         os.Getenv("DB_USER"),
		DBPassword:     os.Getenv("DB_PASSWORD"),
		TelegramToken:  os.Getenv("TELEGRAM_BOT_TOKEN"),
		TelegramChatID: os.Getenv("TELEGRAM_CHAT_ID"),
	}

	// Валидация конфигурации
	if errors := cfg.ValidateConfig(); len(errors) > 0 {
		log.Println("Configuration validation errors:")
		for _, err := range errors {
			log.Printf("  - %v", err)
		}
		if env == "production" {
			log.Fatal("Configuration validation failed. Please fix the errors above.")
		} else {
			log.Println("WARNING: Configuration validation failed. Some features may not work correctly.")
		}
	}

	return cfg
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
