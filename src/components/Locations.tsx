import { useEffect, useState } from "react";
import { MapPin, Bike, Mountain as MountainIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "./ScrollReveal";
import { getLocations, type Location } from "@/lib/api";
import { logError } from "@/lib/errorHandler";

function iconFor(type?: string) {
  switch (type) {
    case "MapPin":
      return <MapPin className="h-8 w-8" />;
    case "Bike":
      return <Bike className="h-8 w-8" />;
    case "Mountain":
      return <MountainIcon className="h-8 w-8" />;
    default:
      return <MapPin className="h-8 w-8" />;
  }
}

const Locations = () => {
  const [items, setItems] = useState<Location[]>([]);

  useEffect(() => {
    // Задержка для оптимизации критического пути - загружаем после LCP
    const timer = setTimeout(() => {
      getLocations()
        .then(setItems)
        .catch((error) => {
          logError(error, 'Locations component');
          setItems([]);
        });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fallbackLocations: Location[] = [
    {
      id: 0,
      title: "Зал",
      address: "ул. Брянцева 24",
      description: "Специализированный зал для ОФП, начальной подготовки и отработки техники",
      features: JSON.stringify(["Искусственный склон", "Современное оборудование", "Раздевалки"]),
      icon_type: "MapPin",
      order: 0,
      latitude: 0,
      longitude: 0,
    },
    {
      id: 1,
      title: "Велосипеды/Ролики",
      address: "п. Токсово «Северный склон»",
      description:
        "Летние тренировки на велосипедах и роликах для развития баланса и выносливости",
      features: JSON.stringify(["Безопасные трассы", "Профессиональная экипировка", "Групповые занятия"]),
      icon_type: "Bike",
      order: 1,
      latitude: 0,
      longitude: 0,
    },
    {
      id: 2,
      title: "Горные лыжи",
      address: "ГК «Снежный»",
      description: "Основные тренировки на горнолыжных склонах с ратраченными трассами",
      features: JSON.stringify(["5 трасс разного уровня", "Подъемники", "Прокат оборудования"]),
      icon_type: "Mountain",
      order: 2,
      latitude: 0,
      longitude: 0,
    },
  ];

  const locations = items.length ? items : fallbackLocations;

  const parseFeatures = (f?: string) => {
    if (!f) return [] as string[];
    try {
      const v = JSON.parse(f);
      return Array.isArray(v) ? (v as string[]) : [];
    } catch {
      return [];
    }
  };

  const getRouteUrl = (location: Location) => {
    // Если есть ручная ссылка - используем её
    if (location.route_url && location.route_url.trim() !== "") {
      return location.route_url;
    }
    // Иначе используем координаты или адрес
    if (location.latitude && location.longitude && location.latitude !== 0 && location.longitude !== 0) {
      return `https://2gis.ru/spb/routeSearch/rsType/car/to/${location.longitude},${location.latitude}`;
    }
    // Если координат нет - используем адрес для поиска в 2ГИС
    return `https://2gis.ru/spb/search/${encodeURIComponent(location.address)}`;
  };

  return (
    <section id="locations" className="py-16 md:py-24 bg-gradient-dark text-ski-white relative overflow-hidden">
      {/* Ambient soft glow */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">
              Где мы <span className="text-primary">тренируемся</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-ski-white/80 max-w-2xl mx-auto px-4 leading-relaxed">
              Профессиональные площадки для всесезонных тренировок
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 items-stretch">
          {locations.map((location, index) => (
            <ScrollReveal key={location.id} delay={index * 100} className="h-full">
              <div
                className="bg-ski-white/5 backdrop-blur-sm border border-ski-white/10 rounded-2xl p-5 sm:p-6 md:p-7 hover:border-primary/60 hover:bg-ski-white/10 transition-all duration-300 md:hover:-translate-y-1 flex flex-col h-full shadow-lg"
              >
                <div className="bg-gradient-hero rounded-xl p-3.5 w-fit mb-4 text-ski-white shadow-sm">
                  {iconFor(location.icon_type)}
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold mb-1.5">{location.title}</h3>
                <p className="text-primary text-xs sm:text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{location.address}</span>
                </p>
                <p className="text-ski-white/80 mb-4 text-xs sm:text-sm leading-relaxed">{location.description}</p>
                
                <ul className="space-y-2 mb-6 flex-1">
                  {parseFeatures(location.features).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                      <span className="text-ski-white/90 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto pt-2 border-t border-ski-white/10">
                  {(location.route_url || (location.latitude && location.longitude && location.latitude !== 0 && location.longitude !== 0)) && (
                    <a 
                      href={getRouteUrl(location)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block w-full touch-manipulation"
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs sm:text-sm border-primary/50 text-primary bg-transparent hover:bg-primary hover:text-white transition-colors touch-manipulation h-10"
                      >
                        Как добраться
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Locations;
