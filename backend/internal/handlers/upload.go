package handlers

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/services"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// getUploadDir возвращает путь к папке загрузок (с поддержкой Docker volume и локального режима)
func getUploadDir() string {
	if dir := os.Getenv("UPLOAD_DIR"); dir != "" {
		return dir
	}
	if fi, err := os.Stat("/app/data"); err == nil && fi.IsDir() {
		return "/app/data/uploads"
	}
	return "./data/uploads"
}

// sanitizeFilename оставляет только безопасные символы в имени файла
func sanitizeFilename(name string) string {
	var b strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			b.WriteRune(r)
		} else if r == ' ' || r == '.' {
			b.WriteRune('_')
		}
	}
	res := b.String()
	if len(res) > 40 {
		res = res[:40]
	}
	return res
}

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
	// Декодируем URL, так как могут быть пробелы и спецсимволы
	decodedPath, err := url.QueryUnescape(filepathParam)
	if err != nil {
		fmt.Printf("ServeUploadedFile: failed to decode path: %v\n", err)
		decodedPath = filepathParam // Fallback to raw path
	}

	filename := filepath.Base(decodedPath)

	// Проверяем пути: активный getUploadDir(), Docker volume /app/data/uploads, локальный ./data/uploads и старый ./public/uploads
	candidateDirs := []string{
		getUploadDir(),
		"/app/data/uploads",
		"./data/uploads",
		"./public/uploads",
	}

	for _, dir := range candidateDirs {
		filePath := filepath.Join(dir, filename)
		if stat, err := os.Stat(filePath); err == nil && !stat.IsDir() {
			c.File(filePath)
			return
		}
	}

	// Если файл не найден ни в одном месте
	fmt.Printf("ServeUploadedFile: file not found: %s\n", filename)
	c.Status(http.StatusNotFound)
}

// UploadFile обрабатывает загрузку файлов
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "No file uploaded")
		return
	}

	// Проверка типа файла без учета регистра (.jpg, .JPG, .png, .PNG и т.д.)
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif", ".jfif", ".svg"}
	isAllowed := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			isAllowed = true
			break
		}
	}
	if !isAllowed {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid file type. Allowed: jpg, jpeg, png, gif, webp, heic")
		return
	}

	// Проверка размера файла (максимум 25MB)
	if file.Size > 25*1024*1024 {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "File too large. Maximum size: 25MB")
		return
	}

	// Создание директории для загрузок, если её нет
	uploadDir := getUploadDir()
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create upload directory")
		return
	}

	// Генерация уникального безопасного имени файла
	timestampMs := time.Now().UnixNano() / 1000000
	baseRaw := strings.TrimSuffix(filepath.Base(file.Filename), filepath.Ext(file.Filename))
	cleanBase := sanitizeFilename(baseRaw)
	if cleanBase == "" {
		cleanBase = "photo"
	}
	filename := fmt.Sprintf("%d_%s%s", timestampMs, cleanBase, ext)
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
