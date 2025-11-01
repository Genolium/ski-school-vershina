import { useState, useEffect } from "react";
import { getMedia, type Media } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/assets";
import { logError } from "@/lib/errorHandler";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Gallery = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "photo" | "video">("all");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
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
  }, [selectedCategory, selectedType]);

  const categories = Array.from(new Set(media.map((m) => m.category))).filter(Boolean);

  const filteredMedia = media.filter((m) => {
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    if (selectedType !== "all" && m.media_type !== selectedType) return false;
    return true;
  });

  if (loading) {
    return (
      <section id="gallery" className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg">Загрузка галереи...</div>
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
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-hero">
                      <div className="text-ski-white text-center">
                        <div className="text-4xl mb-2">▶</div>
                        <div className="text-sm">{item.title}</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="text-ski-white text-center px-4">
                      <h3 className="font-bold text-sm md:text-base">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs text-ski-white/80 mt-1">{item.description}</p>
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
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.media_type === "photo" ? (
              <img
                src={resolveAssetUrl(selectedMedia.file_path)}
                alt={selectedMedia.title}
                className="max-w-full max-h-[90vh] object-contain rounded"
              />
            ) : (
              <video
                src={resolveAssetUrl(selectedMedia.file_path)}
                controls
                className="max-w-full max-h-[90vh] rounded"
                autoPlay
              />
            )}
            <div className="mt-4 text-center text-ski-white">
              <h3 className="text-xl font-bold">{selectedMedia.title}</h3>
              {selectedMedia.description && (
                <p className="text-ski-white/80 mt-2">{selectedMedia.description}</p>
              )}
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSelectedMedia(null)}
            >
              Закрыть
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;

