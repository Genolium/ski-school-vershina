package services

import (
	"github.com/patrickmn/go-cache"
	"time"
)

var Cache *cache.Cache

func InitCache() {
	// TTL 10 минут для статического контента, очистка каждые 15 минут
	Cache = cache.New(10*time.Minute, 15*time.Minute)
}

func GetCached(key string) (interface{}, bool) {
	if Cache == nil {
		return nil, false
	}
	return Cache.Get(key)
}

func SetCached(key string, value interface{}, ttl time.Duration) {
	if Cache == nil {
		return
	}
	Cache.Set(key, value, ttl)
}

func InvalidateCache(pattern string) {
	if Cache == nil {
		return
	}
	// Простая инвалидация по паттерну
	items := Cache.Items()
	for key := range items {
		// Если ключ начинается с паттерна - удаляем
		if len(key) >= len(pattern) && key[:len(pattern)] == pattern {
			Cache.Delete(key)
		}
	}
}

func InvalidateAllCache() {
	if Cache == nil {
		return
	}
	Cache.Flush()
}
