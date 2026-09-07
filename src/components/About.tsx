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

        {/* Описание школы и ценности (2 колонки с выравниванием по левому краю) */}
        <ScrollReveal delay={250}>
          <div className="bg-card rounded-2xl p-6 sm:p-8 md:p-12 border border-border shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Левая колонка: история и методика школы */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Австрийская методика
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-snug">
                  Воспитываем чемпионов на склоне и в жизни
                </h3>

                <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed">
                  {about?.description ||
                    "«Вершина» — с 2001 года мы дарим детям любовь к горам и спорту, используя лучшие мировые практики — австрийскую методику обучения, признанную эталоном в горнолыжном мире."}
                </p>

                {parsedParagraphs.length > 0 && parsedParagraphs[0] !== about?.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {parsedParagraphs[0]}
                  </p>
                )}

                <div className="pt-2 border-l-2 border-primary/40 pl-4 py-1 text-xs sm:text-sm text-muted-foreground italic">
                  «Наша цель — не просто научить технике катания, а развить уверенность в себе, дисциплину и спортивный характер».
                </div>
              </div>

              {/* Правая колонка: 3 ключевых принципа (вертикальные карточки) */}
              <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4 text-left">
                <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-xl bg-muted/40 border border-border/80 hover:border-primary/40 hover:bg-card transition-all shadow-xs">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base mb-1">Безопасность</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Сертифицированная экипировка, проверенные склоны и постоянный контроль наставника.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-xl bg-muted/40 border border-border/80 hover:border-primary/40 hover:bg-card transition-all shadow-xs">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base mb-1">Результат</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Аттестации по австрийской шкале, регулярные старты и выполнение спортивных разрядов.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 sm:p-4.5 rounded-xl bg-muted/40 border border-border/80 hover:border-primary/40 hover:bg-card transition-all shadow-xs">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm sm:text-base mb-1">Команда</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Индивидуальное внимание за счет малых групп, сплоченный коллектив и выездные сборы.
                    </p>
                  </div>
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
