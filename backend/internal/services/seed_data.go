package services

import (
	"encoding/json"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
)

func SeedInitialData() error {
	// Заполнение групп расписания (проверяем отдельно для каждого типа данных)
	var existingScheduleCount int64
	database.DB.Model(&models.ScheduleGroup{}).Count(&existingScheduleCount)
	if existingScheduleCount == 0 {
		scheduleGroups := []models.ScheduleGroup{
			{Group: "Начальная подготовка", AgeRange: "4-6 лет", Days: "Вт, Чт", Time: "16:00 - 17:00", Location: "Зал (ул. Брянцева 24)", Spots: 5, IsActive: true, Order: 1},
			{Group: "Базовый уровень", AgeRange: "7-9 лет", Days: "Пн, Ср, Пт", Time: "17:00 - 18:30", Location: "ГК «Снежный»", Spots: 3, IsActive: true, Order: 2},
			{Group: "Продвинутый уровень", AgeRange: "10-14 лет", Days: "Вт, Чт, Сб", Time: "18:00 - 20:00", Location: "ГК «Снежный»", Spots: 2, IsActive: true, Order: 3},
			{Group: "Спортивная группа", AgeRange: "12+ лет", Days: "Пн-Сб", Time: "19:00 - 21:00", Location: "ГК «Снежный»", Spots: 4, IsActive: true, Order: 4},
		}

		for _, group := range scheduleGroups {
			// Проверка существования по названию группы И возрастному диапазону для надежности
			var count int64
			database.DB.Model(&models.ScheduleGroup{}).
				Where("group = ? AND age_range = ?", group.Group, group.AgeRange).
				Count(&count)
			if count == 0 {
				if err := database.DB.Create(&group).Error; err != nil {
					return err
				}
			}
		}
	}

	// Заполнение локаций (только если таблица пуста)
	var existingLocationsCount int64
	database.DB.Model(&models.Location{}).Count(&existingLocationsCount)
	if existingLocationsCount == 0 {
		locationFeatures1, _ := json.Marshal([]string{"Искусственный склон", "Современное оборудование", "Раздевалки"})
		locationFeatures2, _ := json.Marshal([]string{"Безопасные трассы", "Профессиональная экипировка", "Групповые занятия"})
		locationFeatures3, _ := json.Marshal([]string{"5 трасс разного уровня", "Подъемники", "Прокат оборудования"})

		locations := []models.Location{
			{Title: "Зал", Address: "ул. Брянцева 24", Description: "Специализированный зал для ОФП, начальной подготовки и отработки техники", Features: string(locationFeatures1), IconType: "MapPin", Latitude: 60.040836, Longitude: 30.406475, Order: 1},
			{Title: "Велосипеды/Ролики", Address: "п. Токсово «Северный склон»", Description: "Летние тренировки на велосипедах и роликах для развития баланса и выносливости", Features: string(locationFeatures2), IconType: "Bike", Latitude: 60.156344, Longitude: 30.548292, Order: 2},
			{Title: "Горные лыжи", Address: "ГК «Снежный»", Description: "Основные тренировки на горнолыжных склонах с ратраченными трассами", Features: string(locationFeatures3), IconType: "Mountain", Latitude: 60.521928, Longitude: 29.764144, Order: 3},
		}

		for _, location := range locations {
			if err := database.DB.Create(&location).Error; err != nil {
				return err
			}
		}
	}

	// Заполнение статистики (только если таблица пуста)
	var existingStatsCount int64
	database.DB.Model(&models.Statistic{}).Count(&existingStatsCount)
	if existingStatsCount == 0 {
		stats := []models.Statistic{
			{Label: "лет работы", Value: "25", Suffix: "+", IconType: "Trophy", Order: 1},
			{Label: "воспитанников", Value: "150", Suffix: "+", IconType: "Users", Order: 2},
			{Label: "побед в сезоне", Value: "50", Suffix: "+", IconType: "Award", Order: 3},
			{Label: "довольных родителей", Value: "100", Suffix: "%", IconType: "Target", Order: 4},
		}

		for _, stat := range stats {
			if err := database.DB.Create(&stat).Error; err != nil {
				return err
			}
		}
	}

	// Заполнение сборов
	includedItems, _ := json.Marshal([]string{
		"Проживание в комфортабельной гостинице",
		"Трехразовое питание",
		"Ски-пассы на все дни катания",
		"Работа тренерского состава",
		"Трансфер на склон",
		"Развлекательная программа",
	})

	campStats, _ := json.Marshal(map[string]string{
		"camps_count":    "5",
		"participants":   "80+",
		"recommendation": "98%",
	})

	var campCount int64
	database.DB.Model(&models.Camp{}).Count(&campCount)
	if campCount == 0 {
		camp := models.Camp{
			Title:         "Сборы 2025/2026",
			Location:      "Кировск, Хибины",
			LocationDesc:  "Самый снежный курорт России",
			Dates:         "Январь - Март 2026",
			Duration:      "Продолжительность: 7-10 дней",
			GroupSize:     "Группы 10-15 человек",
			GroupDesc:     "С опытными тренерами",
			TrainingDesc:  "До 4 часов на склоне ежедневно",
			IncludedItems: string(includedItems),
			Stats:         string(campStats),
			IsActive:      true,
		}
		if err := database.DB.Create(&camp).Error; err != nil {
			return err
		}
	}

	// Заполнение раздела "О нас"
	paragraphs, _ := json.Marshal([]string{
		"С 2001 года мы обучаем детей горнолыжному спорту по современной австрийской методике. Наша программа включает общую физическую подготовку, техническую подготовку на склоне и участие в соревнованиях.",
		"Наши тренеры — мастера спорта и опытные педагоги, которые находят подход к каждому ребенку и помогают раскрыть его потенциал в спорте.",
	})

	var aboutCount int64
	database.DB.Model(&models.AboutContent{}).Count(&aboutCount)
	if aboutCount == 0 {
		about := models.AboutContent{
			Title:       "Школа горнолыжного спорта «Вершина»",
			Description: "Мы создаем чемпионов и помогаем детям полюбить горнолыжный спорт",
			Paragraphs:  string(paragraphs),
		}
		if err := database.DB.Create(&about).Error; err != nil {
			return err
		}
	}

	// Заполнение тарифов (только если таблица пуста)
	var existingTariffsCount int64
	database.DB.Model(&models.Tariff{}).Count(&existingTariffsCount)
	if existingTariffsCount == 0 {
		tariffFeatures1, _ := json.Marshal([]string{"1 тренировка в неделю", "Акцент на удовольствие"})
		tariffFeatures2, _ := json.Marshal([]string{"2 тренировки в неделю", "Базовые навыки"})
		tariffFeatures3, _ := json.Marshal([]string{"3 тренировки в неделю", "Интенсивная подготовка"})
		tariffFeatures4, _ := json.Marshal([]string{"4+ тренировки в неделю", "Профессиональный уровень"})

		defaultTariffs := []models.Tariff{
			{
				Title:       "Active",
				Description: "Для тех, кто хочет получать удовольствие от катания",
				Features:    string(tariffFeatures1),
				Price:       "6000 р/мес.",
				IsActive:    true,
				Order:       1,
			},
			{
				Title:       "Sport",
				Description: "Для тех, кто хочет развивать навыки",
				Features:    string(tariffFeatures2),
				Price:       "10000 р/мес.",
				IsActive:    true,
				Order:       2,
			},
			{
				Title:       "Pro",
				Description: "Для серьезных спортсменов",
				Features:    string(tariffFeatures3),
				Price:       "14000 р/мес.",
				IsActive:    true,
				Order:       3,
			},
			{
				Title:       "Champion",
				Description: "Максимальная подготовка для соревнований",
				Features:    string(tariffFeatures4),
				Price:       "18000 р/мес.",
				IsActive:    true,
				Order:       4,
			},
		}

		for _, tariff := range defaultTariffs {
			if err := database.DB.Create(&tariff).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
