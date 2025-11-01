import { useEffect, useState } from "react";
import { getCoaches, type Coach } from "@/lib/api";
import ScrollReveal from "./ScrollReveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { resolveAssetUrl } from "@/lib/assets";

const Trainers = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    getCoaches()
      .then((data) => {
        setCoaches(data);
        setLoading(false);
      })
      .catch(() => {
        setCoaches([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Загрузка тренерского состава...</p>
      </div>
    );
  }

  if (coaches.length === 0) {
    return null; // Не показываем секцию, если нет тренеров
  }

  return (
    <div className="mb-8 md:mb-12">
      <ScrollReveal>
        <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
          Наш <span className="text-primary">тренерский состав</span>
        </h3>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4 items-stretch">
            {coaches.map((coach) => (
              <CarouselItem key={coach.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <div className="bg-card border-2 border-border rounded-xl p-5 md:p-6 hover:border-primary hover:shadow-ski transition-all duration-300 h-full flex flex-col">
                  {coach.photo && (
                    <div className="mb-4 rounded-lg overflow-hidden aspect-square mx-auto flex-shrink-0 w-full">
                      <img
                        src={resolveAssetUrl(coach.photo)}
                        alt={coach.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h4 className="text-xl md:text-2xl font-bold mb-2 flex-shrink-0">{coach.name}</h4>
                  {coach.position && (
                    <p className="text-primary font-semibold mb-3 text-sm md:text-base flex-shrink-0">
                      {coach.position}
                    </p>
                  )}
                  {coach.description && (
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed flex-1">
                      {coach.description}
                    </p>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12 h-10 w-10 bg-background border-2 shadow-lg hover:scale-110 transition-transform" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-12 h-10 w-10 bg-background border-2 shadow-lg hover:scale-110 transition-transform" />
          
          {/* Индикаторы точек */}
          {count > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    current === index + 1
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Carousel>
      </ScrollReveal>
    </div>
  );
};

export default Trainers;

