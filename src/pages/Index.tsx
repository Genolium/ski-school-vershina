import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Tariffs from "@/components/Tariffs";
import Locations from "@/components/Locations";
import About from "@/components/About";
import Camps from "@/components/Camps";
import ContactForm from "@/components/ContactForm";
import Gallery from "@/components/Gallery";

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
      <Tariffs />
      <Locations />
      <About />
      <Camps />
      <Gallery />
      <ContactForm />
      </div>
      
      {/* Footer */}
      <footer className="bg-ski-black text-ski-white py-6 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-ski-white/60 text-sm md:text-base">
            © 2025 Школа горнолыжного спорта «Вершина». Все права защищены.
          </p>
          <address className="mt-2 text-ski-white/60 text-sm not-italic">
            Санкт-Петербург, ул. Брянцева 24
          </address>
        </div>
      </footer>
    </main>
  );
};

export default Index;
