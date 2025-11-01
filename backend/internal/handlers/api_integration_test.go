package handlers

import (
	"bytes"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"net/http/httptest"
	"ski-school-backend/internal/config"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/middleware"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/services"
	"ski-school-backend/internal/test"
	"ski-school-backend/internal/utils"
	"testing"
	"time"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)

	cfg := &config.Config{
		JWTSecret:   "test-secret-key-for-integration-tests-min-32-chars",
		Environment: "test",
		CORSOrigins: []string{"http://localhost:3000"},
		Port:        "8080",
		DBType:      "sqlite",
		DBPath:      ":memory:",
	}

	utils.SetJWTSecret(cfg.JWTSecret)
	SetConfig(cfg)
	services.InitLogger(cfg.Environment)
	services.InitCache()

	db, err := test.SetupTestDB()
	if err != nil {
		panic(err)
	}
	database.DB = db

	// Автомиграция моделей
	db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.Application{},
		&models.ScheduleGroup{},
		&models.Location{},
		&models.Camp{},
		&models.Statistic{},
		&models.AboutContent{},
		&models.Coach{},
		&models.Media{},
	)

	r := gin.New()
	r.Use(gin.Recovery())

	// Публичные роуты
	api := r.Group("/api")
	{
		api.GET("/schedule", GetSchedule)
		api.GET("/locations", GetLocations)
		api.GET("/camps", GetCamps)
		api.GET("/stats", GetStats)
		api.GET("/about", GetAbout)
		api.GET("/coaches", GetCoaches)
		api.GET("/media", GetMedia)
		api.POST("/applications", CreateApplication)
	}

	// Админ роуты
	admin := r.Group("/api/admin")
	{
		admin.POST("/login", Login)
		admin.POST("/refresh", RefreshToken)

		adminAuth := admin.Group("")
		adminAuth.Use(middleware.AuthMiddleware())
		{
			adminAuth.GET("/applications", GetApplications)
			adminAuth.GET("/applications/:id", GetApplication)
			adminAuth.PUT("/applications/:id", UpdateApplication)
			adminAuth.DELETE("/applications/:id", DeleteApplication)

			adminAuth.GET("/schedule", AdminGetSchedule)
			adminAuth.POST("/schedule", AdminCreateSchedule)
			adminAuth.PUT("/schedule/:id", AdminUpdateSchedule)
			adminAuth.DELETE("/schedule/:id", AdminDeleteSchedule)

			adminAuth.GET("/locations", AdminGetLocations)
			adminAuth.POST("/locations", AdminCreateLocation)
			adminAuth.PUT("/locations/:id", AdminUpdateLocation)
			adminAuth.DELETE("/locations/:id", AdminDeleteLocation)

			adminAuth.GET("/camps", AdminGetCamps)
			adminAuth.POST("/camps", AdminCreateCamp)
			adminAuth.PUT("/camps/:id", AdminUpdateCamp)
			adminAuth.DELETE("/camps/:id", AdminDeleteCamp)

			adminAuth.GET("/stats", AdminGetStats)
			adminAuth.POST("/stats", AdminCreateStat)
			adminAuth.PUT("/stats/:id", AdminUpdateStat)
			adminAuth.DELETE("/stats/:id", AdminDeleteStat)

			adminAuth.GET("/about", AdminGetAbout)
			adminAuth.POST("/about", AdminCreateAbout)
			adminAuth.PUT("/about/:id", AdminUpdateAbout)

			adminAuth.GET("/coaches", AdminGetCoaches)
			adminAuth.POST("/coaches", AdminCreateCoach)
			adminAuth.PUT("/coaches/:id", AdminUpdateCoach)
			adminAuth.DELETE("/coaches/:id", AdminDeleteCoach)

			adminAuth.GET("/media", AdminGetMedia)
			adminAuth.POST("/media", AdminCreateMedia)
			adminAuth.PUT("/media/:id", AdminUpdateMedia)
			adminAuth.DELETE("/media/:id", AdminDeleteMedia)
		}
	}

	return r
}

func createTestAdmin(t *testing.T, username, password string) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	require.NoError(t, err)

	user := models.User{
		Username:     username,
		PasswordHash: string(hashedPassword),
		Role:         "admin",
	}
	err = database.DB.Create(&user).Error
	require.NoError(t, err)
}

func loginAdmin(t *testing.T, router *gin.Engine, username, password string) string {
	loginReq := LoginRequest{
		Username: username,
		Password: password,
	}
	jsonData, _ := json.Marshal(loginReq)

	req := httptest.NewRequest("POST", "/api/admin/login", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response LoginResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)

	return response.AccessToken
}

func TestPublicEndpoints(t *testing.T) {
	router := setupTestRouter()

	t.Run("GetSchedule", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/schedule", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var schedule []models.ScheduleGroup
		err := json.Unmarshal(w.Body.Bytes(), &schedule)
		assert.NoError(t, err)
		assert.IsType(t, []models.ScheduleGroup{}, schedule)
	})

	t.Run("GetLocations", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/locations", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var locations []models.Location
		err := json.Unmarshal(w.Body.Bytes(), &locations)
		assert.NoError(t, err)
		assert.IsType(t, []models.Location{}, locations)
	})

	t.Run("GetCamps", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/camps", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var camps []models.Camp
		err := json.Unmarshal(w.Body.Bytes(), &camps)
		assert.NoError(t, err)
		assert.IsType(t, []models.Camp{}, camps)
	})

	t.Run("GetStats", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/stats", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var stats []models.Statistic
		err := json.Unmarshal(w.Body.Bytes(), &stats)
		assert.NoError(t, err)
		assert.IsType(t, []models.Statistic{}, stats)
	})

	t.Run("GetCoaches", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/coaches", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var coaches []models.Coach
		err := json.Unmarshal(w.Body.Bytes(), &coaches)
		assert.NoError(t, err)
		assert.IsType(t, []models.Coach{}, coaches)
	})

	t.Run("GetMedia", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/media", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var media []models.Media
		err := json.Unmarshal(w.Body.Bytes(), &media)
		assert.NoError(t, err)
		assert.IsType(t, []models.Media{}, media)
	})
}

func TestCreateApplication(t *testing.T) {
	router := setupTestRouter()

	t.Run("ValidApplication", func(t *testing.T) {
		reqBody := CreateApplicationRequest{
			Name:  "Тестовый клиент",
			Phone: "+79991234567",
			Age:   "25",
		}
		jsonData, _ := json.Marshal(reqBody)

		req := httptest.NewRequest("POST", "/api/applications", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var application models.Application
		err := json.Unmarshal(w.Body.Bytes(), &application)
		assert.NoError(t, err)
		assert.Equal(t, reqBody.Name, application.Name)
		assert.Equal(t, reqBody.Phone, application.Phone)
		assert.Equal(t, reqBody.Age, application.Age)
		assert.Equal(t, models.StatusPending, application.Status)
	})

	t.Run("InvalidRequest", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/applications", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("MissingFields", func(t *testing.T) {
		reqBody := map[string]string{
			"name": "Тестовый клиент",
		}
		jsonData, _ := json.Marshal(reqBody)

		req := httptest.NewRequest("POST", "/api/applications", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestAdminLogin(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")

	t.Run("ValidLogin", func(t *testing.T) {
		loginReq := LoginRequest{
			Username: "admin",
			Password: "password123",
		}
		jsonData, _ := json.Marshal(loginReq)

		req := httptest.NewRequest("POST", "/api/admin/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response LoginResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response.AccessToken)
		assert.NotEmpty(t, response.RefreshToken)
		assert.Equal(t, "admin", response.User.Username)
		assert.Equal(t, "admin", response.User.Role)
	})

	t.Run("InvalidCredentials", func(t *testing.T) {
		loginReq := LoginRequest{
			Username: "admin",
			Password: "wrongpassword",
		}
		jsonData, _ := json.Marshal(loginReq)

		req := httptest.NewRequest("POST", "/api/admin/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("InvalidRequest", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/admin/login", bytes.NewBuffer([]byte("invalid json")))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestRefreshToken(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")

	token := loginAdmin(t, router, "admin", "password123")
	require.NotEmpty(t, token)

	// Получаем refresh токен из БД
	var refreshToken models.RefreshToken
	err := database.DB.Where("user_id = ?", 1).First(&refreshToken).Error
	require.NoError(t, err)

	t.Run("ValidRefresh", func(t *testing.T) {
		refreshReq := RefreshTokenRequest{
			RefreshToken: refreshToken.Token,
		}
		jsonData, _ := json.Marshal(refreshReq)

		req := httptest.NewRequest("POST", "/api/admin/refresh", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["access_token"])
		assert.NotEmpty(t, response["refresh_token"])
	})

	t.Run("InvalidRefreshToken", func(t *testing.T) {
		refreshReq := RefreshTokenRequest{
			RefreshToken: "invalid-token",
		}
		jsonData, _ := json.Marshal(refreshReq)

		req := httptest.NewRequest("POST", "/api/admin/refresh", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("ExpiredRefreshToken", func(t *testing.T) {
		// Создаем истекший токен
		expiredToken := models.RefreshToken{
			Token:     "expired-token",
			UserID:    1,
			ExpiresAt: time.Now().Add(-1 * time.Hour),
		}
		database.DB.Create(&expiredToken)

		refreshReq := RefreshTokenRequest{
			RefreshToken: expiredToken.Token,
		}
		jsonData, _ := json.Marshal(refreshReq)

		req := httptest.NewRequest("POST", "/api/admin/refresh", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestAdminApplications(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	// Создаем тестовую заявку
	application := models.Application{
		Name:   "Тестовый клиент",
		Phone:  "+79991234567",
		Age:    "25",
		Status: models.StatusPending,
	}
	err := database.DB.Create(&application).Error
	require.NoError(t, err)

	t.Run("GetApplications", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/applications", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var applications []models.Application
		err := json.Unmarshal(w.Body.Bytes(), &applications)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(applications), 1)
	})

	t.Run("GetApplication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/applications/1", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var application models.Application
		err := json.Unmarshal(w.Body.Bytes(), &application)
		assert.NoError(t, err)
		assert.Equal(t, uint(1), application.ID)
	})

	t.Run("UpdateApplication", func(t *testing.T) {
		updateReq := UpdateApplicationRequest{
			Status: "contacted",
			Notes:  "Тестовые заметки",
		}
		jsonData, _ := json.Marshal(updateReq)

		req := httptest.NewRequest("PUT", "/api/admin/applications/1", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var application models.Application
		err := json.Unmarshal(w.Body.Bytes(), &application)
		assert.NoError(t, err)
		assert.Equal(t, models.StatusContacted, application.Status)
		assert.Equal(t, "Тестовые заметки", application.Notes)
	})

	t.Run("DeleteApplication", func(t *testing.T) {
		// Создаем еще одну заявку для удаления
		appToDelete := models.Application{
			Name:   "Заявка для удаления",
			Phone:  "+79999999999",
			Age:    "30",
			Status: models.StatusPending,
		}
		database.DB.Create(&appToDelete)

		req := httptest.NewRequest("DELETE", "/api/admin/applications/2", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		// Проверяем, что заявка удалена
		var deletedApp models.Application
		err := database.DB.First(&deletedApp, 2).Error
		assert.Error(t, err)
	})

	t.Run("UnauthorizedAccess", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/applications", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("InvalidToken", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/applications", nil)
		req.Header.Set("Authorization", "Bearer invalid-token")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestApplicationFiltering(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	// Создаем заявки с разными статусами
	applications := []models.Application{
		{Name: "Клиент 1", Phone: "+79991111111", Age: "20", Status: models.StatusPending},
		{Name: "Клиент 2", Phone: "+79992222222", Age: "25", Status: models.StatusContacted},
		{Name: "Клиент 3", Phone: "+79993333333", Age: "30", Status: models.StatusPending},
	}
	for _, app := range applications {
		database.DB.Create(&app)
	}

	t.Run("FilterByStatus", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/applications?status=pending", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var filteredApps []models.Application
		err := json.Unmarshal(w.Body.Bytes(), &filteredApps)
		assert.NoError(t, err)
		for _, app := range filteredApps {
			assert.Equal(t, models.StatusPending, app.Status)
		}
	})
}

func TestAdminSchedule(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	t.Run("CreateSchedule", func(t *testing.T) {
		schedule := models.ScheduleGroup{
			Group:    "Группа 1",
			AgeRange: "5-7 лет",
			Days:     "Пн, Ср",
			Time:     "10:00-11:00",
			Location: "Сквер",
			Spots:    10,
			IsActive: true,
			Order:    1,
		}
		jsonData, _ := json.Marshal(schedule)

		req := httptest.NewRequest("POST", "/api/admin/schedule", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var created models.ScheduleGroup
		err := json.Unmarshal(w.Body.Bytes(), &created)
		assert.NoError(t, err)
		assert.Equal(t, schedule.Group, created.Group)
	})

	t.Run("GetSchedule", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/schedule", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var schedule []models.ScheduleGroup
		err := json.Unmarshal(w.Body.Bytes(), &schedule)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(schedule), 1)
	})

	t.Run("UpdateSchedule", func(t *testing.T) {
		update := models.ScheduleGroup{
			Group:    "Группа 1 обновленная",
			AgeRange: "5-7 лет",
			Days:     "Пн, Ср",
			Time:     "10:00-11:00",
			Location: "Сквер",
			Spots:    15,
		}
		jsonData, _ := json.Marshal(update)

		req := httptest.NewRequest("PUT", "/api/admin/schedule/1", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updated models.ScheduleGroup
		err := json.Unmarshal(w.Body.Bytes(), &updated)
		assert.NoError(t, err)
		assert.Equal(t, "Группа 1 обновленная", updated.Group)
		assert.Equal(t, 15, updated.Spots)
	})

	t.Run("DeleteSchedule", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/admin/schedule/1", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var deleted models.ScheduleGroup
		err := database.DB.First(&deleted, 1).Error
		assert.Error(t, err)
	})
}

func TestAdminLocations(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	t.Run("CreateLocation", func(t *testing.T) {
		location := models.Location{
			Title:       "Сквер",
			Address:     "ул. Ленина, 1",
			Description: "Описание локации",
			Features:    `["Освещение", "Парковка"]`,
			IconType:    "MapPin",
			Latitude:    55.7558,
			Longitude:   37.6173,
			Order:       1,
		}
		jsonData, _ := json.Marshal(location)

		req := httptest.NewRequest("POST", "/api/admin/locations", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var created models.Location
		err := json.Unmarshal(w.Body.Bytes(), &created)
		assert.NoError(t, err)
		assert.Equal(t, location.Title, created.Title)
	})

	t.Run("GetLocations", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/locations", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var locations []models.Location
		err := json.Unmarshal(w.Body.Bytes(), &locations)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(locations), 1)
	})

	t.Run("UpdateLocation", func(t *testing.T) {
		update := models.Location{
			Title:   "Сквер обновленный",
			Address: "ул. Ленина, 1",
			Order:   1,
		}
		jsonData, _ := json.Marshal(update)

		req := httptest.NewRequest("PUT", "/api/admin/locations/1", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updated models.Location
		err := json.Unmarshal(w.Body.Bytes(), &updated)
		assert.NoError(t, err)
		assert.Equal(t, "Сквер обновленный", updated.Title)
	})

	t.Run("DeleteLocation", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/admin/locations/1", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var deleted models.Location
		err := database.DB.First(&deleted, 1).Error
		assert.Error(t, err)
	})
}

func TestAdminCamps(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	t.Run("CreateCamp", func(t *testing.T) {
		camp := models.Camp{
			Title:         "Зимний лагерь",
			Location:      "Красная Поляна",
			LocationDesc:  "Описание локации",
			Dates:         "15-25 января",
			Duration:      "10 дней",
			GroupSize:     "10-15 человек",
			GroupDesc:     "Описание группы",
			TrainingDesc:  "Описание тренировок",
			IncludedItems: `["Экипировка", "Питание"]`,
			Stats:         `{"участников": 50}`,
			IsActive:      true,
		}
		jsonData, _ := json.Marshal(camp)

		req := httptest.NewRequest("POST", "/api/admin/camps", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var created models.Camp
		err := json.Unmarshal(w.Body.Bytes(), &created)
		assert.NoError(t, err)
		assert.Equal(t, camp.Title, created.Title)
	})

	t.Run("GetCamps", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/camps", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var camps []models.Camp
		err := json.Unmarshal(w.Body.Bytes(), &camps)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(camps), 1)
	})

	t.Run("UpdateCamp", func(t *testing.T) {
		update := models.Camp{
			Title:     "Зимний лагерь обновленный",
			Location:  "Красная Поляна",
			Dates:     "15-25 января",
			Duration:  "10 дней",
			GroupSize: "10-15 человек",
			IsActive:  true,
		}
		jsonData, _ := json.Marshal(update)

		req := httptest.NewRequest("PUT", "/api/admin/camps/1", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updated models.Camp
		err := json.Unmarshal(w.Body.Bytes(), &updated)
		assert.NoError(t, err)
		assert.Equal(t, "Зимний лагерь обновленный", updated.Title)
	})

	t.Run("DeleteCamp", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/admin/camps/1", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var deleted models.Camp
		err := database.DB.First(&deleted, 1).Error
		assert.Error(t, err)
	})
}

func TestAdminStats(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	t.Run("CreateStat", func(t *testing.T) {
		stat := models.Statistic{
			Label:    "Учеников",
			Value:    "500",
			Suffix:   "+",
			IconType: "Trophy",
			Order:    1,
		}
		jsonData, _ := json.Marshal(stat)

		req := httptest.NewRequest("POST", "/api/admin/stats", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var created models.Statistic
		err := json.Unmarshal(w.Body.Bytes(), &created)
		assert.NoError(t, err)
		assert.Equal(t, stat.Label, created.Label)
	})

	t.Run("GetStats", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/stats", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var stats []models.Statistic
		err := json.Unmarshal(w.Body.Bytes(), &stats)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(stats), 1)
	})

	t.Run("UpdateStat", func(t *testing.T) {
		update := models.Statistic{
			Label:    "Учеников обновлено",
			Value:    "600",
			Suffix:   "+",
			IconType: "Trophy",
			Order:    1,
		}
		jsonData, _ := json.Marshal(update)

		req := httptest.NewRequest("PUT", "/api/admin/stats/1", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updated models.Statistic
		err := json.Unmarshal(w.Body.Bytes(), &updated)
		assert.NoError(t, err)
		assert.Equal(t, "Учеников обновлено", updated.Label)
		assert.Equal(t, "600", updated.Value)
	})

	t.Run("DeleteStat", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/admin/stats/1", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var deleted models.Statistic
		err := database.DB.First(&deleted, 1).Error
		assert.Error(t, err)
	})
}

func TestAdminAbout(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	t.Run("CreateAbout", func(t *testing.T) {
		about := models.AboutContent{
			Title:       "О нас",
			Description: "Описание школы",
			Paragraphs:  `["Параграф 1", "Параграф 2"]`,
		}
		jsonData, _ := json.Marshal(about)

		req := httptest.NewRequest("POST", "/api/admin/about", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var created models.AboutContent
		err := json.Unmarshal(w.Body.Bytes(), &created)
		assert.NoError(t, err)
		assert.Equal(t, about.Title, created.Title)
	})

	t.Run("GetAbout", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/about", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var about models.AboutContent
		err := json.Unmarshal(w.Body.Bytes(), &about)
		assert.NoError(t, err)
		assert.NotEmpty(t, about.Title)
	})

	t.Run("UpdateAbout", func(t *testing.T) {
		update := models.AboutContent{
			Title:       "О нас обновлено",
			Description: "Новое описание школы",
			Paragraphs:  `["Параграф 1", "Параграф 2", "Параграф 3"]`,
		}
		jsonData, _ := json.Marshal(update)

		req := httptest.NewRequest("PUT", "/api/admin/about/1", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updated models.AboutContent
		err := json.Unmarshal(w.Body.Bytes(), &updated)
		assert.NoError(t, err)
		assert.Equal(t, "О нас обновлено", updated.Title)
	})
}

func TestAdminCoaches(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	t.Run("CreateCoach", func(t *testing.T) {
		coach := models.Coach{
			Name:        "Иван Иванов",
			Position:    "Главный тренер",
			Description: "Опытный тренер",
			Photo:       "/uploads/coach1.jpg",
			Order:       1,
		}
		jsonData, _ := json.Marshal(coach)

		req := httptest.NewRequest("POST", "/api/admin/coaches", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var created models.Coach
		err := json.Unmarshal(w.Body.Bytes(), &created)
		assert.NoError(t, err)
		assert.Equal(t, coach.Name, created.Name)
	})

	t.Run("GetCoaches", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/coaches", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var coaches []models.Coach
		err := json.Unmarshal(w.Body.Bytes(), &coaches)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(coaches), 1)
	})

	t.Run("UpdateCoach", func(t *testing.T) {
		update := models.Coach{
			Name:        "Иван Иванов обновленный",
			Position:    "Главный тренер",
			Description: "Опытный тренер",
			Order:       1,
		}
		jsonData, _ := json.Marshal(update)

		req := httptest.NewRequest("PUT", "/api/admin/coaches/1", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updated models.Coach
		err := json.Unmarshal(w.Body.Bytes(), &updated)
		assert.NoError(t, err)
		assert.Equal(t, "Иван Иванов обновленный", updated.Name)
	})

	t.Run("DeleteCoach", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/admin/coaches/1", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var deleted models.Coach
		err := database.DB.First(&deleted, 1).Error
		assert.Error(t, err)
	})
}

func TestAdminMedia(t *testing.T) {
	router := setupTestRouter()
	createTestAdmin(t, "admin", "password123")
	token := loginAdmin(t, router, "admin", "password123")

	eventDate := time.Now()

	t.Run("CreateMedia", func(t *testing.T) {
		media := models.Media{
			Title:       "Фото тренировки",
			Description: "Описание медиа",
			FilePath:    "/uploads/media1.jpg",
			MediaType:   models.MediaTypePhoto,
			Category:    "training",
			EventDate:   &eventDate,
			Order:       1,
			IsActive:    true,
		}
		jsonData, _ := json.Marshal(media)

		req := httptest.NewRequest("POST", "/api/admin/media", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var created models.Media
		err := json.Unmarshal(w.Body.Bytes(), &created)
		assert.NoError(t, err)
		assert.Equal(t, media.Title, created.Title)
		assert.Equal(t, media.MediaType, created.MediaType)
	})

	t.Run("GetMedia", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/media", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var media []models.Media
		err := json.Unmarshal(w.Body.Bytes(), &media)
		assert.NoError(t, err)
		assert.GreaterOrEqual(t, len(media), 1)
	})

	t.Run("UpdateMedia", func(t *testing.T) {
		// Используем структуру с указателями для частичного обновления
		title := "Фото тренировки обновленное"
		mediaType := models.MediaTypePhoto
		category := "training"
		order := 1
		isActive := true

		update := map[string]interface{}{
			"title":      title,
			"media_type": mediaType,
			"category":   category,
			"order":      order,
			"is_active":  isActive,
		}
		jsonData, _ := json.Marshal(update)

		req := httptest.NewRequest("PUT", "/api/admin/media/1", bytes.NewBuffer(jsonData))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var updated models.Media
		err := json.Unmarshal(w.Body.Bytes(), &updated)
		assert.NoError(t, err)
		assert.Equal(t, "Фото тренировки обновленное", updated.Title)
	})

	t.Run("DeleteMedia", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/admin/media/1", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var deleted models.Media
		err := database.DB.First(&deleted, 1).Error
		assert.Error(t, err)
	})
}
