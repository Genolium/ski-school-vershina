package middleware

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"ski-school-backend/internal/utils"
	"testing"
)

func setupAuthTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	utils.SetJWTSecret("test-secret-key-for-middleware-tests-min-32-chars")

	r := gin.New()
	r.Use(gin.Recovery())

	protected := r.Group("/protected")
	protected.Use(AuthMiddleware())
	{
		protected.GET("/test", func(c *gin.Context) {
			username := c.GetString("username")
			role := c.GetString("role")
			c.JSON(http.StatusOK, gin.H{
				"username": username,
				"role":     role,
			})
		})
	}

	return r
}

func TestAuthMiddleware(t *testing.T) {
	router := setupAuthTestRouter()

	t.Run("ValidToken", func(t *testing.T) {
		token, err := utils.GenerateToken("testuser", "admin")
		require.NoError(t, err)

		req := httptest.NewRequest("GET", "/protected/test", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]string
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)
		assert.Equal(t, "testuser", response["username"])
		assert.Equal(t, "admin", response["role"])
	})

	t.Run("MissingAuthHeader", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/protected/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("InvalidTokenFormat", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/protected/test", nil)
		req.Header.Set("Authorization", "InvalidFormat token")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("InvalidToken", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/protected/test", nil)
		req.Header.Set("Authorization", "Bearer invalid.token.here")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("EmptyToken", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/protected/test", nil)
		req.Header.Set("Authorization", "Bearer ")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

