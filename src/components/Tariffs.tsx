import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ArrowRight } from "lucide-react";
import GeometricPatterns from "./GeometricPatterns";
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
    <section id="tariffs" className="py-12 md:py-20 bg-background relative overflow-hidden">
      {/* Geometric Patterns */}
      <GeometricPatterns type="zigzag" color="primary" size="md" opacity={25} className="top-8 left-1/2 -translate-x-1/2 w-32 md:w-48" />
      <GeometricPatterns type="triangle" color="muted" size="md" opacity={20} className="top-4 left-4 md:top-8 md:left-8 rotate-45" />
      <GeometricPatterns type="triangle" color="muted" size="md" opacity={20} className="top-4 right-4 md:top-8 md:right-8 -rotate-45" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <span className="text-primary">Тарифы</span> на сезон 2025/2026
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Выберите подходящий тариф для вашего ребенка
            </p>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto items-stretch">
            {displayTariffs.map((tariff, index) => (
              <ScrollReveal key={tariff.id} delay={index * 100} className="h-full">
                <div className="bg-card border-2 border-border rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-primary hover:shadow-ski transition-all duration-300 flex flex-col h-full">
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3">
                      {tariff.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                      {tariff.description}
                    </p>
                    
                    <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
                      {parseFeatures(tariff.features).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 md:gap-3 text-sm md:text-base">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-border pt-4 md:pt-6 mt-auto">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6 text-center">
                      {tariff.price}
                    </div>
                    <Button 
                      variant="cta" 
                      className="w-full group text-sm md:text-base h-11 md:h-12 touch-manipulation" 
                      onClick={scrollToForm}
                    >
                      Записаться
                      <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Tariffs;

