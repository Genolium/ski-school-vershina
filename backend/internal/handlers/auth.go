package handlers

import (
	"log"
	"net/http"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/utils"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required,max=50"`
	Password string `json:"password" binding:"required,min=8,max=100"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Role     string `json:"role"`
	} `json:"user"`
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

	token, err := utils.GenerateToken(user.Username, user.Role)
	if err != nil {
		log.Printf("Login attempt failed - token generation error for user: %s (IP: %s)", req.Username, c.ClientIP())
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	log.Printf("Login successful - user: %s (IP: %s)", user.Username, c.ClientIP())

	var response LoginResponse
	response.Token = token
	response.User.ID = user.ID
	response.User.Username = user.Username
	response.User.Role = user.Role

	c.JSON(http.StatusOK, response)
}

