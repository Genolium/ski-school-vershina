import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Target, Mountain, Trophy } from "lucide-react";
import heroImageJpeg from "@/assets/photo_2025-10-31 13.19.50.jpeg";
import heroImageWebp from "@/assets/hero-background.webp";

const Hero = () => {
  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image с оптимизацией */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source srcSet={heroImageWebp} type="image/webp" />
          <img
            src={heroImageJpeg}
            alt="Горнолыжный склон школы Вершина"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-br from-ski-black via-ski-gray to-ski-black mix-blend-multiply" />
      </div>

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-ski-black/80 via-ski-black/40 to-ski-black/90" />

      {/* Subtle soft ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center relative pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ski-white/10 border border-ski-white/20 text-ski-white text-xs sm:text-sm font-medium backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Набор детей от 4 лет на сезон 2026/2027
          </div>

          <h1
            aria-label="Школа горнолыжного спорта «Вершина»"
            className="text-3xl sm:text-5xl md:text-7xl font-bold text-ski-white leading-[1.15] tracking-tight px-2"
          >
            Стань чемпионом с
            <br />
            <span className="text-primary bg-gradient-hero bg-clip-text text-transparent">
              горнолыжной школой «Вершина»
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-ski-white/90 font-medium max-w-2xl mx-auto px-4">
            Профессиональное обучение детей горнолыжному спорту по австрийской методике с 2001 года
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center px-4 pt-2 md:pt-4 max-w-xl mx-auto">
            <Button
              variant="hero"
              size="lg"
              onClick={scrollToForm}
              className="group w-full sm:w-auto text-sm sm:text-base h-12 sm:h-14 px-8 touch-manipulation shadow-ski"
              aria-label="Записаться на тренировку"
            >
              Записаться на тренировку
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={scrollToAbout}
              className="bg-ski-white/10 border-ski-white/30 text-ski-white hover:bg-ski-white hover:text-ski-black backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base h-12 sm:h-14 px-6 touch-manipulation"
            >
              Узнать подробнее
            </Button>

            <a href="tel:+79817428685" className="w-full sm:w-auto" aria-label="Позвонить тренеру по телефону +7 (981) 742-86-85">
              <Button
                variant="outline"
                size="lg"
                className="bg-ski-white/10 border-ski-white/30 text-ski-white hover:bg-ski-white hover:text-ski-black backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base h-12 sm:h-14 px-6 touch-manipulation"
              >
                Позвонить тренеру
              </Button>
            </a>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 pt-8 md:pt-14 px-2">
            <div className="bg-ski-black/60 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl border border-ski-white/15 hover:border-primary/60 transition-all duration-300 hover:scale-105 shadow-lg flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-2.5 md:mb-3">
                <Award className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <p className="text-ski-white font-semibold text-xs sm:text-sm md:text-base">Опытные тренеры</p>
              <p className="text-ski-white/60 text-[11px] sm:text-xs mt-0.5 hidden sm:block">Мастера спорта и педагоги</p>
            </div>

            <div className="bg-ski-black/60 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl border border-ski-white/15 hover:border-primary/60 transition-all duration-300 hover:scale-105 shadow-lg flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-2.5 md:mb-3">
                <Target className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <p className="text-ski-white font-semibold text-xs sm:text-sm md:text-base">Личный подход</p>
              <p className="text-ski-white/60 text-[11px] sm:text-xs mt-0.5 hidden sm:block">Мини-группы до 6 детей</p>
            </div>

            <div className="bg-ski-black/60 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl border border-ski-white/15 hover:border-primary/60 transition-all duration-300 hover:scale-105 shadow-lg flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-2.5 md:mb-3">
                <Mountain className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <p className="text-ski-white font-semibold text-xs sm:text-sm md:text-base">Австрийская методика</p>
              <p className="text-ski-white/60 text-[11px] sm:text-xs mt-0.5 hidden sm:block">Мировой эталон техники</p>
            </div>

            <div className="bg-ski-black/60 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl border border-ski-white/15 hover:border-primary/60 transition-all duration-300 hover:scale-105 shadow-lg flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-2.5 md:mb-3">
                <Trophy className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <p className="text-ski-white font-semibold text-xs sm:text-sm md:text-base">Победы и разряды</p>
              <p className="text-ski-white/60 text-[11px] sm:text-xs mt-0.5 hidden sm:block">Регулярные старты</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
