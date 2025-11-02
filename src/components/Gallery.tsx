import { useState, useEffect, useCallback } from "react";
import { getMedia, type Media } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/assets";
import { logError } from "@/lib/errorHandler";
import { Skeleton } from "@/components/ui/skeleton";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const Gallery = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "photo" | "video">("all");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    // Задержка для оптимизации критического пути - загружаем после LCP
    const timer = setTimeout(() => {
      const params: { category?: string; type?: "photo" | "video" } = {};
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (selectedType !== "all") {
        params.type = selectedType;
      }

      getMedia(Object.keys(params).length > 0 ? params : undefined)
        .then(setMedia)
        .catch((error) => {
          logError(error, "Gallery component");
          setMedia([]);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedType]);

  const categories = Array.from(new Set(media.map((m) => m.category))).filter(Boolean);

  const filteredMedia = media.filter((m) => {
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    if (selectedType !== "all" && m.media_type !== selectedType) return false;
    return true;
  });

  // Закрытие модального окна по ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMedia) {
        setSelectedMedia(null);
      }
    };

    if (selectedMedia) {
      document.addEventListener("keydown", handleEscape);
      // Предотвращаем скролл body при открытой модалке
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedMedia]);

  const handleCloseModal = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  if (loading) {
    return (
      <section id="gallery" className="py-12 md:py-20 bg-background relative overflow-hidden">
        <GeometricPatterns type="x-grid" color="primary" size="md" opacity={10} className="top-8 left-4 md:top-12 md:left-8" />
        <GeometricPatterns type="triangle" color="muted" size="sm" opacity={15} className="bottom-8 right-4 md:bottom-12 md:right-8 rotate-45" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <Skeleton className="h-10 md:h-14 w-64 mx-auto mb-3 md:mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (media.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="py-12 md:py-20 bg-background relative overflow-hidden">
      <GeometricPatterns type="x-grid" color="primary" size="md" opacity={10} className="top-8 left-4 md:top-12 md:left-8" />
      <GeometricPatterns type="triangle" color="muted" size="sm" opacity={15} className="bottom-8 right-4 md:bottom-12 md:right-8 rotate-45" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <span className="text-primary">Фото</span> и видео
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Моменты с тренировок и соревнований
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {categories.length > 0 && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={selectedType}
              onValueChange={(value: "all" | "photo" | "video") => setSelectedType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Все типы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="photo">Только фото</SelectItem>
                <SelectItem value="video">Только видео</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ScrollReveal>

        {filteredMedia.length === 0 ? (
          <ScrollReveal delay={200}>
            <div className="text-center py-12 text-muted-foreground">
              Нет медиа для отображения
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredMedia.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 50}>
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-muted"
                  onClick={() => setSelectedMedia(item)}
                >
                  {item.media_type === "photo" ? (
                    <img
                      src={resolveAssetUrl(item.file_path)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      fetchPriority={index < 8 ? "high" : "low"}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-hero relative">
                      {/* Превью видео, если есть thumbnail */}
                      {item.file_path && (
                        <video
                          src={resolveAssetUrl(item.file_path)}
                          className="w-full h-full object-cover opacity-50"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-ski-white text-center z-10">
                          <div className="text-3xl md:text-4xl mb-2 drop-shadow-lg">▶</div>
                          <div className="text-xs md:text-sm font-medium px-2">{item.title}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Overlay с информацией - видим на hover и на touch devices */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 active:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100">
                    <div className="text-ski-white text-center px-4">
                      <h3 className="font-bold text-sm md:text-base">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs text-ski-white/80 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="max-w-6xl w-full max-h-[95vh] md:max-h-[90vh] flex flex-col items-center" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-ski-white transition-colors touch-manipulation"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Контент медиа */}
            <div className="flex-1 flex items-center justify-center w-full mb-2 sm:mb-4">
              {selectedMedia.media_type === "photo" ? (
                <img
                  src={resolveAssetUrl(selectedMedia.file_path)}
                  alt={selectedMedia.title}
                  className="max-w-full max-h-[85vh] sm:max-h-[80vh] md:max-h-[75vh] object-contain rounded-lg shadow-2xl"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              ) : (
                <video
                  src={resolveAssetUrl(selectedMedia.file_path)}
                  controls
                  className="max-w-full max-h-[85vh] sm:max-h-[80vh] md:max-h-[75vh] rounded-lg shadow-2xl w-full"
                  autoPlay
                  playsInline
                />
              )}
            </div>

            {/* Информация о медиа */}
            <div className="text-center text-ski-white px-4 pb-4 sm:pb-6">
              <h3 id="modal-title" className="text-lg sm:text-xl md:text-2xl font-bold mb-2">
                {selectedMedia.title}
              </h3>
              {selectedMedia.description && (
                <p className="text-sm sm:text-base text-ski-white/80 max-w-2xl mx-auto">
                  {selectedMedia.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;

