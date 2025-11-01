package handlers

import (
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/utils"
	"time"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required,max=50"`
	Password string `json:"password" binding:"required,min=8,max=100"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Role     string `json:"role"`
	} `json:"user"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Login attempt failed - validation error: %v (IP: %s)", err, c.ClientIP())
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request format")
		return
	}

	// Дополнительная валидация
	if !ValidateStringLength(req.Username, 1, 50) {
		log.Printf("Login attempt failed - invalid username length (IP: %s)", c.ClientIP())
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid credentials")
		return
	}

	if !ValidateStringLength(req.Password, 8, 100) {
		log.Printf("Login attempt failed - invalid password length (IP: %s)", c.ClientIP())
		SafeErrorResponse(c, nil, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		log.Printf("Login attempt failed - user not found: %s (IP: %s)", req.Username, c.ClientIP())
		SafeErrorResponse(c, err, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		log.Printf("Login attempt failed - invalid password for user: %s (IP: %s)", req.Username, c.ClientIP())
		SafeErrorResponse(c, err, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Генерация access токена
	accessToken, err := utils.GenerateToken(user.Username, user.Role)
	if err != nil {
		log.Printf("Login attempt failed - token generation error for user: %s (IP: %s)", req.Username, c.ClientIP())
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Генерация refresh токена
	refreshToken, err := utils.GenerateRefreshToken()
	if err != nil {
		log.Printf("Login attempt failed - refresh token generation error for user: %s (IP: %s)", req.Username, c.ClientIP())
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to generate refresh token")
		return
	}

	// Сохранение refresh токена в БД
	refreshTokenModel := models.RefreshToken{
		Token:     refreshToken,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(utils.RefreshTokenDuration),
	}
	if err := database.DB.Create(&refreshTokenModel).Error; err != nil {
		log.Printf("Login attempt failed - failed to save refresh token for user: %s (IP: %s)", req.Username, c.ClientIP())
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to save refresh token")
		return
	}

	log.Printf("Login successful - user: %s (IP: %s)", user.Username, c.ClientIP())

	var response LoginResponse
	response.AccessToken = accessToken
	response.RefreshToken = refreshToken
	response.User.ID = user.ID
	response.User.Username = user.Username
	response.User.Role = user.Role

	c.JSON(http.StatusOK, response)
}

func RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request format")
		return
	}

	// Поиск refresh токена в БД
	var refreshToken models.RefreshToken
	if err := database.DB.Where("token = ? AND expires_at > ?", req.RefreshToken, time.Now()).First(&refreshToken).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusUnauthorized, "Invalid or expired refresh token")
		return
	}

	// Получение пользователя
	var user models.User
	if err := database.DB.First(&user, refreshToken.UserID).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusUnauthorized, "User not found")
		return
	}

	// Генерация нового access токена
	accessToken, err := utils.GenerateToken(user.Username, user.Role)
	if err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Генерация нового refresh токена
	newRefreshToken, err := utils.GenerateRefreshToken()
	if err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to generate refresh token")
		return
	}

	// Удаление старого refresh токена и сохранение нового
	database.DB.Delete(&refreshToken)
	newRefreshTokenModel := models.RefreshToken{
		Token:     newRefreshToken,
		UserID:    user.ID,
		ExpiresAt: time.Now().Add(utils.RefreshTokenDuration),
	}
	if err := database.DB.Create(&newRefreshTokenModel).Error; err != nil {
		log.Printf("Failed to save new refresh token for user: %s", user.Username)
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to save refresh token")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": newRefreshToken,
	})
}
