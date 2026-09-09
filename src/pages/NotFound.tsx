import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "404 — Страница не найдена | Школа горнолыжного спорта «Вершина»";
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <header className="bg-ski-black text-ski-white border-b border-ski-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary tracking-tight">
            VERSHINA
          </Link>
          <Link to="/" className="text-sm text-ski-white/80 hover:text-primary transition-colors flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>На главную</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary font-extrabold text-3xl mb-6">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
          Страница не найдена
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm sm:text-base">
          Возможно, адрес страницы изменился или она была удалена. Вы можете вернуться на главную страницу сайта школы.
        </p>
        <Link to="/">
          <Button variant="hero" size="lg" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Перейти на главную
          </Button>
        </Link>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
