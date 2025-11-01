package models

import (
	"time"
	"gorm.io/gorm"
)

type Camp struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Title         string         `gorm:"not null" json:"title"`
	Location      string         `gorm:"not null" json:"location"`
	LocationDesc  string         `gorm:"type:text" json:"location_desc"`
	Dates         string         `gorm:"not null" json:"dates"`
	Duration      string         `gorm:"not null" json:"duration"`
	GroupSize     string         `gorm:"not null" json:"group_size"`
	GroupDesc     string         `gorm:"type:text" json:"group_desc"`
	TrainingDesc  string         `gorm:"type:text" json:"training_desc"`
	IncludedItems string         `gorm:"type:text" json:"included_items"` // JSON array as string
	Stats         string         `gorm:"type:text" json:"stats"`           // JSON object as string
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

