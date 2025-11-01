package services

import (
	"log"
	"log/slog"
	"os"
)

var Logger *slog.Logger

func InitLogger(env string) {
	var handler slog.Handler

	if env == "production" {
		// JSON формат для production (для парсинга логов)
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		})
	} else {
		// Текстовый формат для development
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		})
	}

	Logger = slog.New(handler)
}

func LogError(msg string, err error, fields ...any) {
	if Logger != nil {
		Logger.Error(msg, append([]any{"error", err}, fields...)...)
	} else {
		log.Printf("%s: %v", msg, err)
	}
}

func LogInfo(msg string, fields ...any) {
	if Logger != nil {
		Logger.Info(msg, fields...)
	} else {
		log.Printf("%s", msg)
	}
}

func LogDebug(msg string, fields ...any) {
	if Logger != nil {
		Logger.Debug(msg, fields...)
	}
}

func LogWarn(msg string, fields ...any) {
	if Logger != nil {
		Logger.Warn(msg, fields...)
	} else {
		log.Printf("WARNING: %s", msg)
	}
}
