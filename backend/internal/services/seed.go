package services

import (
	"golang.org/x/crypto/bcrypt"
	"ski-school-backend/internal/config"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
)

func CreateDefaultAdmin(cfg *config.Config) error {
	var count int64
	database.DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		return nil // Admin already exists
	}

	// Использование пароля из конфига (переменная окружения или значение по умолчанию)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin := models.User{
		Username:     "admin",
		PasswordHash: string(hashedPassword),
		Role:         "admin",
	}

	return database.DB.Create(&admin).Error
}

