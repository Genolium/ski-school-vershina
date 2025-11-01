import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mountain, Calendar, Users, Snowflake } from "lucide-react";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import { getCamps, type Camp } from "@/lib/api";

const Camps = () => {
  const [camps, setCamps] = useState<Camp[]>([]);

  useEffect(() => {
    getCamps().then((data) => setCamps(data.filter((c) => c.is_active !== false))).catch(() => setCamps([]));
  }, []);

  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const parseList = (value?: string) => {
    if (!value) return [] as string[];
    try {
      const v = JSON.parse(value);
      return Array.isArray(v) ? (v as string[]) : [];
    } catch {
      return [];
    }
  };

  return (
    <section id="camps" className="py-12 md:py-20 bg-gradient-dark text-ski-white relative overflow-hidden">
      {/* Geometric Patterns */}
      <GeometricPatterns type="triangle" color="primary" size="xl" opacity={50} className="top-8 right-8 md:top-12 md:right-12 rotate-12" />
      <GeometricPatterns type="x-grid" color="primary" size="lg" opacity={45} className="bottom-8 left-8 md:bottom-12 md:left-12" />
      <GeometricPatterns type="chevrons-left" color="primary" size="md" opacity={40} className="top-1/4 left-4 md:left-8" />
      <GeometricPatterns type="chevrons-right" color="primary" size="md" opacity={40} className="bottom-1/4 right-4 md:right-8" />
      <GeometricPatterns type="zigzag" color="primary" size="sm" opacity={35} className="top-16 left-1/2 -translate-x-1/2 w-24 md:w-32" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              Тренировочные <span className="text-primary">сборы</span>
            </h2>
            <p className="text-base md:text-xl text-ski-white/80 max-w-2xl mx-auto px-4">
              Выездные тренировки на лучших горнолыжных курортах
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-5xl mx-auto">
          {camps.length === 0 ? (
            <ScrollReveal>
            <div className="bg-ski-white/5 backdrop-blur-sm border-2 border-primary/30 rounded-xl md:rounded-2xl p-6 md:p-12 mb-6 md:mb-8 text-center">
              Данные о сборах появятся позже
            </div>
            </ScrollReveal>
          ) : (
            camps.map((camp, index) => (
              <ScrollReveal key={camp.id} delay={index * 150}>
              <div className="bg-ski-white/5 backdrop-blur-sm border-2 border-primary/30 rounded-xl md:rounded-2xl p-6 md:p-12 mb-6 md:mb-8">
                <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">{camp.title}</h3>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                      <div className="flex items-start gap-2 md:gap-3">
                        <Mountain className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">{camp.location}</p>
                          {camp.location_desc && (
                            <p className="text-ski-white/70 text-xs md:text-sm">{camp.location_desc}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 md:gap-3">
                        <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">{camp.dates}</p>
                          {camp.duration && (
                            <p className="text-ski-white/70 text-xs md:text-sm">Продолжительность: {camp.duration}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 md:gap-3">
                        <Users className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                        <div>
                          {camp.group_size && <p className="font-semibold">Группы: {camp.group_size}</p>}
                          {camp.group_desc && (
                            <p className="text-ski-white/70 text-xs md:text-sm">{camp.group_desc}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 md:gap-3">
                        <Snowflake className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 md:mt-1 flex-shrink-0" />
                        <div>
                          {camp.training_desc && <p className="font-semibold">{camp.training_desc}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-hero rounded-lg md:rounded-xl p-5 md:p-6">
                    <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Что включено:</h4>
                    <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                      {parseList(camp.included_items).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-ski-white rounded-full mt-1.5 md:mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {parseList(camp.included_items).length === 0 && (
                        <li className="text-ski-white/80">Список формируется…</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="text-center pt-5 md:pt-6 border-t border-ski-white/20">
                  <p className="text-sm md:text-lg mb-3 md:mb-4">
                    Места ограничены! Успейте записаться в группу
                  </p>
                  <Button variant="hero" size="lg" onClick={scrollToForm} className="text-sm md:text-base h-11 md:h-14">
                    Оставить заявку
                  </Button>
                </div>
              </div>
              </ScrollReveal>
            ))
          )}
        </div>

        {/* Past camps highlights */}
        <div className="grid md:grid-cols-3 gap-3 md:gap-4 text-center">
          {[
            { value: "5", label: "Сборов в прошлом сезоне" },
            { value: "80+", label: "Участников сборов" },
            { value: "98%", label: "Родителей рекомендуют" },
          ].map((item, index) => (
            <ScrollReveal key={index} delay={index * 100}>
            <div className="bg-ski-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-ski-white/10">
              <p className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2">{item.value}</p>
              <p className="text-xs md:text-sm text-ski-white/80">{item.label}</p>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Camps;
