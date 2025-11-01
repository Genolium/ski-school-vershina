package test

import (
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"os"
	"ski-school-backend/internal/config"
)

var TestDB *gorm.DB

// SetupTestDB настраивает тестовую базу данных
func SetupTestDB() (*gorm.DB, error) {
	var dialector gorm.Dialector

	// Используем SQLite в памяти для тестов по умолчанию
	// Для integration тестов можно использовать PostgreSQL через переменную окружения
	if os.Getenv("TEST_DB_TYPE") == "postgres" {
		cfg := &config.Config{
			DBType:     "postgres",
			DBHost:     os.Getenv("TEST_DB_HOST"),
			DBPort:     os.Getenv("TEST_DB_PORT"),
			DBName:     os.Getenv("TEST_DB_NAME"),
			DBUser:     os.Getenv("TEST_DB_USER"),
			DBPassword: os.Getenv("TEST_DB_PASSWORD"),
		}

		dsn := "host=" + cfg.DBHost + " port=" + cfg.DBPort + " user=" + cfg.DBUser +
			" password=" + cfg.DBPassword + " dbname=" + cfg.DBName + " sslmode=disable"
		dialector = postgres.Open(dsn)
	} else {
		// SQLite in-memory для быстрых unit тестов
		dialector = sqlite.Open(":memory:")
	}

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return nil, err
	}

	TestDB = db
	return db, nil
}

// CleanupTestDB очищает тестовую базу данных
func CleanupTestDB(db *gorm.DB) error {
	if db == nil {
		return nil
	}

	// Для SQLite in-memory просто закрываем соединение
	if os.Getenv("TEST_DB_TYPE") != "postgres" {
		sqlDB, err := db.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}

	// Для PostgreSQL удаляем все данные из таблиц
	return nil
}
