package utils_test

import (
	"ski-school-backend/internal/utils"
	"testing"
)

func TestGenerateToken(t *testing.T) {
	utils.SetJWTSecret("test-secret-key-for-testing-purposes-only")

	token, err := utils.GenerateToken("testuser", "admin")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	if token == "" {
		t.Error("Generated token is empty")
	}

	// Проверка валидации токена
	claims, err := utils.ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.Username != "testuser" {
		t.Errorf("Expected username 'testuser', got '%s'", claims.Username)
	}

	if claims.Role != "admin" {
		t.Errorf("Expected role 'admin', got '%s'", claims.Role)
	}
}

func TestGenerateRefreshToken(t *testing.T) {
	token1, err1 := utils.GenerateRefreshToken()
	if err1 != nil {
		t.Fatalf("Failed to generate refresh token: %v", err1)
	}

	token2, err2 := utils.GenerateRefreshToken()
	if err2 != nil {
		t.Fatalf("Failed to generate refresh token: %v", err2)
	}

	if token1 == token2 {
		t.Error("Refresh tokens should be unique")
	}

	if len(token1) == 0 {
		t.Error("Refresh token should not be empty")
	}
}

func TestValidateToken_InvalidToken(t *testing.T) {
	utils.SetJWTSecret("test-secret-key-for-testing-purposes-only")

	_, err := utils.ValidateToken("invalid.token.here")
	if err == nil {
		t.Error("Expected error for invalid token")
	}
}
