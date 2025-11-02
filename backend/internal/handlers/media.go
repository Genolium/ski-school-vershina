package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/services"
	"strconv"
	"time"
)

func GetMedia(c *gin.Context) {
	cacheKey := "media"
	if cached, found := services.GetCached(cacheKey); found {
		c.Header("Cache-Control", "public, max-age=600") // 10 минут
		c.Header("Vary", "Accept-Encoding")
		c.JSON(http.StatusOK, cached)
		return
	}

	var media []models.Media
	query := database.DB.Where("is_active = ?", true)

	category := c.Query("category")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	mediaType := c.Query("type")
	if mediaType != "" {
		query = query.Where("media_type = ?", mediaType)
	}

	if err := query.Order("event_date DESC, " + database.GetOrderClause() + " ASC, created_at DESC").Find(&media).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch media")
		return
	}

	services.SetCached(cacheKey, media, 10*time.Minute)
	c.Header("Cache-Control", "public, max-age=600") // 10 минут
	c.Header("Vary", "Accept-Encoding")
	c.JSON(http.StatusOK, media)
}

func AdminGetMedia(c *gin.Context) {
	var media []models.Media
	query := database.DB

	category := c.Query("category")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	mediaType := c.Query("type")
	if mediaType != "" {
		query = query.Where("media_type = ?", mediaType)
	}

	if err := query.Order("event_date DESC, " + database.GetOrderClause() + " ASC, created_at DESC").Find(&media).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch media")
		return
	}

	c.JSON(http.StatusOK, media)
}

func AdminCreateMedia(c *gin.Context) {
	var media models.Media
	if err := c.ShouldBindJSON(&media); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	if !ValidateStringLength(media.Title, 1, 200) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid title length")
		return
	}

	if err := database.DB.Create(&media).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create media")
		return
	}

	services.InvalidateCache("media")
	LogAdminAction(c, "CREATE", "media", media.ID)
	c.JSON(http.StatusCreated, media)
}

func AdminUpdateMedia(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var media models.Media
	if err := database.DB.First(&media, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Media not found")
		return
	}

	// Используем отдельную структуру для обновления
	var updateData struct {
		Title       *string            `json:"title"`
		Description *string            `json:"description"`
		FilePath    *string            `json:"file_path"`
		MediaType   *models.MediaType  `json:"media_type"`
		Category    *string            `json:"category"`
		EventDate   *string            `json:"event_date"` // ISO date string
		Order       *int               `json:"order"`
		IsActive    *bool              `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Обновление только переданных полей
	if updateData.Title != nil {
		if !ValidateStringLength(*updateData.Title, 1, 200) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid title length")
			return
		}
		media.Title = *updateData.Title
	}
	if updateData.Description != nil {
		media.Description = *updateData.Description
	}
	if updateData.FilePath != nil {
		media.FilePath = *updateData.FilePath
	}
	if updateData.MediaType != nil {
		// Проверка валидности типа
		if *updateData.MediaType != models.MediaTypePhoto && *updateData.MediaType != models.MediaTypeVideo {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid media type")
			return
		}
		media.MediaType = *updateData.MediaType
	}
	if updateData.Category != nil {
		media.Category = *updateData.Category
	}
	if updateData.EventDate != nil {
		if *updateData.EventDate != "" {
			parsedDate, err := time.Parse("2006-01-02", *updateData.EventDate)
			if err != nil {
				SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid date format")
				return
			}
			media.EventDate = &parsedDate
		} else {
			media.EventDate = nil
		}
	}
	if updateData.Order != nil {
		media.Order = *updateData.Order
	}
	if updateData.IsActive != nil {
		media.IsActive = *updateData.IsActive
	}

	// Валидация обязательных полей перед сохранением
	if !ValidateStringLength(media.Title, 1, 200) || media.FilePath == "" {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Title and file_path are required")
		return
	}

	if err := database.DB.Save(&media).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update media")
		return
	}

	services.InvalidateCache("media")
	LogAdminAction(c, "UPDATE", "media", media.ID)
	c.JSON(http.StatusOK, media)
}

func AdminDeleteMedia(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.Media{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete media")
		return
	}

	services.InvalidateCache("media")
	LogAdminAction(c, "DELETE", "media", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Media deleted"})
}
