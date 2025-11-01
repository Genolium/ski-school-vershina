package handlers

import (
	"net/http"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"github.com/gin-gonic/gin"
)

func GetSchedule(c *gin.Context) {
	var groups []models.ScheduleGroup
	if err := database.DB.Where("is_active = ?", true).Order("`order` ASC").Find(&groups).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch schedule")
		return
	}
	c.JSON(http.StatusOK, groups)
}

func GetLocations(c *gin.Context) {
	var locations []models.Location
	if err := database.DB.Order("`order` ASC").Find(&locations).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch locations")
		return
	}
	c.JSON(http.StatusOK, locations)
}

func GetCamps(c *gin.Context) {
	var camps []models.Camp
	if err := database.DB.Where("is_active = ?", true).Order("created_at DESC").Find(&camps).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch camps")
		return
	}
	c.JSON(http.StatusOK, camps)
}

func GetStats(c *gin.Context) {
	var stats []models.Statistic
	if err := database.DB.Order("`order` ASC").Find(&stats).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch statistics")
		return
	}
	c.JSON(http.StatusOK, stats)
}

func GetAbout(c *gin.Context) {
	var about models.AboutContent
	if err := database.DB.First(&about).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "About content not found")
		return
	}
	c.JSON(http.StatusOK, about)
}

func GetCoaches(c *gin.Context) {
	var coaches []models.Coach
	if err := database.DB.Order("`order` ASC").Find(&coaches).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch coaches")
		return
	}
	c.JSON(http.StatusOK, coaches)
}

type CreateApplicationRequest struct {
	Name  string `json:"name" binding:"required"`
	Phone string `json:"phone" binding:"required"`
	Age   string `json:"age" binding:"required"`
}

func CreateApplication(c *gin.Context) {
	var req CreateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request format")
		return
	}

	// Проверка длины строк
	if !ValidateStringLength(req.Name, 1, 200) || !ValidateStringLength(req.Phone, 1, 50) || !ValidateStringLength(req.Age, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	application := models.Application{
		Name:   req.Name,
		Phone:  req.Phone,
		Age:    req.Age,
		Status: models.StatusPending,
	}

	if err := database.DB.Create(&application).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create application")
		return
	}

	c.JSON(http.StatusCreated, application)
}

