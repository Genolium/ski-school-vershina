package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"ski-school-backend/internal/config"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/services"
	"strconv"
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
