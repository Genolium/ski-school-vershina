import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

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

interface GalleryPhoto {
  id: number;
  src: string;
  alt: string;
}

const defaultPhotos: GalleryPhoto[] = [
  { id: 1, src: photo1, alt: "Горнолыжная школа Вершина фото 1" },
  { id: 2, src: photo2, alt: "Горнолыжная школа Вершина фото 2" },
  { id: 3, src: photo3, alt: "Горнолыжная школа Вершина фото 3" },
  { id: 4, src: photo4, alt: "Горнолыжная школа Вершина фото 4" },
  { id: 5, src: photo5, alt: "Горнолыжная школа Вершина фото 5" },
  { id: 6, src: photo6, alt: "Горнолыжная школа Вершина фото 6" },
  { id: 7, src: photo7, alt: "Горнолыжная школа Вершина фото 7" },
  { id: 8, src: photo8, alt: "Горнолыжная школа Вершина фото 8" },
  { id: 9, src: photo9, alt: "Горнолыжная школа Вершина фото 9" },
  { id: 10, src: photo10, alt: "Горнолыжная школа Вершина фото 10" },
  { id: 11, src: photo11, alt: "Горнолыжная школа Вершина фото 11" },
  { id: 12, src: photo12, alt: "Горнолыжная школа Вершина фото 12" },
];

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Клавиатурная навигация по лайтбоксу
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : defaultPhotos.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev !== null && prev < defaultPhotos.length - 1 ? prev + 1 : 0));
      }
    },
    [selectedIndex]
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
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : defaultPhotos.length - 1));
  }, []);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null && prev < defaultPhotos.length - 1 ? prev + 1 : 0));
  }, []);

  return (
    <section id="gallery" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Soft ambient background glows */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">
              <span className="text-primary">Фото</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
              Яркие моменты тренировок, соревнований и выездных сборов
            </p>
          </div>
        </ScrollReveal>

        {/* Сетка фотографий без подписей */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {defaultPhotos.map((photo, index) => (
            <ScrollReveal key={photo.id} delay={Math.min(index * 50, 400)}>
              <div
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted border border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-ski hover:scale-[1.02]"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 4 ? "high" : "low"}
                />

                {/* Легкий полупрозрачный hover-эффект с иконкой увеличения (без подписей) */}
                <div className="absolute inset-0 bg-ski-black/0 group-hover:bg-ski-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="p-2.5 rounded-full bg-ski-black/60 text-ski-white backdrop-blur-sm shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                    <ZoomIn className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Lightbox модальное окно */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографии"
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
            aria-label="Предыдущая фотография"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Изображение */}
          <div
            className="max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={defaultPhotos[selectedIndex].src}
              alt={defaultPhotos[selectedIndex].alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
              loading="eager"
            />

            {/* Индикатор номера фото */}
            <div className="mt-3 text-sm text-ski-white/70 font-medium tracking-wider">
              {selectedIndex + 1} / {defaultPhotos.length}
            </div>
          </div>

          {/* Стрелка Вперед */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-ski-black/60 hover:bg-primary text-ski-white transition-colors duration-200"
            aria-label="Следующая фотография"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
