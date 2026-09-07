import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Trainers from "@/components/Trainers";
import Tariffs from "@/components/Tariffs";
import Locations from "@/components/Locations";
import Camps from "@/components/Camps";
import DeferredSection from "@/components/DeferredSection";

const loadGallery = () => import("@/components/Gallery");
const loadContactForm = () => import("@/components/ContactForm");

const GalleryFallback = () => (
  <section id="gallery" className="py-12 md:py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8 md:mb-12">
        <div className="h-10 md:h-14 w-64 mx-auto mb-4 rounded-lg bg-muted animate-pulse" />
        <div className="h-5 md:h-6 w-48 md:w-64 mx-auto rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-square rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const ContactFormFallback = () => (
  <section id="contact-form" className="py-12 md:py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="h-10 md:h-14 w-72 mx-auto mb-4 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 md:h-6 w-56 md:w-80 mx-auto rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-card border-2 border-border rounded-xl md:rounded-2xl p-6 md:p-8 space-y-4 animate-pulse">
            <div className="h-12 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
          </div>
          <div className="bg-secondary rounded-xl md:rounded-2xl p-6 md:p-8 space-y-4 animate-pulse">
            <div className="h-8 rounded bg-muted/60" />
            <div className="h-6 rounded bg-muted/60" />
            <div className="h-6 rounded bg-muted/60" />
            <div className="h-10 rounded bg-muted/60" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Index = () => {
  return (
    <main className="min-h-screen">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Перейти к основному содержимому
      </a>

      {/* Aria live region for dynamic content announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="aria-live-region"
      />

      <Navigation />
      <div id="main-content" tabIndex={-1}>
        <Hero />
        {/* 1. О нас */}
        <About />
        {/* 2. Фото */}
        <DeferredSection loader={loadGallery} fallback={<GalleryFallback />} />
        {/* 3. Наши тренеры */}
        <Trainers />
        {/* 4. Тарифы */}
        <Tariffs />
        {/* 5. Где тренируемся */}
        <Locations />
        {/* 6. Сборы */}
        <Camps />
        {/* 7. Запись на пробное */}
        <DeferredSection loader={loadContactForm} fallback={<ContactFormFallback />} />
      </div>

      {/* Footer */}
      <footer className="bg-ski-black text-ski-white py-6 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-ski-white/60 text-sm md:text-base">
            © {new Date().getFullYear()} Школа горнолыжного спорта «Вершина». Все права защищены.
          </p>
          <address className="mt-2 text-ski-white/60 text-sm not-italic">
            Санкт-Петербург
          </address>
        </div>
      </footer>
    </main>
  );
};

export default Index;
