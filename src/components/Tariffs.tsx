import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { getTariffs, type Tariff } from "@/lib/api";
import { logError } from "@/lib/errorHandler";

const Tariffs = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Тарифы загружаем сразу, так как они видны выше fold
    getTariffs()
      .then(data => {
        setTariffs(data);
        setLoading(false);
      })
      .catch((error) => {
        logError(error, 'Tariffs component');
        setTariffs([]);
        setLoading(false);
      });
  }, []);

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const parseFeatures = (features?: string): string[] => {
    if (!features) return [];
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Fallback данные если нет тарифов из API
  const fallbackTariffs: Tariff[] = [
    {
      id: 1,
      title: "Active",
      description: "Для семейного отдыха и поддержания формы",
      features: JSON.stringify(["1 тренировка в неделю", "Акцент на удовольствие от катания", "Повышение физической формы"]),
      price: "6000 р/мес.",
      is_active: true,
      order: 0
    },
    {
      id: 2,
      title: "Standard",
      description: "Для детей, которые хотят кататься уверенно и участвовать в соревнованиях",
      features: JSON.stringify(["3 тренировки в неделю", "Комплексная программа тренировок", "Участие в региональных соревнованиях"]),
      price: "10000 р/мес.",
      is_active: true,
      order: 1
    },
    {
      id: 3,
      title: "Pro",
      description: "Для высшего спортивного мастерства",
      features: JSON.stringify(["4-5 тренировок в неделю", "Индивидуальный план развития", "Участие во всероссийских соревнованиях", "Выполнение спортивных разрядов", "Медицинский мониторинг"]),
      price: "14000 р/мес.",
      is_active: true,
      order: 2
    },
    {
      id: 4,
      title: "Individual",
      description: "Для тех, кто ценит индивидуальность",
      features: JSON.stringify(["Тет-а-тет с тренером", "Коррекция ошибок", "Гибкий график", "Ускоренное обучение"]),
      price: "2500 р/час",
      is_active: true,
      order: 3
    }
  ];

  const displayTariffs = tariffs.length > 0 ? tariffs : fallbackTariffs;

  return (
    <section id="tariffs" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Soft ambient background glows */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">
              <span className="text-primary">Тарифы</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4 leading-relaxed">
              Выберите подходящий тариф для регулярных или индивидуальных занятий
            </p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border-2 border-border rounded-xl md:rounded-2xl p-5 md:p-6 flex flex-col h-full">
                <Skeleton className="h-8 w-24 mb-2 md:mb-3" />
                <Skeleton className="h-4 w-full mb-4 md:mb-6" />
                <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-start gap-2 md:gap-3">
                      <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 md:pt-6">
                  <Skeleton className="h-8 w-32 mx-auto mb-4 md:mb-6" />
                  <Skeleton className="h-11 md:h-12 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : displayTariffs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Тарифы временно недоступны
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {displayTariffs.map((tariff, index) => {
              const isPopular = tariff.title.toLowerCase().includes("standard") || index === 1;
              return (
                <ScrollReveal key={tariff.id} delay={index * 80} className="h-full">
                  <div
                    className={`bg-card rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-7 transition-all duration-300 flex flex-col h-full relative ${
                      isPopular
                        ? "border-2 border-primary shadow-ski md:-translate-y-1"
                        : "border-2 border-border hover:border-primary/60 hover:shadow-md"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                        Хит сезона
                      </div>
                    )}

                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                        {tariff.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 md:mb-6 min-h-[2.5rem] leading-relaxed">
                        {tariff.description}
                      </p>
                      
                      <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8 flex-1">
                        {parseFeatures(tariff.features).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground/90 leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-border pt-4 md:pt-5 mt-auto">
                      <div className="text-2xl sm:text-3xl font-bold text-primary mb-3 md:mb-4 text-center tracking-tight">
                        {tariff.price}
                      </div>
                      <Button 
                        variant={isPopular ? "hero" : "cta"} 
                        className="w-full group text-sm md:text-base h-11 md:h-12 touch-manipulation" 
                        onClick={scrollToForm}
                        aria-label={`Выбрать тариф ${tariff.title}`}
                      >
                        Выбрать тариф
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Tariffs;

