package validators

import "strings"

// ValidateStringLength проверяет длину строки
func ValidateStringLength(s string, min, max int) bool {
	if len(s) < min || len(s) > max {
		return false
	}
	return true
}

// ValidateNotEmpty проверяет, что строка не пустая
func ValidateNotEmpty(s string) bool {
	return strings.TrimSpace(s) != ""
}

// ValidateEmail проверяет базовый формат email (упрощенная проверка)
func ValidateEmail(email string) bool {
	if !ValidateNotEmpty(email) {
		return false
	}
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// ValidatePhone проверяет базовый формат телефона
func ValidatePhone(phone string) bool {
	if !ValidateNotEmpty(phone) {
		return false
	}
	// Минимальная длина для российского формата
	return len(phone) >= 10
}
