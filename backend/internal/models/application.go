package models

import (
	"gorm.io/gorm"
	"time"
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
	Age       string            `gorm:"" json:"age"`
	Tariff    string            `gorm:"" json:"tariff"`
	Status               ApplicationStatus `gorm:"default:pending" json:"status"`
	Notes                string            `gorm:"type:text" json:"notes"`
	ConsentGiven         bool              `json:"consent_given" gorm:"default:false"`
	ConsentTimestamp     *time.Time        `json:"consent_timestamp"`
	ConsentPolicyVersion string            `json:"consent_policy_version"`
	ClientIP             string            `json:"client_ip"`
	UserAgent            string            `json:"user_agent"`
	UTMSource            string            `json:"utm_source"`
	UTMMedium            string            `json:"utm_medium"`
	UTMCampaign          string            `json:"utm_campaign"`
	UTMContent           string            `json:"utm_content"`
	UTMTerm              string            `json:"utm_term"`
	CreatedAt            time.Time         `json:"created_at"`
	UpdatedAt            time.Time         `json:"updated_at"`
	DeletedAt            gorm.DeletedAt    `gorm:"index" json:"-"`
}
