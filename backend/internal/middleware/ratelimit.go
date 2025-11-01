package middleware

import (
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
	"github.com/gin-gonic/gin"
)

// Реализация ограничителя скорости запросов
type rateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int           // requests per window
	window   time.Duration // time window
}

type visitor struct {
	lastSeen time.Time
	count    int
	mu       sync.Mutex
}

var limiter *rateLimiter

func init() {
	limiter = &rateLimiter{
		visitors: make(map[string]*visitor),
		rate:     5,              // 5 requests
		window:   15 * time.Minute, // per 15 minutes
	}
	
	// Очистка старых посетителей каждые 30 минут
	go func() {
		for {
			time.Sleep(30 * time.Minute)
			limiter.cleanup()
		}
	}()
}

func (rl *rateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	now := time.Now()
	for k, v := range rl.visitors {
		if now.Sub(v.lastSeen) > rl.window {
			delete(rl.visitors, k)
		}
	}
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	v, exists := rl.visitors[ip]
	if !exists {
		rl.visitors[ip] = &visitor{
			lastSeen: time.Now(),
			count:    1,
		}
		rl.mu.Unlock()
		return true
	}
	rl.mu.Unlock()
	
	v.mu.Lock()
	defer v.mu.Unlock()
	
	// Сброс при истечении окна
	if time.Since(v.lastSeen) > rl.window {
		v.count = 1
		v.lastSeen = time.Now()
		return true
	}
	
	// Проверка лимита скорости
	if v.count >= rl.rate {
		return false
	}
	
	v.count++
	v.lastSeen = time.Now()
	return true
}

// getClientIP извлекает реальный IP клиента из заголовков запроса
// Приоритет: X-Real-IP, затем X-Forwarded-For, иначе ClientIP()
func getClientIP(c *gin.Context) string {
	// Сначала пробуем X-Real-IP (устанавливается nginx)
	if realIP := c.GetHeader("X-Real-IP"); realIP != "" {
		// X-Real-IP содержит один IP, берем первый
		if idx := strings.Index(realIP, ","); idx > 0 {
			return strings.TrimSpace(realIP[:idx])
		}
		return strings.TrimSpace(realIP)
	}
	
	// Пробуем X-Forwarded-For (может содержать несколько IP)
	if forwardedFor := c.GetHeader("X-Forwarded-For"); forwardedFor != "" {
		// X-Forwarded-For: client, proxy1, proxy2
		// Нужен первый (исходный клиентский) IP
		ips := strings.Split(forwardedFor, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}
	
	// Резервный вариант - ClientIP() от Gin, использует RemoteAddr
	return c.ClientIP()
}

// RateLimitMiddleware ограничивает количество запросов с одного IP
func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := getClientIP(c)
		
		if !limiter.allow(ip) {
			log.Printf("Rate limit exceeded for IP: %s (X-Real-IP: %s, X-Forwarded-For: %s)", 
				ip, c.GetHeader("X-Real-IP"), c.GetHeader("X-Forwarded-For"))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// AdminRateLimitMiddleware для админ эндпоинтов - более мягкие лимиты
// Админ эндпоинты требуют аутентификации, поэтому можно быть более мягким
func AdminRateLimitMiddleware() gin.HandlerFunc {
	adminLimiter := &rateLimiter{
		visitors: make(map[string]*visitor),
		rate:     200,            // 200 requests
		window:   1 * time.Minute, // per minute (much more lenient)
	}
	
	return func(c *gin.Context) {
		ip := getClientIP(c)
		
		adminLimiter.mu.Lock()
		v, exists := adminLimiter.visitors[ip]
		if !exists {
			adminLimiter.visitors[ip] = &visitor{
				lastSeen: time.Now(),
				count:    1,
			}
			adminLimiter.mu.Unlock()
			c.Next()
			return
		}
		adminLimiter.mu.Unlock()
		
		v.mu.Lock()
		defer v.mu.Unlock()
		
		// Сброс при истечении окна
		if time.Since(v.lastSeen) > adminLimiter.window {
			v.count = 1
			v.lastSeen = time.Now()
			c.Next()
			return
		}
		
		// Проверка лимита скорости
		if v.count >= adminLimiter.rate {
			log.Printf("Admin rate limit exceeded for IP: %s (X-Real-IP: %s, X-Forwarded-For: %s)", 
				ip, c.GetHeader("X-Real-IP"), c.GetHeader("X-Forwarded-For"))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please slow down.",
			})
			c.Abort()
			return
		}
		
		v.count++
		v.lastSeen = time.Now()
		c.Next()
	}
}

// StrictRateLimitMiddleware для эндпоинта входа - более строгие ограничения
func StrictRateLimitMiddleware() gin.HandlerFunc {
	strictLimiter := &rateLimiter{
		visitors: make(map[string]*visitor),
		rate:     5,              // 5 attempts
		window:   15 * time.Minute, // per 15 minutes
	}
	
	return func(c *gin.Context) {
		ip := getClientIP(c)
		
		strictLimiter.mu.Lock()
		v, exists := strictLimiter.visitors[ip]
		if !exists {
			strictLimiter.visitors[ip] = &visitor{
				lastSeen: time.Now(),
				count:    1,
			}
			strictLimiter.mu.Unlock()
			c.Next()
			return
		}
		strictLimiter.mu.Unlock()
		
		v.mu.Lock()
		defer v.mu.Unlock()
		
		// Сброс при истечении окна
		if time.Since(v.lastSeen) > strictLimiter.window {
			v.count = 1
			v.lastSeen = time.Now()
			c.Next()
			return
		}
		
		// Проверка лимита скорости
		if v.count >= strictLimiter.rate {
			log.Printf("Login rate limit exceeded for IP: %s", ip)
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many login attempts. Please try again in 15 minutes.",
			})
			c.Abort()
			return
		}
		
		v.count++
		v.lastSeen = time.Now()
		c.Next()
	}
}

