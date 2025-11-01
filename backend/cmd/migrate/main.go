package main

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
	"os"
	"ski-school-backend/internal/models"
)

func main() {
	if len(os.Args) < 3 {
		log.Fatal("Usage: migrate_data <sqlite_path> <postgres_dsn>")
	}

	sqlitePath := os.Args[1]
	postgresDSN := os.Args[2]

	// Подключение к SQLite
	sqliteDB, err := gorm.Open(sqlite.Open(sqlitePath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to SQLite: %v", err)
	}

	// Подключение к PostgreSQL
	postgresDB, err := gorm.Open(postgres.Open(postgresDSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}

	// Миграция данных
	if err := migrateData(sqliteDB, postgresDB); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Println("Migration completed successfully")
}

func migrateData(source, target *gorm.DB) error {
	// Миграция пользователей
	if err := migrateUsers(source, target); err != nil {
		return fmt.Errorf("failed to migrate users: %w", err)
	}

	// Миграция заявок
	if err := migrateApplications(source, target); err != nil {
		return fmt.Errorf("failed to migrate applications: %w", err)
	}

	// Миграция расписания
	if err := migrateSchedule(source, target); err != nil {
		return fmt.Errorf("failed to migrate schedule: %w", err)
	}

	// Миграция локаций
	if err := migrateLocations(source, target); err != nil {
		return fmt.Errorf("failed to migrate locations: %w", err)
	}

	// Миграция сборов
	if err := migrateCamps(source, target); err != nil {
		return fmt.Errorf("failed to migrate camps: %w", err)
	}

	// Миграция статистики
	if err := migrateStats(source, target); err != nil {
		return fmt.Errorf("failed to migrate stats: %w", err)
	}

	// Миграция "О нас"
	if err := migrateAbout(source, target); err != nil {
		return fmt.Errorf("failed to migrate about: %w", err)
	}

	// Миграция тренеров
	if err := migrateCoaches(source, target); err != nil {
		return fmt.Errorf("failed to migrate coaches: %w", err)
	}

	return nil
}

func migrateUsers(source, target *gorm.DB) error {
	var users []models.User
	if err := source.Find(&users).Error; err != nil {
		return err
	}

	if len(users) == 0 {
		log.Println("No users to migrate")
		return nil
	}

	for _, user := range users {
		var existing models.User
		if err := target.Where("username = ?", user.Username).First(&existing).Error; err == nil {
			log.Printf("User %s already exists, skipping", user.Username)
			continue
		}
		if err := target.Create(&user).Error; err != nil {
			return fmt.Errorf("failed to create user %s: %w", user.Username, err)
		}
	}

	log.Printf("Migrated %d users", len(users))
	return nil
}

func migrateApplications(source, target *gorm.DB) error {
	var applications []models.Application
	if err := source.Find(&applications).Error; err != nil {
		return err
	}

	if len(applications) == 0 {
		log.Println("No applications to migrate")
		return nil
	}

	for _, app := range applications {
		if err := target.Create(&app).Error; err != nil {
			return fmt.Errorf("failed to create application %d: %w", app.ID, err)
		}
	}

	log.Printf("Migrated %d applications", len(applications))
	return nil
}

func migrateSchedule(source, target *gorm.DB) error {
	var groups []models.ScheduleGroup
	if err := source.Find(&groups).Error; err != nil {
		return err
	}

	if len(groups) == 0 {
		log.Println("No schedule groups to migrate")
		return nil
	}

	for _, group := range groups {
		if err := target.Create(&group).Error; err != nil {
			return fmt.Errorf("failed to create schedule group %d: %w", group.ID, err)
		}
	}

	log.Printf("Migrated %d schedule groups", len(groups))
	return nil
}

func migrateLocations(source, target *gorm.DB) error {
	var locations []models.Location
	if err := source.Find(&locations).Error; err != nil {
		return err
	}

	if len(locations) == 0 {
		log.Println("No locations to migrate")
		return nil
	}

	for _, loc := range locations {
		if err := target.Create(&loc).Error; err != nil {
			return fmt.Errorf("failed to create location %d: %w", loc.ID, err)
		}
	}

	log.Printf("Migrated %d locations", len(locations))
	return nil
}

func migrateCamps(source, target *gorm.DB) error {
	var camps []models.Camp
	if err := source.Find(&camps).Error; err != nil {
		return err
	}

	if len(camps) == 0 {
		log.Println("No camps to migrate")
		return nil
	}

	for _, camp := range camps {
		if err := target.Create(&camp).Error; err != nil {
			return fmt.Errorf("failed to create camp %d: %w", camp.ID, err)
		}
	}

	log.Printf("Migrated %d camps", len(camps))
	return nil
}

func migrateStats(source, target *gorm.DB) error {
	var stats []models.Statistic
	if err := source.Find(&stats).Error; err != nil {
		return err
	}

	if len(stats) == 0 {
		log.Println("No statistics to migrate")
		return nil
	}

	for _, stat := range stats {
		if err := target.Create(&stat).Error; err != nil {
			return fmt.Errorf("failed to create statistic %d: %w", stat.ID, err)
		}
	}

	log.Printf("Migrated %d statistics", len(stats))
	return nil
}

func migrateAbout(source, target *gorm.DB) error {
	var about []models.AboutContent
	if err := source.Find(&about).Error; err != nil {
		return err
	}

	if len(about) == 0 {
		log.Println("No about content to migrate")
		return nil
	}

	for _, item := range about {
		if err := target.Create(&item).Error; err != nil {
			return fmt.Errorf("failed to create about content %d: %w", item.ID, err)
		}
	}

	log.Printf("Migrated %d about content items", len(about))
	return nil
}

func migrateCoaches(source, target *gorm.DB) error {
	var coaches []models.Coach
	if err := source.Find(&coaches).Error; err != nil {
		return err
	}

	if len(coaches) == 0 {
		log.Println("No coaches to migrate")
		return nil
	}

	for _, coach := range coaches {
		if err := target.Create(&coach).Error; err != nil {
			return fmt.Errorf("failed to create coach %d: %w", coach.ID, err)
		}
	}

	log.Printf("Migrated %d coaches", len(coaches))
	return nil
}
