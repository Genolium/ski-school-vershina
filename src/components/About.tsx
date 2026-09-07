import { useEffect, useMemo, useState } from "react";
import { Trophy, Users, Award, Target, ShieldCheck, Zap, HeartHandshake } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { getAbout, getStats, type AboutContent, type Statistic } from "@/lib/api";

function iconFor(type?: string) {
  switch (type) {
    case "Trophy":
      return <Trophy className="h-6 w-6 md:h-7 md:w-7" />;
    case "Users":
      return <Users className="h-6 w-6 md:h-7 md:w-7" />;
    case "Award":
      return <Award className="h-6 w-6 md:h-7 md:w-7" />;
    case "Target":
      return <Target className="h-6 w-6 md:h-7 md:w-7" />;
    default:
      return <Trophy className="h-6 w-6 md:h-7 md:w-7" />;
  }
}

const fallbackStats: Statistic[] = [
  { value: "25", label: "лет работы", suffix: "+", icon_type: "Trophy", id: 0, order: 0 },
  { value: "250", label: "воспитанников", suffix: "+", icon_type: "Users", id: 1, order: 1 },
  { value: "50", label: "побед в сезоне", suffix: "+", icon_type: "Award", id: 2, order: 2 },
  { value: "100", label: "довольных родителей", suffix: "%", icon_type: "Target", id: 3, order: 3 },
];

const About = () => {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [stats, setStats] = useState<Statistic[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.all([getAbout().catch(() => null), getStats().catch(() => [])]).then(([aboutData, statsData]) => {
        if (aboutData) setAbout(aboutData);
        if (Array.isArray(statsData) && statsData.length > 0) setStats(statsData);
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

  const displayStats = stats.length ? stats : fallbackStats;

  return (
    <section id="about" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Мягкие фоновые акценты без шума */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        {/* Заголовок секции */}
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">
              О <span className="text-primary">нас</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Воспитываем чемпионов в спорте и жизни с 2001 года
            </p>
          </div>
        </ScrollReveal>

        {/* Сетка цифр и достижений */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-10 md:mb-16">
          {displayStats.map((stat: Statistic, index: number) => (
            <ScrollReveal key={stat.id || index} delay={index * 80}>
              <div className="bg-gradient-hero text-ski-white rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 text-center hover:scale-105 transition-all duration-300 shadow-ski h-full flex flex-col justify-center items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-ski-white/15 flex items-center justify-center mb-2.5 md:mb-3">
                  {iconFor(stat.icon_type)}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 tracking-tight">
                  {stat.value}
                  <span className="text-lg md:text-2xl font-semibold">{stat.suffix || ""}</span>
                </div>
                <p className="text-xs sm:text-sm text-ski-white/90 font-medium leading-tight">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Описание школы и ценности */}
        <ScrollReveal delay={250}>
          <div className="bg-card rounded-2xl p-6 sm:p-8 md:p-10 border border-border shadow-sm">
            {/* Текстовая история */}
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
              <p className="text-base sm:text-lg md:text-xl text-foreground font-medium leading-relaxed mb-4">
                {about?.description ||
                  "«Вершина» — с 2001 года мы дарим детям любовь к горам и спорту, используя лучшие мировые практики — австрийскую методику обучения, признанную эталоном в горнолыжном мире."}
              </p>
              {parsedParagraphs.length > 0 ? (
                <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {parsedParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Мы гарантируем индивидуальное внимание за счет работы в небольших группах, где прогресс каждого ученика — наш главный приоритет. Наши тренеры — внимательные наставники, которые находят подход к каждому ребенку, помогая достигать вершин на склоне и в жизни.
                </p>
              )}
            </div>

            {/* 3 Ключевых принципа */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4 border-t border-border">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">Безопасность</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Современная сертифицированная экипировка и постоянный контроль тренера на склоне.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">Результат</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Аттестации по австрийской шкале, регулярные старты и выполнение спортивных разрядов.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mb-1">Команда</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Дружный коллектив единомышленников, командный дух и выездные сборы.
                  </p>
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
