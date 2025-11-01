package models

import (
	"time"
	"gorm.io/gorm"
)

type Location struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Address     string         `gorm:"not null" json:"address"`
	Description string         `gorm:"type:text" json:"description"`
	Features    string         `gorm:"type:text" json:"features"` // JSON array as string
	IconType    string         `gorm:"default:MapPin" json:"icon_type"`
	Latitude    float64        `gorm:"default:0" json:"latitude"`
	Longitude   float64        `gorm:"default:0" json:"longitude"`
	RouteURL    string         `gorm:"type:text" json:"route_url"`
	Order       int            `gorm:"default:0" json:"order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

