package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/services"
	"time"
)

func GetTariffs(c *gin.Context) {
	cacheKey := "tariffs"
	if cached, found := services.GetCached(cacheKey); found {
		c.Header("Cache-Control", "public, max-age=600") // 10 минут
		c.Header("Vary", "Accept-Encoding")
		c.JSON(http.StatusOK, cached)
		return
	}

	var tariffs []models.Tariff
	if err := database.DB.Where("is_active = ?", true).Order(database.GetOrderClause() + " ASC").Find(&tariffs).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch tariffs")
		return
	}

	services.SetCached(cacheKey, tariffs, 10*time.Minute)
	c.Header("Cache-Control", "public, max-age=600") // 10 минут
	c.Header("Vary", "Accept-Encoding")
	c.JSON(http.StatusOK, tariffs)
}

func GetSchedule(c *gin.Context) {
	cacheKey := "schedule"
	if cached, found := services.GetCached(cacheKey); found {
		c.Header("Cache-Control", "public, max-age=600") // 10 минут
		c.Header("Vary", "Accept-Encoding")
		c.JSON(http.StatusOK, cached)
		return
	}

	var groups []models.ScheduleGroup
	if err := database.DB.Where("is_active = ?", true).Order(database.GetOrderClause() + " ASC").Find(&groups).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch schedule")
		return
	}

	services.SetCached(cacheKey, groups, 10*time.Minute)
	c.Header("Cache-Control", "public, max-age=600") // 10 минут
	c.Header("Vary", "Accept-Encoding")
	c.JSON(http.StatusOK, groups)
}

func GetLocations(c *gin.Context) {
	cacheKey := "locations"
	if cached, found := services.GetCached(cacheKey); found {
		c.Header("Cache-Control", "public, max-age=600") // 10 минут
		c.Header("Vary", "Accept-Encoding")
		c.JSON(http.StatusOK, cached)
		return
	}

	var locations []models.Location
	if err := database.DB.Order(database.GetOrderClause() + " ASC").Find(&locations).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch locations")
		return
	}

	services.SetCached(cacheKey, locations, 10*time.Minute)
	c.Header("Cache-Control", "public, max-age=600") // 10 минут
	c.Header("Vary", "Accept-Encoding")
	c.JSON(http.StatusOK, locations)
}

func GetCamps(c *gin.Context) {
	cacheKey := "camps"
	if cached, found := services.GetCached(cacheKey); found {
		c.Header("Cache-Control", "public, max-age=600") // 10 минут
		c.Header("Vary", "Accept-Encoding")
		c.JSON(http.StatusOK, cached)
		return
	}

	var camps []models.Camp
	if err := database.DB.Where("is_active = ?", true).Order("created_at DESC").Find(&camps).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch camps")
		return
	}

	services.SetCached(cacheKey, camps, 10*time.Minute)
	c.Header("Cache-Control", "public, max-age=600") // 10 минут
	c.Header("Vary", "Accept-Encoding")
	c.JSON(http.StatusOK, camps)
}

func GetStats(c *gin.Context) {
	cacheKey := "stats"
	if cached, found := services.GetCached(cacheKey); found {
		c.Header("Cache-Control", "public, max-age=600") // 10 минут
		c.Header("Vary", "Accept-Encoding")
		c.JSON(http.StatusOK, cached)
		return
	}

	var stats []models.Statistic
	if err := database.DB.Order(database.GetOrderClause() + " ASC").Find(&stats).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch statistics")
		return
	}

	services.SetCached(cacheKey, stats, 10*time.Minute)
	c.Header("Cache-Control", "public, max-age=600") // 10 минут
	c.Header("Vary", "Accept-Encoding")
	c.JSON(http.StatusOK, stats)
}

func GetAbout(c *gin.Context) {
	cacheKey := "about"
	if cached, found := services.GetCached(cacheKey); found {
		c.Header("Cache-Control", "public, max-age=600") // 10 минут
		c.Header("Vary", "Accept-Encoding")
		c.JSON(http.StatusOK, cached)
		return
	}

	var about models.AboutContent
	if err := database.DB.First(&about).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "About content not found")
		return
	}

	services.SetCached(cacheKey, about, 10*time.Minute)
	c.Header("Cache-Control", "public, max-age=600") // 10 минут
	c.Header("Vary", "Accept-Encoding")
	c.JSON(http.StatusOK, about)
}

func GetCoaches(c *gin.Context) {
	cacheKey := "coaches"
	if cached, found := services.GetCached(cacheKey); found {
		c.Header("Cache-Control", "public, max-age=600") // 10 минут
		c.Header("Vary", "Accept-Encoding")
		c.JSON(http.StatusOK, cached)
		return
	}

	var coaches []models.Coach
	if err := database.DB.Order(database.GetOrderClause() + " ASC").Find(&coaches).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch coaches")
		return
	}

	services.SetCached(cacheKey, coaches, 10*time.Minute)
	c.Header("Cache-Control", "public, max-age=600") // 10 минут
	c.Header("Vary", "Accept-Encoding")
	c.JSON(http.StatusOK, coaches)
}

type CreateApplicationRequest struct {
	Name   string `json:"name" binding:"required"`
	Phone  string `json:"phone" binding:"required"`
	Age    string `json:"age"`
	Tariff string `json:"tariff"`
}

func CreateApplication(c *gin.Context) {
	var req CreateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request format")
		return
	}

	// Проверка длины строк
	if !ValidateStringLength(req.Name, 1, 200) || !ValidateStringLength(req.Phone, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	application := models.Application{
		Name:   req.Name,
		Phone:  req.Phone,
		Age:    req.Age,
		Tariff: req.Tariff,
		Status: models.StatusPending,
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
