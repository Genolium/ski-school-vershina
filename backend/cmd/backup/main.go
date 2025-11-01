package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"ski-school-backend/internal/config"
	"ski-school-backend/internal/database"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.DBType != "postgres" {
		log.Fatal("Backup script is only for PostgreSQL databases")
	}

	// Подключение к БД для проверки
	if err := database.InitDB(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	backupDir := os.Getenv("BACKUP_DIR")
	if backupDir == "" {
		backupDir = "./backups"
	}

	if err := os.MkdirAll(backupDir, 0755); err != nil {
		log.Fatalf("Failed to create backup directory: %v", err)
	}

	// Генерация имени файла бэкапа
	timestamp := time.Now().Format("20060102_150405")
	backupFile := filepath.Join(backupDir, fmt.Sprintf("backup_%s_%s.sql", cfg.DBName, timestamp))

	// Формирование команды pg_dump
	dsn := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, "pg_dump", dsn)
	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", cfg.DBPassword))

	outputFile, err := os.Create(backupFile)
	if err != nil {
		log.Fatalf("Failed to create backup file: %v", err)
	}
	defer outputFile.Close()

	cmd.Stdout = outputFile
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Fatalf("Failed to create backup: %v", err)
	}

	log.Printf("Backup created successfully: %s", backupFile)

	// Удаление старых бэкапов (старше 7 дней)
	if err := cleanupOldBackups(backupDir, cfg.DBName, 7); err != nil {
		log.Printf("Warning: Failed to cleanup old backups: %v", err)
	}
}

func cleanupOldBackups(backupDir, dbName string, keepDays int) error {
	cutoffDate := time.Now().AddDate(0, 0, -keepDays)

	files, err := filepath.Glob(filepath.Join(backupDir, fmt.Sprintf("backup_%s_*.sql", dbName)))
	if err != nil {
		return err
	}

	for _, file := range files {
		info, err := os.Stat(file)
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoffDate) {
			if err := os.Remove(file); err != nil {
				log.Printf("Failed to delete old backup %s: %v", file, err)
			} else {
				log.Printf("Deleted old backup: %s", file)
			}
		}
	}

	return nil
}
