package validators_test

import (
	"ski-school-backend/internal/validators"
	"testing"
)

func TestValidateStringLength(t *testing.T) {
	tests := []struct {
		name     string
		s        string
		min      int
		max      int
		expected bool
	}{
		{"valid length", "test", 1, 10, true},
		{"too short", "a", 2, 10, false},
		{"too long", "very long string", 1, 5, false},
		{"empty string", "", 1, 10, false},
		{"exact min", "ab", 2, 10, true},
		{"exact max", "abcde", 1, 5, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := validators.ValidateStringLength(tt.s, tt.min, tt.max)
			if result != tt.expected {
				t.Errorf("ValidateStringLength(%q, %d, %d) = %v, want %v",
					tt.s, tt.min, tt.max, result, tt.expected)
			}
		})
	}
}

func TestValidateNotEmpty(t *testing.T) {
	tests := []struct {
		name     string
		s        string
		expected bool
	}{
		{"non-empty", "test", true},
		{"empty", "", false},
		{"whitespace only", "   ", false},
		{"with whitespace", "  test  ", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := validators.ValidateNotEmpty(tt.s)
			if result != tt.expected {
				t.Errorf("ValidateNotEmpty(%q) = %v, want %v", tt.s, result, tt.expected)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		expected bool
	}{
		{"valid email", "test@example.com", true},
		{"invalid no @", "testexample.com", false},
		{"invalid no dot", "test@example", false},
		{"empty", "", false},
		{"whitespace", "   ", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := validators.ValidateEmail(tt.email)
			if result != tt.expected {
				t.Errorf("ValidateEmail(%q) = %v, want %v", tt.email, result, tt.expected)
			}
		})
	}
}

func TestValidatePhone(t *testing.T) {
	tests := []struct {
		name     string
		phone    string
		expected bool
	}{
		{"valid phone", "+79991234567", true},
		{"short phone", "123", false},
		{"empty", "", false},
		{"whitespace", "   ", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := validators.ValidatePhone(tt.phone)
			if result != tt.expected {
				t.Errorf("ValidatePhone(%q) = %v, want %v", tt.phone, result, tt.expected)
			}
		})
	}
}
