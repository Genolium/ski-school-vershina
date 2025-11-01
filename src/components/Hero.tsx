import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Target, Mountain, Trophy } from "lucide-react";
import heroImage from "@/assets/photo_2025-10-31 13.19.50.jpeg";
import GeometricPatterns from "./GeometricPatterns";

const Hero = () => {
  const scrollToForm = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-ski-black via-ski-gray to-ski-black"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.65)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Additional Dark Overlay for Better Readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-ski-black/60 via-transparent to-ski-black/60" />
      
      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <GeometricPatterns type="x-grid" color="white" size="lg" opacity={5} className="top-16 left-8 md:top-20 md:left-10" />
        <GeometricPatterns type="chevrons-right" color="primary" size="lg" opacity={40} className="bottom-32 right-16 md:bottom-40 md:right-20" />
        <GeometricPatterns type="zigzag" color="white" size="md" opacity={30} className="bottom-16 left-8 md:bottom-20 md:left-12" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center relative">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in pt-20 md:pt-24">
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold text-ski-white leading-tight px-2">
            Стань чемпионом с<br />
            <span className="text-primary bg-gradient-hero bg-clip-text text-transparent">
              горнолыжной школой «Вершина»
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-2xl text-ski-white font-medium px-4">
            Обучаем детей горнолыжному спорту с 2001 года
          </p>

          <div className="flex flex-col gap-3 justify-center items-stretch px-4 pt-2 md:pt-4 max-w-md mx-auto">
            <Button 
              variant="hero" 
              size="lg"
              onClick={scrollToForm}
              className="group w-full text-sm sm:text-base h-12 sm:h-14"
            >
              Записаться на пробное занятие
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <a href="tel:+79817428685" className="w-full" aria-label="Позвонить тренеру по телефону +7 (981) 742-86-85">
              <Button variant="outline" size="lg" className="bg-ski-white/10 border-ski-white text-ski-white hover:bg-ski-white hover:text-ski-black backdrop-blur-sm w-full text-sm sm:text-base h-12 sm:h-14">
                Позвонить тренеру
              </Button>
            </a>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pt-8 md:pt-12 pb-12 md:pb-20 px-2">
            <div className="bg-ski-black/70 backdrop-blur-md p-4 md:p-6 rounded-lg border border-ski-white/30 hover:border-primary transition-all hover:scale-105 shadow-lg">
              <Award className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2 md:mb-3 mx-auto" />
              <p className="text-ski-white font-semibold text-xs sm:text-sm md:text-base">Опытные тренеры</p>
            </div>
            
            <div className="bg-ski-black/70 backdrop-blur-md p-4 md:p-6 rounded-lg border border-ski-white/30 hover:border-primary transition-all hover:scale-105 shadow-lg">
              <Target className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2 md:mb-3 mx-auto" />
              <p className="text-ski-white font-semibold text-xs sm:text-sm md:text-base">Индивидуальный подход</p>
            </div>
            
            <div className="bg-ski-black/70 backdrop-blur-md p-4 md:p-6 rounded-lg border border-ski-white/30 hover:border-primary transition-all hover:scale-105 shadow-lg">
              <Mountain className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2 md:mb-3 mx-auto" />
              <p className="text-ski-white font-semibold text-xs sm:text-sm md:text-base">Австрийская методика</p>
            </div>
            
            <div className="bg-ski-black/70 backdrop-blur-md p-4 md:p-6 rounded-lg border border-ski-white/30 hover:border-primary transition-all hover:scale-105 shadow-lg">
              <Trophy className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2 md:mb-3 mx-auto" />
              <p className="text-ski-white font-semibold text-xs sm:text-sm md:text-base">Победы в соревнованиях</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
