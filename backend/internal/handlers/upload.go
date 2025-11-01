package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"github.com/gin-gonic/gin"
)

// UploadFile обрабатывает загрузку файлов
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "No file uploaded")
		return
	}

	// Проверка типа файла
	ext := filepath.Ext(file.Filename)
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	isAllowed := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			isAllowed = true
			break
		}
	}
	if !isAllowed {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid file type. Allowed: jpg, jpeg, png, gif, webp")
		return
	}

	// Проверка размера файла (максимум 5MB)
	if file.Size > 5*1024*1024 {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "File too large. Maximum size: 5MB")
		return
	}

	// Создание директории для загрузок, если её нет
	uploadDir := "./public/uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create upload directory")
		return
	}

	// Генерация уникального имени файла
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%s", timestamp, file.Filename)
	filepath := filepath.Join(uploadDir, filename)

	// Сохранение файла
	src, err := file.Open()
	if err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to open uploaded file")
		return
	}
	defer src.Close()

	dst, err := os.Create(filepath)
	if err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to save file")
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to save file")
		return
	}

	// Возврат URL файла
	url := fmt.Sprintf("/uploads/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": url})
}

// CRUD для тренеров
func AdminGetCoaches(c *gin.Context) {
	var coaches []models.Coach
	if err := database.DB.Order("`order` ASC").Find(&coaches).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch coaches")
		return
	}
	c.JSON(http.StatusOK, coaches)
}

func AdminCreateCoach(c *gin.Context) {
	var coach models.Coach
	if err := c.ShouldBindJSON(&coach); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}
	
	if !ValidateStringLength(coach.Name, 1, 200) || !ValidateStringLength(coach.Position, 1, 200) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}
	
	if err := database.DB.Create(&coach).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create coach")
		return
	}
	
	LogAdminAction(c, "CREATE", "coach", coach.ID)
	c.JSON(http.StatusCreated, coach)
}

func AdminUpdateCoach(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var coach models.Coach
	if err := database.DB.First(&coach, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Coach not found")
		return
	}
	if err := c.ShouldBindJSON(&coach); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}
	
	if !ValidateStringLength(coach.Name, 1, 200) || !ValidateStringLength(coach.Position, 1, 200) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}
	
	if err := database.DB.Save(&coach).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update coach")
		return
	}
	
	LogAdminAction(c, "UPDATE", "coach", coach.ID)
	c.JSON(http.StatusOK, coach)
}

func AdminDeleteCoach(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.Coach{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete coach")
		return
	}
	LogAdminAction(c, "DELETE", "coach", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Coach deleted"})
}

