package models

import (
	"gorm.io/gorm"
	"time"
)

type MediaType string

const (
	MediaTypePhoto MediaType = "photo"
	MediaTypeVideo MediaType = "video"
)

type Media struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	FilePath    string         `gorm:"not null" json:"file_path"`
	MediaType   MediaType      `gorm:"not null;default:photo" json:"media_type"`
	Category    string         `gorm:"default:general" json:"category"`
	EventDate   *time.Time     `json:"event_date"`
	Order       int            `gorm:"default:0" json:"order"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
