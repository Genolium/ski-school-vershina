import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, Award, Target } from "lucide-react";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import { getAbout, getStats, type AboutContent, type Statistic } from "@/lib/api";

function iconFor(type?: string) {
  switch (type) {
    case "Trophy":
      return <Trophy className="h-8 w-8" />;
    case "Users":
      return <Users className="h-8 w-8" />;
    case "Award":
      return <Award className="h-8 w-8" />;
    case "Target":
      return <Target className="h-8 w-8" />;
    default:
      return <Trophy className="h-8 w-8" />;
  }
}

const About = () => {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [stats, setStats] = useState<Statistic[]>([]);

  useEffect(() => {
    // Задержка для оптимизации критического пути - загружаем после LCP
    const timer = setTimeout(() => {
      Promise.all([getAbout().catch(() => null), getStats().catch(() => [])]).then(([aboutData, statsData]) => {
        if (aboutData) setAbout(aboutData);
        if (Array.isArray(statsData)) setStats(statsData);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const parsedParagraphs = useMemo(() => {
    if (!about?.paragraphs) return [] as string[];
    try {
      const value = JSON.parse(about.paragraphs);
      return Array.isArray(value) ? (value as string[]) : [about.description].filter(Boolean);
    } catch {
      return [about?.description].filter(Boolean) as string[];
    }
  }, [about]);

  return (
    <section id="about" className="py-12 md:py-20 bg-background relative overflow-hidden">
      {/* Geometric Patterns */}
      <div className="hidden md:block">
        <GeometricPatterns type="x-grid" color="primary" size="lg" opacity={10} className="top-8 left-4 md:top-12 md:left-8" />
        <GeometricPatterns type="x-grid" color="primary" size="lg" opacity={10} className="bottom-8 right-4 md:bottom-12 md:right-8 rotate-180" />
        <GeometricPatterns type="chevrons-left" color="muted" size="md" opacity={20} className="top-1/2 left-4 md:left-8" />
        <GeometricPatterns type="chevrons-right" color="muted" size="md" opacity={20} className="top-1/2 right-4 md:right-8" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              О <span className="text-primary">нас</span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              {about?.description || "Мы создаем чемпионов и помогаем детям полюбить горнолыжный спорт"}
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-16">
          {(stats.length ? stats : [
            { value: "25", label: "лет работы", suffix: "+", icon_type: "Trophy", id: 0, order: 0 },
            { value: "150", label: "воспитанников", suffix: "+", icon_type: "Users", id: 1, order: 1 },
            { value: "50", label: "побед в сезоне", suffix: "+", icon_type: "Award", id: 2, order: 2 },
            { value: "100", label: "довольных родителей", suffix: "%", icon_type: "Target", id: 3, order: 3 },
          ] as Statistic[]).map((stat: Statistic, index: number) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div
                className="bg-gradient-hero text-ski-white rounded-lg md:rounded-xl p-4 md:p-6 text-center hover:scale-105 transition-transform duration-300 shadow-ski"
              >
                <div className="flex justify-center mb-2 md:mb-3">
                  <div className="scale-75 md:scale-100">
                    {iconFor(stat.icon_type)}
                  </div>
                </div>
                <div className="text-2xl md:text-4xl font-bold mb-1">
                  {stat.value}
                  <span className="text-lg md:text-2xl">{stat.suffix || ""}</span>
                </div>
                <p className="text-xs md:text-sm text-ski-white/90 font-medium">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>



        {/* Description */}
        <ScrollReveal delay={300}>
          <div className="w-full mx-auto bg-card rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-border">
            {/* Описание и параграфы из админки */}
            <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm md:text-base">
              {about?.description && (
                <p>{about.description}</p>
              )}
              {parsedParagraphs.length > 0 ? (
                parsedParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))
              ) : (
                <>
                  <p>
                    С 2001 года мы обучаем детей горнолыжному спорту по современной австрийской методике.
                  </p>
                  <p>
                    Наши тренеры — мастера спорта и опытные педагоги, которые помогают раскрыть потенциал.
                  </p>
                </>
              )}
              <div className="grid md:grid-cols-3 gap-3 md:gap-4 pt-3 md:pt-4">
                <div className="bg-primary/10 rounded-lg p-3 md:p-4">
                  <p className="font-bold text-foreground mb-1 text-sm md:text-base">Безопасность</p>
                  <p className="text-xs md:text-sm">Современное оборудование и контроль тренеров</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 md:p-4">
                  <p className="font-bold text-foreground mb-1 text-sm md:text-base">Результат</p>
                  <p className="text-xs md:text-sm">Регулярные соревнования и аттестации</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 md:p-4">
                  <p className="font-bold text-foreground mb-1 text-sm md:text-base">Команда</p>
                  <p className="text-xs md:text-sm">Дружный коллектив единомышленников</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default About;
