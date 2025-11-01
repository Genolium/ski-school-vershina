package models

import (
	"gorm.io/gorm"
	"time"
)

type Statistic struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Label     string         `gorm:"not null" json:"label"`
	Value     string         `gorm:"not null" json:"value"`
	Suffix    string         `json:"suffix"`
	IconType  string         `gorm:"default:Trophy" json:"icon_type"`
	Order     int            `gorm:"default:0" json:"order"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
