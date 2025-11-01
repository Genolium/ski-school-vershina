package main

import (
	"log"
	"ski-school-backend/internal/config"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/handlers"
	"ski-school-backend/internal/middleware"
	"ski-school-backend/internal/services"
	"ski-school-backend/internal/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()
	utils.SetJWTSecret(cfg.JWTSecret)
	handlers.SetConfig(cfg)
	services.InitLogger(cfg.Environment)
	services.InitCache()

	// Инициализация базы данных
	if err := database.InitDB(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Создание администратора по умолчанию
	if err := services.CreateDefaultAdmin(cfg); err != nil {
		log.Printf("Warning: Failed to create default admin: %v", err)
	}

	// Заполнение начальных данных
	if err := services.SeedInitialData(); err != nil {
		log.Printf("Warning: Failed to seed initial data: %v", err)
	}

	// Установка режима Gin
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Настройка роутера
	r := gin.Default()

	// Настройка доверенных прокси для корректного определения IP за nginx
	r.SetTrustedProxies([]string{"172.16.0.0/12", "192.168.0.0/16", "10.0.0.0/8"}) // Docker сети
	r.TrustedPlatform = gin.PlatformGoogleAppEngine

	// Middleware CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = cfg.CORSOrigins
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	// Эндпоинт проверки здоровья
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	r.HEAD("/health", func(c *gin.Context) {
		c.Status(200)
	})

	// Публичные API роуты
	api := r.Group("/api")
	{
		api.GET("/schedule", handlers.GetSchedule)
		api.GET("/locations", handlers.GetLocations)
		api.GET("/camps", handlers.GetCamps)
		api.GET("/stats", handlers.GetStats)
		api.GET("/about", handlers.GetAbout)
		api.HEAD("/about", handlers.GetAbout) // Поддержка HEAD для проверки здоровья
		api.GET("/coaches", handlers.GetCoaches)
		api.GET("/media", handlers.GetMedia)
		// Rate limiting для создания заявок
		api.POST("/applications", middleware.RateLimitMiddleware(), handlers.CreateApplication)
	}

	// Админ API роуты
	admin := r.Group("/api/admin")
	{
		// Строгое ограничение скорости для эндпоинта входа
		admin.POST("/login", middleware.StrictRateLimitMiddleware(), handlers.Login)
		// Refresh токен без rate limiting (уже защищен через токен)
		admin.POST("/refresh", handlers.RefreshToken)

		// Защищенные роуты
		adminAuth := admin.Group("")
		adminAuth.Use(middleware.AdminRateLimitMiddleware()) // Более мягкое ограничение для админа
		adminAuth.Use(middleware.AuthMiddleware())           // Аутентификация
		{
			// Заявки
			adminAuth.GET("/applications", handlers.GetApplications)
			adminAuth.GET("/applications/:id", handlers.GetApplication)
			adminAuth.PUT("/applications/:id", handlers.UpdateApplication)
			adminAuth.DELETE("/applications/:id", handlers.DeleteApplication)

			// Расписание
			adminAuth.GET("/schedule", handlers.AdminGetSchedule)
			adminAuth.POST("/schedule", handlers.AdminCreateSchedule)
			adminAuth.PUT("/schedule/:id", handlers.AdminUpdateSchedule)
			adminAuth.DELETE("/schedule/:id", handlers.AdminDeleteSchedule)

			// Локации
			adminAuth.GET("/locations", handlers.AdminGetLocations)
			adminAuth.POST("/locations", handlers.AdminCreateLocation)
			adminAuth.PUT("/locations/:id", handlers.AdminUpdateLocation)
			adminAuth.DELETE("/locations/:id", handlers.AdminDeleteLocation)

			// Сборы
			adminAuth.GET("/camps", handlers.AdminGetCamps)
			adminAuth.POST("/camps", handlers.AdminCreateCamp)
			adminAuth.PUT("/camps/:id", handlers.AdminUpdateCamp)
			adminAuth.DELETE("/camps/:id", handlers.AdminDeleteCamp)

			// Статистика
			adminAuth.GET("/stats", handlers.AdminGetStats)
			adminAuth.POST("/stats", handlers.AdminCreateStat)
			adminAuth.PUT("/stats/:id", handlers.AdminUpdateStat)
			adminAuth.DELETE("/stats/:id", handlers.AdminDeleteStat)

			// О нас
			adminAuth.GET("/about", handlers.AdminGetAbout)
			adminAuth.POST("/about", handlers.AdminCreateAbout)
			adminAuth.PUT("/about/:id", handlers.AdminUpdateAbout)

			// Тренеры
			adminAuth.GET("/coaches", handlers.AdminGetCoaches)
			adminAuth.POST("/coaches", handlers.AdminCreateCoach)
			adminAuth.PUT("/coaches/:id", handlers.AdminUpdateCoach)
			adminAuth.DELETE("/coaches/:id", handlers.AdminDeleteCoach)

			// Загрузка файлов
			adminAuth.POST("/upload", handlers.UploadFile)

			// Медиа-галерея
			adminAuth.GET("/media", handlers.AdminGetMedia)
			adminAuth.POST("/media", handlers.AdminCreateMedia)
			adminAuth.PUT("/media/:id", handlers.AdminUpdateMedia)
			adminAuth.DELETE("/media/:id", handlers.AdminDeleteMedia)
		}
	}

	// Раздача загруженных файлов с поддержкой старого и нового путей
	r.GET("/uploads/*filepath", handlers.ServeUploadedFile)

	// Раздача favicon
	r.Static("/favicon", "./public/favicon")

	// Примечание: React админка обслуживается через фронтенд (Vite), не через бэкенд
	// Старый HTML файл backend/admin/index.html больше не используется

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
