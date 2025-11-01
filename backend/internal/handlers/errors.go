package handlers

import (
	"log"
	"github.com/gin-gonic/gin"
)

// SafeErrorResponse безопасно обрабатывает ошибки, не раскрывая внутренние детали
func SafeErrorResponse(c *gin.Context, err error, statusCode int, userMessage string) {
	// Логирование полных деталей ошибки на сервере
	log.Printf("Error [%d]: %v - Path: %s, IP: %s", 
		statusCode, err, c.Request.URL.Path, c.ClientIP())
	
	// Отправка общего сообщения клиенту
	if userMessage == "" {
		userMessage = "An error occurred. Please try again later."
	}
	
	c.JSON(statusCode, gin.H{"error": userMessage})
}

// ValidateStringLength проверяет длину строки
func ValidateStringLength(s string, min, max int) bool {
	if len(s) < min || len(s) > max {
		return false
	}
	return true
}

// LogAdminAction логирует административные действия для аудита
func LogAdminAction(c *gin.Context, action string, resource string, resourceID uint) {
	username := c.GetString("username")
	if username == "" {
		username = "unknown"
	}
	log.Printf("Admin Action: user=%s, action=%s, resource=%s, id=%d, ip=%s",
		username, action, resource, resourceID, c.ClientIP())
}

