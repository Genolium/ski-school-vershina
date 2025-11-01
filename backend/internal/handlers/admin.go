package handlers

import (
	"net/http"
	"strconv"
	"ski-school-backend/internal/database"
	"ski-school-backend/internal/models"
	"github.com/gin-gonic/gin"
)

// CRUD для расписания
func AdminGetSchedule(c *gin.Context) {
	var groups []models.ScheduleGroup
	if err := database.DB.Order("`order` ASC").Find(&groups).Error; err != nil {
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
	
	LogAdminAction(c, "CREATE", "schedule", group.ID)
	c.JSON(http.StatusCreated, group)
}

func AdminUpdateSchedule(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var group models.ScheduleGroup
	if err := database.DB.First(&group, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Schedule group not found")
		return
	}
	if err := c.ShouldBindJSON(&group); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}
	
	if !ValidateStringLength(group.Group, 1, 200) || !ValidateStringLength(group.AgeRange, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}
	
	if err := database.DB.Save(&group).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update schedule group")
		return
	}
	
	LogAdminAction(c, "UPDATE", "schedule", group.ID)
	c.JSON(http.StatusOK, group)
}

func AdminDeleteSchedule(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.ScheduleGroup{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete schedule group")
		return
	}
	LogAdminAction(c, "DELETE", "schedule", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Schedule group deleted"})
}

// CRUD для локаций
func AdminGetLocations(c *gin.Context) {
	var locations []models.Location
	if err := database.DB.Order("`order` ASC").Find(&locations).Error; err != nil {
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
	
	LogAdminAction(c, "CREATE", "location", location.ID)
	c.JSON(http.StatusCreated, location)
}

func AdminUpdateLocation(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var location models.Location
	if err := database.DB.First(&location, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Location not found")
		return
	}
	if err := c.ShouldBindJSON(&location); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}
	
	if !ValidateStringLength(location.Title, 1, 200) || !ValidateStringLength(location.Address, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}
	
	if err := database.DB.Save(&location).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update location")
		return
	}
	
	LogAdminAction(c, "UPDATE", "location", location.ID)
	c.JSON(http.StatusOK, location)
}

func AdminDeleteLocation(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.Location{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete location")
		return
	}
	LogAdminAction(c, "DELETE", "location", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Location deleted"})
}

// CRUD для сборов
func AdminGetCamps(c *gin.Context) {
	var camps []models.Camp
	if err := database.DB.Order("created_at DESC").Find(&camps).Error; err != nil {
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
	
	LogAdminAction(c, "CREATE", "camp", camp.ID)
	c.JSON(http.StatusCreated, camp)
}

func AdminUpdateCamp(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var camp models.Camp
	if err := database.DB.First(&camp, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Camp not found")
		return
	}
	if err := c.ShouldBindJSON(&camp); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}
	
	if !ValidateStringLength(camp.Title, 1, 200) || !ValidateStringLength(camp.Location, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}
	
	if err := database.DB.Save(&camp).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update camp")
		return
	}
	
	LogAdminAction(c, "UPDATE", "camp", camp.ID)
	c.JSON(http.StatusOK, camp)
}

func AdminDeleteCamp(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.Camp{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete camp")
		return
	}
	LogAdminAction(c, "DELETE", "camp", uint(id))
	c.JSON(http.StatusOK, gin.H{"message": "Camp deleted"})
}

// CRUD для статистики
func AdminGetStats(c *gin.Context) {
	var stats []models.Statistic
	if err := database.DB.Order("`order` ASC").Find(&stats).Error; err != nil {
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
	
	LogAdminAction(c, "CREATE", "statistic", stat.ID)
	c.JSON(http.StatusCreated, stat)
}

func AdminUpdateStat(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var stat models.Statistic
	if err := database.DB.First(&stat, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "Statistic not found")
		return
	}
	if err := c.ShouldBindJSON(&stat); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}
	
	if !ValidateStringLength(stat.Label, 1, 200) || !ValidateStringLength(stat.Value, 1, 50) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}
	
	if err := database.DB.Save(&stat).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update statistic")
		return
	}
	
	LogAdminAction(c, "UPDATE", "statistic", stat.ID)
	c.JSON(http.StatusOK, stat)
}

func AdminDeleteStat(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.Statistic{}, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to delete statistic")
		return
	}
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
	
	LogAdminAction(c, "CREATE", "about", about.ID)
	c.JSON(http.StatusCreated, about)
}

func AdminUpdateAbout(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var about models.AboutContent
	if err := database.DB.First(&about, id).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusNotFound, "About content not found")
		return
	}
	if err := c.ShouldBindJSON(&about); err != nil {
		SafeErrorResponse(c, err, http.StatusBadRequest, "Invalid request data")
		return
	}
	
	if !ValidateStringLength(about.Title, 1, 500) {
		SafeErrorResponse(c, nil, http.StatusBadRequest, "Invalid data length")
		return
	}
	
	if err := database.DB.Save(&about).Error; err != nil {
		SafeErrorResponse(c, err, http.StatusInternalServerError, "Failed to update about content")
		return
	}
	
	LogAdminAction(c, "UPDATE", "about", about.ID)
	c.JSON(http.StatusOK, about)
}

