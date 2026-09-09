import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, Play } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { getMedia } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/assets";
import { logError } from "@/lib/errorHandler";

// 12 красочных фото сезона 2026 года из assets
import photo1 from "@/assets/photo_2026-09-07_14-49-17.jpg";
import photo2 from "@/assets/photo_2026-09-07_14-49-18.jpg";
import photo3 from "@/assets/photo_2026-09-07_14-49-18 (2).jpg";
import photo4 from "@/assets/photo_2026-09-07_14-49-19.jpg";
import photo5 from "@/assets/photo_2026-09-07_14-49-19 (2).jpg";
import photo6 from "@/assets/photo_2026-09-07_14-49-20.jpg";
import photo7 from "@/assets/photo_2026-09-07_14-49-21.jpg";
import photo8 from "@/assets/photo_2026-09-07_14-49-21 (2).jpg";
import photo9 from "@/assets/photo_2026-09-07_14-49-22.jpg";
import photo10 from "@/assets/photo_2026-09-07_14-49-22 (2).jpg";
import photo11 from "@/assets/photo_2026-09-07_14-49-23.jpg";
import photo12 from "@/assets/photo_2026-09-07_14-49-24.jpg";

export interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  category: string;
  media_type: "photo" | "video";
  description?: string;
}

const CATEGORY_TABS = ["Все", "Тренировки", "Соревнования", "Сборы"] as const;

const defaultPhotos: GalleryItem[] = [
  { id: 1, src: photo1, alt: "Горнолыжная школа Вершина фото 1", title: "Тренировка на склоне", category: "Тренировки", media_type: "photo" },
  { id: 2, src: photo2, alt: "Горнолыжная школа Вершина фото 2", title: "Отработка слалома", category: "Тренировки", media_type: "photo" },
  { id: 3, src: photo3, alt: "Горнолыжная школа Вершина фото 3", title: "Разминка на снегу", category: "Тренировки", media_type: "photo" },
  { id: 4, src: photo4, alt: "Горнолыжная школа Вершина фото 4", title: "Индивидуальный инструктаж", category: "Тренировки", media_type: "photo" },
  { id: 5, src: photo5, alt: "Горнолыжная школа Вершина фото 5", title: "Старт заезда", category: "Соревнования", media_type: "photo" },
  { id: 6, src: photo6, alt: "Горнолыжная школа Вершина фото 6", title: "Прохождение ворот", category: "Соревнования", media_type: "photo" },
  { id: 7, src: photo7, alt: "Горнолыжная школа Вершина фото 7", title: "Финишная прямая", category: "Соревнования", media_type: "photo" },
  { id: 8, src: photo8, alt: "Горнолыжная школа Вершина фото 8", title: "Церемония награждения", category: "Соревнования", media_type: "photo" },
  { id: 9, src: photo9, alt: "Горнолыжная школа Вершина фото 9", title: "Команда на сборах", category: "Сборы", media_type: "photo" },
  { id: 10, src: photo10, alt: "Горнолыжная школа Вершина фото 10", title: "Горный пейзаж и база", category: "Сборы", media_type: "photo" },
  { id: 11, src: photo11, alt: "Горнолыжная школа Вершина фото 11", title: "Вечерний разбор техники", category: "Сборы", media_type: "photo" },
  { id: 12, src: photo12, alt: "Горнолыжная школа Вершина фото 12", title: "Закрытие сезона сборов", category: "Сборы", media_type: "photo" },
];

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    getMedia()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped: GalleryItem[] = data.map((item) => ({
            id: item.id,
            src: resolveAssetUrl(item.file_path),
            alt: item.title,
            title: item.title,
            category: item.category || "Тренировки",
            media_type: item.media_type,
            description: item.description,
          }));
          setItems(mapped);
        } else {
          setItems(defaultPhotos);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        logError(err, "Gallery getMedia");
        setItems(defaultPhotos);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayItems = items.length > 0 ? items : defaultPhotos;

  const filteredItems = displayItems.filter((item) => {
    if (selectedCategory === "Все") return true;
    return item.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Клавиатурная навигация по лайтбоксу
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
    },
    [selectedIndex, filteredItems.length]
  );

  useEffect(() => {
    if (selectedIndex !== null) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, handleKeyDown]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
  }, [filteredItems.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
  }, [filteredItems.length]);

  return (
    <section id="gallery" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Soft ambient background glows */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">
              <span className="text-primary">Фото</span> и видео
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
              Яркие моменты тренировок, соревнований и выездных сборов
            </p>
          </div>
        </ScrollReveal>

        {/* Категории (табы) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-12" role="tablist" aria-label="Категории медиа">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={selectedCategory === tab}
              onClick={() => {
                setSelectedCategory(tab);
                setSelectedIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Сетка медиа */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredItems.map((item, index) => (
            <ScrollReveal key={item.id} delay={Math.min(index * 50, 400)}>
              <div
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted border border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-ski hover:scale-[1.02]"
                onClick={() => setSelectedIndex(index)}
                data-testid={`gallery-item-${item.id}`}
                aria-label={item.title}
              >
                {item.media_type === "photo" ? (
                  <img
                    src={item.src}
                    alt={item.alt || item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                    fetchpriority={index < 4 ? "high" : "low"}
                  />
                ) : (
                  <div className="w-full h-full relative bg-ski-black/20 flex items-center justify-center overflow-hidden">
                    <video
                      src={item.src}
                      className="w-full h-full object-cover opacity-60"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        type="button"
                        aria-label="Воспроизвести видео"
                        data-testid="video-play-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(index);
                        }}
                        className="p-3 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:scale-110 transition-transform"
                      >
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Легкий полупрозрачный hover-эффект с иконкой увеличения */}
                <div className="absolute inset-0 bg-ski-black/0 group-hover:bg-ski-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="p-2.5 rounded-full bg-ski-black/60 text-ski-white backdrop-blur-sm shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                    {item.media_type === "photo" ? (
                      <ZoomIn className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lightbox модальное окно */}
      {selectedIndex !== null && filteredItems[selectedIndex] && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={filteredItems[selectedIndex].media_type === "photo" ? "Просмотр фотографии" : "Просмотр видео"}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 p-2.5 rounded-full bg-ski-black/60 hover:bg-primary text-ski-white transition-colors duration-200"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Стрелка Назад */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-ski-black/60 hover:bg-primary text-ski-white transition-colors duration-200"
            aria-label="Предыдущий элемент"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Контент */}
          <div
            className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredItems[selectedIndex].media_type === "photo" ? (
              <img
                src={filteredItems[selectedIndex].src}
                alt={filteredItems[selectedIndex].alt || filteredItems[selectedIndex].title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
                loading="eager"
              />
            ) : (
              <video
                src={filteredItems[selectedIndex].src}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              />
            )}

            {/* Подпись к медиа */}
            <div className="mt-3 text-center text-ski-white">
              <p className="font-medium text-sm sm:text-base">
                {filteredItems[selectedIndex].title}
              </p>
              {filteredItems[selectedIndex].description && (
                <p className="text-xs text-ski-white/70 mt-1 max-w-lg mx-auto">
                  {filteredItems[selectedIndex].description}
                </p>
              )}
              {/* Индикатор номера */}
              <div className="mt-1 text-xs text-ski-white/60 tracking-wider">
                {selectedIndex + 1} / {filteredItems.length}
              </div>
            </div>
          </div>

          {/* Стрелка Вперед */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-ski-black/60 hover:bg-primary text-ski-white transition-colors duration-200"
            aria-label="Следующий элемент"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
