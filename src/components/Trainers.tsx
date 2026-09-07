import { useEffect, useState } from "react";
import { getCoaches, type Coach } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollReveal from "./ScrollReveal";
import GeometricPatterns from "./GeometricPatterns";
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

const fallbackCoaches: Coach[] = [
  {
    id: 1,
    name: "Бокулев Владимир Леонидович",
    position: "Директор по спорту, тренер общего звена",
    description:
      "Грамотный и ответственный руководитель. Умеет вдохновлять спортсменов на лучший результат. Уверен, что все могут добиться успеха, если приложить капельку усилий!",
    photo: "/uploads/1763553240_photo_5251646492567604947_y.jpg",
    order: 1,
  },
  {
    id: 3,
    name: "Фалалеев Игорь Алексеевич",
    position: "Тренер группы PRO",
    description:
      "Опытный и позитивный, предан своему делу и профессиональному спорту. Знает, как вырастить чемпиона.",
    photo: "/uploads/1763470936_WhatsApp Image 2025-10-23 at 16.52.46.jpeg",
    order: 2,
  },
  {
    id: 2,
    name: "Юзова Юлия Игоревна",
    position: "Тренер группы STANDARD",
    description:
      "Юлию отличает искренняя доброта, развитые коммуникативные навыки, а также высокий уровень терпения и профессионализма.",
    photo: "/uploads/1763470802_754fbed2-f7ef-44a8-885a-48c5f31db8da.jpeg",
    order: 3,
  },
  {
    id: 4,
    name: "Ганина Василиса Игоревна",
    position: "Тренер группы STANDARD",
    description:
      "Добрая и внимательная, прекрасно знает, как укрепить здоровье и повысить спортивные навыки совсем юных учеников.",
    photo: "/uploads/1763471040_5717848c-9f6c-4c1e-a2a0-2652c062a62e.jpeg",
    order: 4,
  },
];

const Trainers = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Задержка для оптимизации критического пути - загружаем после LCP
    const timer = setTimeout(() => {
      getCoaches()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setCoaches(data);
          }
          setLoading(false);
        })
        .catch(() => {
          setCoaches([]);
          setLoading(false);
        });
    }, 300);
    return () => clearTimeout(timer);
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

  const displayCoaches = coaches.length > 0 ? coaches : fallbackCoaches;

  if (loading) {
    return (
      <section id="trainers" className="py-12 md:py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <Skeleton className="h-10 md:h-14 w-64 mx-auto mb-3 md:mb-4" />
          <Skeleton className="h-5 w-80 mx-auto mb-8 md:mb-12" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border-2 border-border rounded-xl p-5 md:p-6 h-full flex flex-col">
                <Skeleton className="aspect-square w-full mb-4 rounded-lg" />
                <Skeleton className="h-6 md:h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayCoaches.length === 0) {
    return null;
  }

  return (
    <section id="trainers" className="py-12 md:py-20 bg-background relative overflow-hidden">
      {/* Geometric Patterns */}
      <div className="hidden md:block">
        <GeometricPatterns type="triangle" color="primary" size="lg" opacity={15} className="top-12 right-8 rotate-45" />
        <GeometricPatterns type="chevrons-left" color="muted" size="md" opacity={20} className="bottom-12 left-8" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              Наши <span className="text-primary">тренеры</span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Опытные наставники и мастера спорта, воспитывающие чемпионов
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4 items-stretch">
              {displayCoaches.map((coach) => (
                <CarouselItem key={coach.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="bg-card border-2 border-border rounded-xl p-5 md:p-6 hover:border-primary hover:shadow-ski transition-all duration-300 h-full flex flex-col touch-manipulation">
                    {coach.photo && (
                      <div className="mb-4 rounded-lg overflow-hidden aspect-square mx-auto flex-shrink-0 w-full bg-muted">
                        <img
                          src={resolveAssetUrl(coach.photo)}
                          alt={coach.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // Если фото недоступно, скрываем или заменяем
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <h3 className="text-xl md:text-2xl font-bold mb-2 flex-shrink-0">{coach.name}</h3>
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
            <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12 h-10 w-10 bg-background border-2 shadow-lg hover:scale-110 transition-transform touch-manipulation" />
            <CarouselNext className="hidden md:flex -right-4 lg:-right-12 h-10 w-10 bg-background border-2 shadow-lg hover:scale-110 transition-transform touch-manipulation" />

            {/* Индикаторы точек */}
            {count > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "h-2.5 w-2.5 md:h-2 md:w-2 rounded-full transition-all duration-300 touch-manipulation",
                      current === index + 1
                        ? "bg-primary w-8 md:w-10"
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
    </section>
  );
};

export default Trainers;
