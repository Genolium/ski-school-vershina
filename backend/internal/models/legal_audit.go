package models

import (
	"time"
)

type LegalDocumentAudit struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	DocumentType  string    `gorm:"not null" json:"document_type"` // 'privacy_policy' or 'consent'
	Version       string    `json:"version"`
	Title         string    `json:"title"`
	Content       string    `gorm:"type:text" json:"content"`
	ChangedBy     string    `json:"changed_by"`
	ChangeSummary string    `json:"change_summary"`
	CreatedAt     time.Time `json:"created_at"`
}
