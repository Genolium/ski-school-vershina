import { useEffect, useState } from "react";
import { MapPin, Bike, Mountain as MountainIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import indoorImage from "@/assets/photo_2025-10-31 13.20.10.jpeg";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import Map2GIS from "./YandexMap";
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
    getLocations()
      .then(setItems)
      .catch((error) => {
        logError(error, 'Locations component');
        setItems([]);
      });
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
    <section id="locations" className="py-12 md:py-20 bg-gradient-dark text-ski-white relative overflow-hidden">
      {/* Geometric Patterns */}
      <GeometricPatterns type="chevrons-left" color="primary" size="lg" opacity={40} className="top-8 right-8 md:top-12 md:right-12" />
      <GeometricPatterns type="chevrons-right" color="white" size="lg" opacity={35} className="bottom-8 left-8 md:bottom-12 md:left-12" />
      <GeometricPatterns type="x-grid" color="primary" size="md" opacity={30} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              Где мы <span className="text-primary">тренируемся</span>
            </h2>
            <p className="text-base md:text-xl text-ski-white/80 max-w-2xl mx-auto px-4">
              Профессиональные площадки для всесезонных тренировок
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          {locations.map((location, index) => (
            <ScrollReveal key={location.id} delay={index * 100}>
            <div
              className="bg-ski-white/5 backdrop-blur-sm border border-ski-white/10 rounded-xl p-5 md:p-6 hover:border-primary hover:bg-ski-white/10 transition-all duration-300 md:hover:scale-105"
            >
              <div className="bg-gradient-hero rounded-lg p-3 md:p-4 w-fit mb-3 md:mb-4 text-ski-white">
                {iconFor(location.icon_type)}
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-2">{location.title}</h3>
              <p className="text-primary text-xs md:text-sm font-semibold mb-2 md:mb-3">{location.address}</p>
              <p className="text-ski-white/80 mb-3 md:mb-4 text-sm md:text-base">{location.description}</p>
              
              <ul className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                {parseFeatures(location.features).map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs md:text-sm">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-ski-white/90">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {(location.route_url || (location.latitude && location.longitude && location.latitude !== 0 && location.longitude !== 0)) && (
                <a 
                  href={getRouteUrl(location)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="outline" size="sm" className="text-xs md:text-sm border-primary/50 text-primary bg-transparent hover:bg-primary/10 hover:text-primary hover:border-primary">
                    Как добраться
                  </Button>
                </a>
              )}
            </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Карта 2ГИС */}
        <ScrollReveal delay={300}>
          <div className="mb-8 md:mb-12">
            <Map2GIS />
          </div>
        </ScrollReveal>

        {/* Indoor Training Image */}
        <ScrollReveal delay={400}>
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-96 group">
          <img 
            src={indoorImage} 
            alt="Современный крытый тренировочный зал для горнолыжной школы Вершина" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ski-black/80 via-ski-black/40 to-transparent flex items-end">
            <div className="p-5 md:p-8">
              <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Современный тренировочный комплекс</h3>
              <p className="text-ski-white/90 text-sm md:text-lg mb-3 md:mb-4">
                Круглогодичные тренировки в комфортных условиях
              </p>
              <a 
                href="https://2gis.ru/spb/search/Санкт-Петербург, ул. Брянцева 24" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="hero" size="sm" className="text-xs md:text-base h-9 md:h-11">
                  Как добраться
                </Button>
              </a>
            </div>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Locations;
