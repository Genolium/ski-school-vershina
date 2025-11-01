package database

import (
	"log"
	"ski-school-backend/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(dbPath string) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return err
	}

	// Автоматическая миграция всех моделей
	err = DB.AutoMigrate(
		&models.User{},
		&models.Application{},
		&models.ScheduleGroup{},
		&models.Location{},
		&models.Camp{},
		&models.Statistic{},
		&models.AboutContent{},
		&models.Coach{},
	)
	if err != nil {
		return err
	}

	log.Println("Database initialized successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}

