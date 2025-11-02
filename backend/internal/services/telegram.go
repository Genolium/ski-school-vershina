package services

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"ski-school-backend/internal/config"
	"ski-school-backend/internal/models"
)

// normalizePhoneNumber убирает все символы кроме цифр и + для кликабельности в Telegram
func normalizePhoneNumber(phone string) string {
	// Убираем все символы кроме цифр и +
	re := regexp.MustCompile(`[^\d+]`)
	normalized := re.ReplaceAllString(phone, "")
	return normalized
}

// getTariffOrAge возвращает тариф, если он есть, иначе возраст (для обратной совместимости)
func getTariffOrAge(application *models.Application) string {
	if application.Tariff != "" {
		return application.Tariff
	}
	if application.Age != "" {
		return application.Age
	}
	return "-"
}

// SendTelegramNotification отправляет уведомление в Telegram чат
func SendTelegramNotification(cfg *config.Config, application *models.Application) {
	if cfg.TelegramToken == "" || cfg.TelegramChatID == "" {
		log.Printf("Telegram not configured: token or chat_id missing")
		return
	}

	// Нормализуем номер телефона для кликабельности
	normalizedPhone := normalizePhoneNumber(application.Phone)

	message := fmt.Sprintf(
		"🎿 *Новая заявка*\n\n"+
			"Имя: %s\n"+
			"Телефон: `%s`\n"+
			"Тариф: %s\n"+
			"Статус: Новая\n\n"+
			"ID заявки: %d",
		application.Name,
		normalizedPhone,
		getTariffOrAge(application),
		application.ID,
	)

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", cfg.TelegramToken)

	params := url.Values{}
	params.Set("chat_id", cfg.TelegramChatID)
	params.Set("text", message)
	params.Set("parse_mode", "Markdown")

	resp, err := http.PostForm(apiURL, params)
	if err != nil {
		log.Printf("Failed to send Telegram notification: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Telegram API returned error status: %d", resp.StatusCode)
	}
}

// SendTelegramStatusUpdate отправляет уведомление об изменении статуса заявки
func SendTelegramStatusUpdate(cfg *config.Config, application *models.Application, oldStatus string) {
	if cfg.TelegramToken == "" || cfg.TelegramChatID == "" {
		return
	}

	statusLabels := map[string]string{
		"pending":   "Новая",
		"contacted": "Связались",
		"completed": "Завершена",
		"cancelled": "Отменена",
	}

	newStatusLabel := statusLabels[string(application.Status)]
	oldStatusLabel := statusLabels[oldStatus]

	// Нормализуем номер телефона для кликабельности
	normalizedPhone := normalizePhoneNumber(application.Phone)

	message := fmt.Sprintf(
		"📝 *Обновление заявки*\n\n"+
			"ID: %d\n"+
			"Имя: %s\n"+
			"Телефон: `%s`\n"+
			"Статус: %s → %s",
		application.ID,
		application.Name,
		normalizedPhone,
		oldStatusLabel,
		newStatusLabel,
	)

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", cfg.TelegramToken)

	params := url.Values{}
	params.Set("chat_id", cfg.TelegramChatID)
	params.Set("text", message)
	params.Set("parse_mode", "Markdown")

	resp, err := http.PostForm(apiURL, params)
	if err != nil {
		log.Printf("Failed to send Telegram status update: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Telegram API returned error status: %d", resp.StatusCode)
	}
}
