package models

import (
	"gorm.io/gorm"
	"time"
)

type Tariff struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"not null" json:"description"`
	Features    string         `gorm:"type:text" json:"features"` // JSON array of strings
	Price       string         `gorm:"not null" json:"price"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	Order       int            `gorm:"default:0" json:"order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

