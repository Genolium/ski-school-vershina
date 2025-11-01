package services

import (
	"testing"
)

func TestLoggerInitialization(t *testing.T) {
	t.Run("InitLoggerDevelopment", func(t *testing.T) {
		InitLogger("development")
		if Logger == nil {
			t.Error("Expected logger to be initialized")
		}
	})

	t.Run("InitLoggerProduction", func(t *testing.T) {
		InitLogger("production")
		if Logger == nil {
			t.Error("Expected logger to be initialized")
		}
	})

	t.Run("LogError", func(t *testing.T) {
		InitLogger("test")
		LogError("test error", nil, "key", "value")
		// Проверяем что не падает
	})

	t.Run("LogInfo", func(t *testing.T) {
		InitLogger("test")
		LogInfo("test info", "key", "value")
		// Проверяем что не падает
	})

	t.Run("LogDebug", func(t *testing.T) {
		InitLogger("test")
		LogDebug("test debug", "key", "value")
		// Проверяем что не падает
	})

	t.Run("LogWarn", func(t *testing.T) {
		InitLogger("test")
		LogWarn("test warning", "key", "value")
		// Проверяем что не падает
	})

	t.Run("LogWithoutInit", func(t *testing.T) {
		Logger = nil
		LogError("test error", nil)
		LogInfo("test info")
		LogWarn("test warning")
		// Проверяем что не падает даже без инициализации
	})
}

