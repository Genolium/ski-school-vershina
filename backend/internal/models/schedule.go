package models

import (
	"gorm.io/gorm"
	"time"
)

type ScheduleGroup struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Group     string         `gorm:"not null" json:"group"`
	AgeRange  string         `gorm:"not null" json:"age_range"`
	Days      string         `gorm:"not null" json:"days"`
	Time      string         `gorm:"not null" json:"time"`
	Location  string         `gorm:"not null" json:"location"`
	Spots     int            `gorm:"default:0" json:"spots"`
	Price     string         `gorm:"" json:"price"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	Order     int            `gorm:"default:0" json:"order"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
