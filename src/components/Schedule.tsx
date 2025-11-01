import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, ArrowRight } from "lucide-react";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import { getSchedule, type ScheduleGroup } from "@/lib/api";
import { logError } from "@/lib/errorHandler";

const Schedule = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSchedule()
      .then(data => {
        setScheduleData(data);
        setLoading(false);
      })
      .catch((error) => {
        logError(error, 'Schedule component');
        setScheduleData([]);
        setLoading(false);
      });
  }, []);

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Структурированные данные для расписания
  const scheduleStructuredData = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "Школа горнолыжного спорта Вершина",
    "sport": "Горнолыжный спорт",
    "offers": scheduleData.map((item) => ({
      "@type": "Offer",
      "name": item.group,
      "description": `Группа ${item.group} для детей ${item.age_range}`,
      "availabilityStarts": item.time.split(" - ")[0],
      "availabilityEnds": item.time.split(" - ")[1],
      "validFrom": "2025-01-01",
      "validThrough": "2025-12-31"
    }))
  };

  return (
    <section id="schedule" className="py-12 md:py-20 bg-background relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scheduleStructuredData) }}
      />
      {/* Geometric Patterns */}
      <GeometricPatterns type="zigzag" color="primary" size="md" opacity={25} className="top-8 left-1/2 -translate-x-1/2 w-32 md:w-48" />
      <GeometricPatterns type="triangle" color="muted" size="md" opacity={20} className="top-4 left-4 md:top-8 md:left-8 rotate-45" />
      <GeometricPatterns type="triangle" color="muted" size="md" opacity={20} className="top-4 right-4 md:top-8 md:right-8 -rotate-45" />
      <GeometricPatterns type="triangle" color="primary" size="sm" opacity={25} className="bottom-8 left-8 md:bottom-12 md:left-12 rotate-12" />
      <GeometricPatterns type="triangle" color="primary" size="sm" opacity={25} className="bottom-8 right-8 md:bottom-12 md:right-12 -rotate-12" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <span className="text-primary">Расписание</span> тренировок
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Выберите группу, соответствующую возрасту и уровню подготовки вашего ребенка
            </p>
          </div>
        </ScrollReveal>

            {loading ? (
              <div className="text-center py-12">Загрузка расписания...</div>
            ) : scheduleData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Расписание временно недоступно</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
                {scheduleData.map((item, index) => (
                  <ScrollReveal key={item.id} delay={index * 100}>
                  <div
                    className="bg-card border-2 border-border rounded-xl p-5 md:p-6 hover:border-primary hover:shadow-ski transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3 md:mb-4 gap-2">
                      <h3 className="text-lg md:text-2xl font-bold text-foreground">{item.group}</h3>
                      <span className="bg-gradient-hero text-primary-foreground px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap">
                        {item.spots} места
                      </span>
                    </div>

                    <div className="space-y-2 md:space-y-3 text-muted-foreground text-sm md:text-base">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Users className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                        <span className="font-medium">{item.age_range}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-3">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                        <span>{item.days}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-3">
                        <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                        <span>{item.time}</span>
                      </div>
                      
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs md:text-sm font-medium text-foreground">{item.location}</p>
                      </div>
                    </div>

                    <Button 
                      variant="cta" 
                      className="w-full mt-4 md:mt-6 group text-sm md:text-base h-11 md:h-12 touch-manipulation" 
                      onClick={scrollToForm}
                    >
                      Записаться в группу
                      <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  </ScrollReveal>
                ))}
              </div>
            )}

        <ScrollReveal delay={200}>
          <div className="text-center mt-8 md:mt-12 px-4">
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Не нашли подходящую группу? Оставьте заявку, и мы подберем оптимальный вариант
            </p>
            <Button variant="outline" size="lg" onClick={scrollToForm} className="text-sm md:text-base">
              Узнать свободные места
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Schedule;
