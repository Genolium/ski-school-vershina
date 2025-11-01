-- SQL скрипт для обновления координат локаций
-- Выполнить после перезапуска сервера для создания таблицы coaches

-- Обновление координат для локаций
-- Зал (ул. Брянцева 24)
UPDATE locations SET latitude = 60.040836, longitude = 30.406475 WHERE title LIKE '%Зал%' OR address LIKE '%Брянцева%';

-- Велосипеды/Ролики (п. Токсово «Северный склон»)
UPDATE locations SET latitude = 60.156344, longitude = 30.548292 WHERE title LIKE '%Токсово%' OR address LIKE '%Токсово%';

-- Горные лыжи (ГК «Снежный»)
UPDATE locations SET latitude = 60.521928, longitude = 29.764144 WHERE title LIKE '%Снежный%' OR address LIKE '%Снежный%';

