package models

import (
	"time"
	"gorm.io/gorm"
)

type Coach struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Position    string         `gorm:"not null" json:"position"`
	Description string         `gorm:"type:text" json:"description"`
	Photo       string         `gorm:"type:text" json:"photo"`
	Order       int            `gorm:"default:0" json:"order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

