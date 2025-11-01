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
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var media models.Media
	if err := database.DB.First(&media, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Media not found")
		return
	}

	if err := c.ShouldBindJSON(&media); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	if !ValidateStringLength(media.Title, 1, 200) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid title length")
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
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.Media{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete media")
		return
	}

	services.InvalidateCache("media")
	LogAdminAction(c, "DELETE", "media", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Media deleted"})
}
