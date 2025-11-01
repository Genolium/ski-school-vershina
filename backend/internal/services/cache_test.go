package services

import (
	"testing"
	"time"
)

func TestCacheOperations(t *testing.T) {
	InitCache()

	t.Run("SetAndGet", func(t *testing.T) {
		key := "test-key"
		value := "test-value"
		SetCached(key, value, 5*time.Minute)

		result, ok := GetCached(key)
		if !ok {
			t.Error("Expected to find cached value")
		}
		if result != value {
			t.Errorf("Expected %q, got %q", value, result)
		}
	})

	t.Run("GetNonExistent", func(t *testing.T) {
		_, ok := GetCached("non-existent-key")
		if ok {
			t.Error("Expected key to not exist")
		}
	})

	t.Run("InvalidateCache", func(t *testing.T) {
		SetCached("schedule:1", "data1", 5*time.Minute)
		SetCached("schedule:2", "data2", 5*time.Minute)
		SetCached("location:1", "data3", 5*time.Minute)

		InvalidateCache("schedule")

		_, ok1 := GetCached("schedule:1")
		if ok1 {
			t.Error("Expected schedule:1 to be invalidated")
		}

		_, ok2 := GetCached("schedule:2")
		if ok2 {
			t.Error("Expected schedule:2 to be invalidated")
		}

		_, ok3 := GetCached("location:1")
		if !ok3 {
			t.Error("Expected location:1 to still exist")
		}
	})

	t.Run("InvalidateAllCache", func(t *testing.T) {
		SetCached("key1", "value1", 5*time.Minute)
		SetCached("key2", "value2", 5*time.Minute)

		InvalidateAllCache()

		_, ok1 := GetCached("key1")
		if ok1 {
			t.Error("Expected key1 to be invalidated")
		}

		_, ok2 := GetCached("key2")
		if ok2 {
			t.Error("Expected key2 to be invalidated")
		}
	})

	t.Run("CacheExpiration", func(t *testing.T) {
		key := "expiring-key"
		value := "expiring-value"
		SetCached(key, value, 100*time.Millisecond)

		time.Sleep(150 * time.Millisecond)

		_, ok := GetCached(key)
		if ok {
			t.Error("Expected cached value to expire")
		}
	})
}

