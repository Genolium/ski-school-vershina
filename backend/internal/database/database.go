package database

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
	"ski-school-backend/internal/config"
	"ski-school-backend/internal/models"
)

var DB *gorm.DB
var cfg *config.Config

func InitDB(cfgParam *config.Config) error {
	cfg = cfgParam
	var err error
	var dialector gorm.Dialector

	if cfg.DBType == "postgres" {
		dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=UTC",
			cfgParam.DBHost,
			cfgParam.DBPort,
			cfgParam.DBUser,
			cfgParam.DBPassword,
			cfgParam.DBName,
		)
		dialector = postgres.Open(dsn)
		log.Printf("Connecting to PostgreSQL database: %s@%s:%s/%s", cfgParam.DBUser, cfgParam.DBHost, cfgParam.DBPort, cfgParam.DBName)
	} else {
		dialector = sqlite.Open(cfgParam.DBPath)
		log.Printf("Connecting to SQLite database: %s", cfgParam.DBPath)
	}

	DB, err = gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Автоматическая миграция всех моделей
	err = DB.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.Application{},
		&models.Tariff{},
		&models.ScheduleGroup{},
		&models.Location{},
		&models.Camp{},
		&models.Statistic{},
		&models.AboutContent{},
		&models.Coach{},
		&models.Media{},
		&models.LegalDocumentAudit{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	// Добавление индексов для PostgreSQL
	if cfgParam.DBType == "postgres" {
		if err := addIndexes(); err != nil {
			log.Printf("Warning: Failed to add indexes: %v", err)
		}
	}

	log.Println("Database initialized successfully")
	return nil
}

func addIndexes() error {
	// Индексы для часто используемых полей
	indexes := []struct {
		table  string
		column string
	}{
		{"applications", "created_at"},
		{"applications", "status"},
		{"schedule_groups", "is_active"},
		{"locations", "\"order\""},
		{"camps", "is_active"},
		{"camps", "created_at"},
		{"camps", "\"order\""},
		{"refresh_tokens", "expires_at"},
		{"refresh_tokens", "user_id"},
		{"coaches", "\"order\""},
	}

	for _, idx := range indexes {
		indexName := fmt.Sprintf("idx_%s_%s", idx.table, idx.column)
		columnName := idx.column
		if err := DB.Exec(fmt.Sprintf(
			"CREATE INDEX IF NOT EXISTS %s ON %s (%s)",
			indexName,
			idx.table,
			columnName,
		)).Error; err != nil {
			return fmt.Errorf("failed to create index %s: %w", indexName, err)
		}
	}

	return nil
}

func GetDB() *gorm.DB {
	return DB
}

// GetOrderClause возвращает правильный синтаксис для поля order в зависимости от типа БД
func GetOrderClause() string {
	if cfg != nil && cfg.DBType == "postgres" {
		return "\"order\""
	}
	return "`order`"
}
