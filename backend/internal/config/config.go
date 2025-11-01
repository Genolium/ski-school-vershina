package config

import (
	"log"
	"os"
	"strings"
)

type Config struct {
	Port         string
	DBPath       string
	JWTSecret    string
	CORSOrigins  []string
	Environment  string
	AdminPassword string
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
		if os.Getenv("ENVIRONMENT") == "production" {
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
		adminPassword = "admin123"
		if env == "production" {
			log.Fatal("ADMIN_PASSWORD must be set in production environment")
		}
		log.Printf("WARNING: Using default admin password. Change ADMIN_PASSWORD in production!")
	}

	return &Config{
		Port:         port,
		DBPath:       dbPath,
		JWTSecret:    jwtSecret,
		CORSOrigins:  corsOrigins,
		Environment:  env,
		AdminPassword: adminPassword,
	}
}


