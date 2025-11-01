import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Schedule from "@/components/Schedule";
import Locations from "@/components/Locations";
import About from "@/components/About";
import Camps from "@/components/Camps";
import ContactForm from "@/components/ContactForm";
import Gallery from "@/components/Gallery";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Schedule />
      <Locations />
      <About />
      <Camps />
      <Gallery />
      <ContactForm />
      
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
