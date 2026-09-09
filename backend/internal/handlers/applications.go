package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"ski-school-backend/internal/config"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/services"
	"strconv"
	"strings"
	"time"
)

var cfg *config.Config

func SetConfig(config *config.Config) {
	cfg = config
}

func GetApplications(c *gin.Context) {
	var applications []models.Application
	query := database.DB

	status := c.Query("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("created_at DESC").Find(&applications).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch applications")
		return
	}
	c.JSON(http.StatusOK, applications)
}

func GetApplication(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var application models.Application
	if err := database.DB.First(&application, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Application not found")
		return
	}
	c.JSON(http.StatusOK, application)
}

type UpdateApplicationRequest struct {
	Status string `json:"status" binding:"max=50"`
	Notes  string `json:"notes" binding:"max=1000"`
}

func UpdateApplication(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var req UpdateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	var application models.Application
	if err := database.DB.First(&application, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Application not found")
		return
	}

	oldStatus := string(application.Status)

	if req.Status != "" {
		if !ValidateStringLength(req.Status, 1, 50) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid status length")
			return
		}
		// Проверка значения статуса
		validStatuses := map[string]bool{
			"pending":   true,
			"contacted": true,
			"completed": true,
			"cancelled": true,
		}
		if !validStatuses[req.Status] {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid status value")
			return
		}
		application.Status = models.ApplicationStatus(req.Status)
	}
	if req.Notes != "" {
		if !ValidateStringLength(req.Notes, 0, 1000) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid notes length")
			return
		}
		application.Notes = req.Notes
	}

	if err := database.DB.Save(&application).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update application")
		return
	}

	// Отправка уведомления об изменении статуса в Telegram
	if req.Status != "" && oldStatus != string(application.Status) && cfg != nil {
		go services.SendTelegramStatusUpdate(cfg, &application, oldStatus)
	}

	LogAdminAction(c, "UPDATE", "application", application.ID)
	c.JSON(http.StatusOK, application)
}

func DeleteApplication(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.Application{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete application")
		return
	}

	LogAdminAction(c, "DELETE", "application", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Application deleted"})
}

type CreateApplicationRequest struct {
	Name                 string `json:"name" binding:"required"`
	Phone                string `json:"phone" binding:"required"`
	Age                  string `json:"age"`
	Tariff               string `json:"tariff"`
	Website              string `json:"website"` // Honeypot field for anti-spam protection
	ConsentGiven         bool   `json:"consent_given"`
	ConsentPolicyVersion string `json:"consent_policy_version"`
	UTMSource            string `json:"utm_source"`
	UTMMedium            string `json:"utm_medium"`
	UTMCampaign          string `json:"utm_campaign"`
	UTMContent           string `json:"utm_content"`
	UTMTerm              string `json:"utm_term"`
}

func CreateApplication(c *gin.Context) {
	var req CreateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request format")
		return
	}

	// Honeypot anti-spam protection: if hidden field is filled, silently drop spam without saving to DB
	if strings.TrimSpace(req.Website) != "" {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Application submitted successfully",
		})
		return
	}

	// Проверка длины строк
	if !ValidateStringLength(req.Name, 1, 200) || !ValidateStringLength(req.Phone, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	// Record ClientIP and UserAgent
	clientIP := c.ClientIP()
	userAgent := ""
	if c.Request != nil {
		userAgent = c.Request.UserAgent()
	}

	// Set ConsentTimestamp to time.Now() if ConsentGiven is true
	var consentTimestamp *time.Time
	if req.ConsentGiven {
		now := time.Now()
		consentTimestamp = &now
	}

	// Capture UTM fields from input data with fallback to query params
	utmSource := req.UTMSource
	if utmSource == "" {
		utmSource = c.Query("utm_source")
	}
	utmMedium := req.UTMMedium
	if utmMedium == "" {
		utmMedium = c.Query("utm_medium")
	}
	utmCampaign := req.UTMCampaign
	if utmCampaign == "" {
		utmCampaign = c.Query("utm_campaign")
	}
	utmContent := req.UTMContent
	if utmContent == "" {
		utmContent = c.Query("utm_content")
	}
	utmTerm := req.UTMTerm
	if utmTerm == "" {
		utmTerm = c.Query("utm_term")
	}

	application := models.Application{
		Name:                 req.Name,
		Phone:                req.Phone,
		Age:                  req.Age,
		Tariff:               req.Tariff,
		Status:               models.StatusPending,
		ConsentGiven:         req.ConsentGiven,
		ConsentTimestamp:     consentTimestamp,
		ConsentPolicyVersion: req.ConsentPolicyVersion,
		ClientIP:             clientIP,
		UserAgent:            userAgent,
		UTMSource:            utmSource,
		UTMMedium:            utmMedium,
		UTMCampaign:          utmCampaign,
		UTMContent:           utmContent,
		UTMTerm:              utmTerm,
	}

	if err := database.DB.Create(&application).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create application")
		return
	}

	// Отправка уведомления в Telegram (не блокируем ответ)
	if cfg != nil {
		go services.SendTelegramNotification(cfg, &application)
	}

	c.JSON(http.StatusCreated, application)
}

