package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"ski-school-backend/internal/services"
	"strconv"
)

// CRUD для тарифов
func AdminGetTariffs(c *gin.Context) {
	var tariffs []models.Tariff
	if err := database.DB.Order(database.GetOrderClause() + " ASC").Find(&tariffs).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch tariffs")
		return
	}
	c.JSON(http.StatusOK, tariffs)
}

func AdminCreateTariff(c *gin.Context) {
	var tariff models.Tariff
	if err := c.ShouldBindJSON(&tariff); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Проверка длины строк
	if !ValidateStringLength(tariff.Title, 1, 200) || !ValidateStringLength(tariff.Description, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	if err := database.DB.Create(&tariff).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create tariff")
		return
	}

	services.InvalidateCache("tariffs")
	LogAdminAction(c, "CREATE", "tariff", tariff.ID)
	c.JSON(http.StatusCreated, tariff)
}

func AdminUpdateTariff(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var tariff models.Tariff
	if err := database.DB.First(&tariff, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Tariff not found")
		return
	}

	// Используем отдельную структуру для обновления
	var updateData struct {
		Title       *string `json:"title"`
		Description *string `json:"description"`
		Features    *string `json:"features"`
		Price       *string `json:"price"`
		IsActive    *bool   `json:"is_active"`
		Order       *int    `json:"order"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Обновление только переданных полей
	if updateData.Title != nil {
		if !ValidateStringLength(*updateData.Title, 1, 200) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid title length")
			return
		}
		tariff.Title = *updateData.Title
	}
	if updateData.Description != nil {
		if !ValidateStringLength(*updateData.Description, 1, 500) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid description length")
			return
		}
		tariff.Description = *updateData.Description
	}
	if updateData.Features != nil {
		tariff.Features = *updateData.Features
	}
	if updateData.Price != nil {
		tariff.Price = *updateData.Price
	}
	if updateData.IsActive != nil {
		tariff.IsActive = *updateData.IsActive
	}
	if updateData.Order != nil {
		tariff.Order = *updateData.Order
	}

	// Валидация обязательных полей перед сохранением
	if !ValidateStringLength(tariff.Title, 1, 200) || !ValidateStringLength(tariff.Description, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Title and description are required")
		return
	}

	if err := database.DB.Save(&tariff).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update tariff")
		return
	}

	services.InvalidateCache("tariffs")
	LogAdminAction(c, "UPDATE", "tariff", tariff.ID)
	c.JSON(http.StatusOK, tariff)
}

func AdminDeleteTariff(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.Tariff{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete tariff")
		return
	}
	services.InvalidateCache("tariffs")
	LogAdminAction(c, "DELETE", "tariff", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Tariff deleted"})
}

// CRUD для расписания
func AdminGetSchedule(c *gin.Context) {
	var groups []models.ScheduleGroup
	if err := database.DB.Order(database.GetOrderClause() + " ASC").Find(&groups).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch schedule")
		return
	}
	c.JSON(http.StatusOK, groups)
}

func AdminCreateSchedule(c *gin.Context) {
	var group models.ScheduleGroup
	if err := c.ShouldBindJSON(&group); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Проверка длины строк
	if !ValidateStringLength(group.Group, 1, 200) || !ValidateStringLength(group.AgeRange, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	if err := database.DB.Create(&group).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create schedule group")
		return
	}

	services.InvalidateCache("schedule")
	LogAdminAction(c, "CREATE", "schedule", group.ID)
	c.JSON(http.StatusCreated, group)
}

func AdminUpdateSchedule(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var group models.ScheduleGroup
	if err := database.DB.First(&group, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Schedule group not found")
		return
	}

	// Используем отдельную структуру для обновления
	var updateData struct {
		Group     *string `json:"group"`
		AgeRange  *string `json:"age_range"`
		Days      *string `json:"days"`
		Time      *string `json:"time"`
		Location  *string `json:"location"`
		Spots     *int    `json:"spots"`
		Price     *string `json:"price"`
		IsActive  *bool   `json:"is_active"`
		Order     *int    `json:"order"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Обновление только переданных полей
	if updateData.Group != nil {
		if !ValidateStringLength(*updateData.Group, 1, 200) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid group length")
			return
		}
		group.Group = *updateData.Group
	}
	if updateData.AgeRange != nil {
		if !ValidateStringLength(*updateData.AgeRange, 1, 50) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid age_range length")
			return
		}
		group.AgeRange = *updateData.AgeRange
	}
	if updateData.Days != nil {
		group.Days = *updateData.Days
	}
	if updateData.Time != nil {
		group.Time = *updateData.Time
	}
	if updateData.Location != nil {
		group.Location = *updateData.Location
	}
	if updateData.Spots != nil {
		group.Spots = *updateData.Spots
	}
	if updateData.Price != nil {
		group.Price = *updateData.Price
	}
	if updateData.IsActive != nil {
		group.IsActive = *updateData.IsActive
	}
	if updateData.Order != nil {
		group.Order = *updateData.Order
	}

	// Валидация обязательных полей перед сохранением
	if !ValidateStringLength(group.Group, 1, 200) || !ValidateStringLength(group.AgeRange, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Group and age_range are required")
		return
	}

	if err := database.DB.Save(&group).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update schedule group")
		return
	}

	services.InvalidateCache("schedule")
	LogAdminAction(c, "UPDATE", "schedule", group.ID)
	c.JSON(http.StatusOK, group)
}

func AdminDeleteSchedule(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.ScheduleGroup{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete schedule group")
		return
	}
	services.InvalidateCache("schedule")
	LogAdminAction(c, "DELETE", "schedule", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Schedule group deleted"})
}

// CRUD для локаций
func AdminGetLocations(c *gin.Context) {
	var locations []models.Location
	if err := database.DB.Order(database.GetOrderClause() + " ASC").Find(&locations).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch locations")
		return
	}
	c.JSON(http.StatusOK, locations)
}

func AdminCreateLocation(c *gin.Context) {
	var location models.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	if !ValidateStringLength(location.Title, 1, 200) || !ValidateStringLength(location.Address, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	if err := database.DB.Create(&location).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create location")
		return
	}

	services.InvalidateCache("locations")
	LogAdminAction(c, "CREATE", "location", location.ID)
	c.JSON(http.StatusCreated, location)
}

func AdminUpdateLocation(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var location models.Location
	if err := database.DB.First(&location, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Location not found")
		return
	}

	// Используем отдельную структуру для обновления
	var updateData struct {
		Title       *string  `json:"title"`
		Address     *string  `json:"address"`
		Description *string  `json:"description"`
		Features    *string  `json:"features"`
		IconType    *string  `json:"icon_type"`
		Latitude    *float64 `json:"latitude"`
		Longitude   *float64 `json:"longitude"`
		RouteURL    *string  `json:"route_url"`
		Order       *int     `json:"order"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Обновление только переданных полей
	if updateData.Title != nil {
		if !ValidateStringLength(*updateData.Title, 1, 200) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid title length")
			return
		}
		location.Title = *updateData.Title
	}
	if updateData.Address != nil {
		if !ValidateStringLength(*updateData.Address, 1, 500) {
			SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid address length")
			return
		}
		location.Address = *updateData.Address
	}
	if updateData.Description != nil {
		location.Description = *updateData.Description
	}
	if updateData.Features != nil {
		location.Features = *updateData.Features
	}
	if updateData.IconType != nil {
		location.IconType = *updateData.IconType
	}
	if updateData.Latitude != nil {
		location.Latitude = *updateData.Latitude
	}
	if updateData.Longitude != nil {
		location.Longitude = *updateData.Longitude
	}
	if updateData.RouteURL != nil {
		location.RouteURL = *updateData.RouteURL
	}
	if updateData.Order != nil {
		location.Order = *updateData.Order
	}

	// Валидация обязательных полей перед сохранением
	if !ValidateStringLength(location.Title, 1, 200) || !ValidateStringLength(location.Address, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Title and address are required")
		return
	}

	if err := database.DB.Save(&location).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update location")
		return
	}

	services.InvalidateCache("locations")
	LogAdminAction(c, "UPDATE", "location", location.ID)
	c.JSON(http.StatusOK, location)
}

func AdminDeleteLocation(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.Location{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete location")
		return
	}
	services.InvalidateCache("locations")
	LogAdminAction(c, "DELETE", "location", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Location deleted"})
}

// CRUD для сборов
func AdminGetCamps(c *gin.Context) {
	var camps []models.Camp
	if err := database.DB.Order(database.GetOrderClause() + " ASC, created_at DESC").Find(&camps).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch camps")
		return
	}
	c.JSON(http.StatusOK, camps)
}

func AdminCreateCamp(c *gin.Context) {
	var camp models.Camp
	if err := c.ShouldBindJSON(&camp); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	if !ValidateStringLength(camp.Title, 1, 200) || !ValidateStringLength(camp.Location, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	if err := database.DB.Create(&camp).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create camp")
		return
	}

	services.InvalidateCache("camps")
	LogAdminAction(c, "CREATE", "camp", camp.ID)
	c.JSON(http.StatusCreated, camp)
}

func AdminUpdateCamp(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var camp models.Camp
	if err := database.DB.First(&camp, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Camp not found")
		return
	}

	// Используем отдельную структуру для обновления, чтобы не перезаписать ID из URL
	var updateData struct {
		Title         string `json:"title"`
		Location      string `json:"location"`
		LocationDesc  string `json:"location_desc"`
		Dates         string `json:"dates"`
		Duration      string `json:"duration"`
		GroupSize     string `json:"group_size"`
		GroupDesc     string `json:"group_desc"`
		TrainingDesc  string `json:"training_desc"`
		IncludedItems string `json:"included_items"`
		Stats         string `json:"stats"`
		IsActive      bool   `json:"is_active"`
		Order         int    `json:"order"`
		// Явно игнорируем ID из JSON, если он придет
		ID            uint   `json:"id" binding:"-"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Валидация обязательных полей
	if !ValidateStringLength(updateData.Title, 1, 200) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid title length")
		return
	}
	if !ValidateStringLength(updateData.Location, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid location length")
		return
	}

	// Обновление полей (ID остается из URL)
	camp.Title = updateData.Title
	camp.Location = updateData.Location
	camp.LocationDesc = updateData.LocationDesc
	camp.Dates = updateData.Dates
	camp.Duration = updateData.Duration
	camp.GroupSize = updateData.GroupSize
	camp.GroupDesc = updateData.GroupDesc
	camp.TrainingDesc = updateData.TrainingDesc
	camp.IncludedItems = updateData.IncludedItems
	camp.Stats = updateData.Stats
	camp.IsActive = updateData.IsActive
	camp.Order = updateData.Order

	if err := database.DB.Save(&camp).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update camp")
		return
	}

	services.InvalidateCache("camps")
	LogAdminAction(c, "UPDATE", "camp", camp.ID)
	c.JSON(http.StatusOK, camp)
}

func AdminDeleteCamp(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.Camp{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete camp")
		return
	}
	services.InvalidateCache("camps")
	LogAdminAction(c, "DELETE", "camp", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Camp deleted"})
}

// CRUD для статистики
func AdminGetStats(c *gin.Context) {
	var stats []models.Statistic
	if err := database.DB.Order(database.GetOrderClause() + " ASC").Find(&stats).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to fetch statistics")
		return
	}
	c.JSON(http.StatusOK, stats)
}

func AdminCreateStat(c *gin.Context) {
	var stat models.Statistic
	if err := c.ShouldBindJSON(&stat); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	if !ValidateStringLength(stat.Label, 1, 200) || !ValidateStringLength(stat.Value, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	if err := database.DB.Create(&stat).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create statistic")
		return
	}

	services.InvalidateCache("stats")
	LogAdminAction(c, "CREATE", "statistic", stat.ID)
	c.JSON(http.StatusCreated, stat)
}

func AdminUpdateStat(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var stat models.Statistic
	if err := database.DB.First(&stat, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Statistic not found")
		return
	}

	// Используем отдельную структуру для обновления, чтобы не перезаписать ID из URL
	var updateData struct {
		Label    string `json:"label"`
		Value    string `json:"value"`
		Suffix   string `json:"suffix"`
		IconType string `json:"icon_type"`
		Order    int    `json:"order"`
		// Явно игнорируем ID из JSON, если он придет
		ID       uint   `json:"id" binding:"-"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Валидация обязательных полей
	if !ValidateStringLength(updateData.Label, 1, 200) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid label length")
		return
	}
	if !ValidateStringLength(updateData.Value, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid value length")
		return
	}

	// Обновление полей (ID остается из URL)
	stat.Label = updateData.Label
	stat.Value = updateData.Value
	stat.Suffix = updateData.Suffix
	stat.IconType = updateData.IconType
	stat.Order = updateData.Order

	if err := database.DB.Save(&stat).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update statistic")
		return
	}

	services.InvalidateCache("stats")
	LogAdminAction(c, "UPDATE", "statistic", stat.ID)
	c.JSON(http.StatusOK, stat)
}

func AdminDeleteStat(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	if err := database.DB.Delete(&models.Statistic{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete statistic")
		return
	}
	services.InvalidateCache("stats")
	LogAdminAction(c, "DELETE", "statistic", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Statistic deleted"})
}

// CRUD для раздела "О нас"
func AdminGetAbout(c *gin.Context) {
	var about models.AboutContent
	if err := database.DB.First(&about).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "About content not found")
		return
	}
	c.JSON(http.StatusOK, about)
}

func AdminCreateAbout(c *gin.Context) {
	var about models.AboutContent
	if err := c.ShouldBindJSON(&about); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	if !ValidateStringLength(about.Title, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}

	if err := database.DB.Create(&about).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to create about content")
		return
	}

	services.InvalidateCache("about")
	LogAdminAction(c, "CREATE", "about", about.ID)
	c.JSON(http.StatusCreated, about)
}

func AdminUpdateAbout(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid ID")
		return
	}

	var about models.AboutContent
	if err := database.DB.First(&about, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "About content not found")
		return
	}

	// Используем отдельную структуру для обновления, чтобы не перезаписать ID из URL
	var updateData struct {
		Title      string `json:"title"`
		Description string `json:"description"`
		Paragraphs string `json:"paragraphs"`
		// Явно игнорируем ID из JSON, если он придет
		ID         uint   `json:"id" binding:"-"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}

	// Валидация обязательных полей
	if !ValidateStringLength(updateData.Title, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid title length")
		return
	}

	// Обновление полей (ID остается из URL)
	about.Title = updateData.Title
	about.Description = updateData.Description
	about.Paragraphs = updateData.Paragraphs

	if err := database.DB.Save(&about).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update about content")
		return
	}

	services.InvalidateCache("about")
	LogAdminAction(c, "UPDATE", "about", about.ID)
	c.JSON(http.StatusOK, about)
}
