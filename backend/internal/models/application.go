package models

import (
	"time"
	"gorm.io/gorm"
)

type ApplicationStatus string

const (
	StatusPending   ApplicationStatus = "pending"
	StatusContacted ApplicationStatus = "contacted"
	StatusCompleted ApplicationStatus = "completed"
	StatusCancelled ApplicationStatus = "cancelled"
)

type Application struct {
	ID        uint              `gorm:"primaryKey" json:"id"`
	Name      string            `gorm:"not null" json:"name"`
	Phone     string            `gorm:"not null" json:"phone"`
	Age       string            `gorm:"not null" json:"age"`
	Status    ApplicationStatus `gorm:"default:pending" json:"status"`
	Notes     string            `gorm:"type:text" json:"notes"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
	DeletedAt gorm.DeletedAt    `gorm:"index" json:"-"`
}

