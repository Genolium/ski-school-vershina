package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/services"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// ServeUploadedFile обрабатывает запросы на загруженные файлы с поддержкой старого и нового путей
func ServeUploadedFile(c *gin.Context) {
	filepathParam := c.Param("filepath")
	if filepathParam == "" {
		c.Status(http.StatusBadRequest)
		return
	}

	// Убираем ведущий слеш и получаем имя файла
	if len(filepathParam) > 0 && filepathParam[0] == '/' {
		filepathParam = filepathParam[1:]
	}

	// Безопасность: только базовое имя файла (защита от path traversal)
	filename := filepath.Base(filepathParam)

	// Сначала пробуем новый путь (в volume)
	newPath := filepath.Join("/app/data/uploads", filename)
	fmt.Printf("ServeUploadedFile: param=%s, filename=%s, newPath=%s\n", filepathParam, filename, newPath)

	if stat, err := os.Stat(newPath); err == nil && !stat.IsDir() {
		c.File(newPath)
		return
	} else {
		fmt.Printf("ServeUploadedFile: newPath not found or error: %v\n", err)
	}

	// Если не найден, пробуем старый путь (для обратной совместимости)
	oldPath := filepath.Join("./public/uploads", filename)
	if stat, err := os.Stat(oldPath); err == nil && !stat.IsDir() {
		c.File(oldPath)
		return
	}

	// Если файл не найден ни в одном месте
	fmt.Printf("ServeUploadedFile: file not found in newPath or oldPath\n")
	c.Status(http.StatusNotFound)
}

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
	// Используем абсолютный путь для Docker контейнера
	uploadDir := "/app/data/uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create upload directory")
		return
	}

	// Генерация уникального имени файла
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%s", timestamp, file.Filename)
	filePath := filepath.Join(uploadDir, filename)

	// Сохранение файла
	src, err := file.Open()
	if err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to open uploaded file")
		return
	}
	defer src.Close()

	dst, err := os.Create(filePath)
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
	if err := database.DB.Order(database.GetOrderClause() + " ASC").Find(&coaches).Error; err != nil {
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

	services.InvalidateCache("coaches")
	LogAdminAction(c, "CREATE", "coach", coach.ID)
	c.JSON(http.StatusCreated, coach)
}

func AdminUpdateCoach(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var coach models.Coach
	if err := database.DB.First(&coach, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Coach not found")
		return
	}

	// Используем отдельную структуру для обновления, чтобы не перезаписать ID из URL
	var updateData struct {
		Name        string `json:"name"`
		Position    string `json:"position"`
		Description string `json:"description"`
		Photo       string `json:"photo"`
		Order       int    `json:"order"`
		// Явно игнорируем ID из JSON, если он придет
		ID uint `json:"id" binding:"-"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Валидация обязательных полей
	if !ValidateStringLength(updateData.Name, 1, 200) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid name length")
		return
	}
	if !ValidateStringLength(updateData.Position, 1, 200) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid position length")
		return
	}

	// Обновление полей (ID остается из URL)
	coach.Name = updateData.Name
	coach.Position = updateData.Position
	coach.Description = updateData.Description
	coach.Photo = updateData.Photo
	coach.Order = updateData.Order

	if err := database.DB.Save(&coach).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update coach")
		return
	}

	services.InvalidateCache("coaches")
	LogAdminAction(c, "UPDATE", "coach", coach.ID)
	c.JSON(http.StatusOK, coach)
}

func AdminDeleteCoach(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.Coach{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete coach")
		return
	}
	services.InvalidateCache("coaches")
	LogAdminAction(c, "DELETE", "coach", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Coach deleted"})
}
