import { Link } from "react-router-dom";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { useLegalSettings } from "@/lib/legalSettings";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const settings = useLegalSettings();

  return (
    <footer className={`bg-ski-black text-ski-white border-t border-ski-white/10 ${className}`}>
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Колонка 1: О школе */}
          <div className="space-y-3">
            <Link
              to="/"
              className="text-xl md:text-2xl font-bold text-primary hover:text-primary/80 transition-colors inline-block tracking-tight"
            >
              VERSHINA
            </Link>
            <p className="text-sm text-ski-white/70 leading-relaxed">
              Школа горнолыжного спорта в Санкт-Петербурге и Ленинградской области. Профессиональные тренировки для детей и взрослых любого уровня подготовки.
            </p>
          </div>

          {/* Колонка 2: Навигация */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ski-white">
              Навигация
            </h4>
            <ul className="space-y-2 text-sm text-ski-white/70">
              <li>
                <a href="/#about" className="hover:text-primary transition-colors">О нас</a>
              </li>
              <li>
                <a href="/#gallery" className="hover:text-primary transition-colors">Фото</a>
              </li>
              <li>
                <a href="/#trainers" className="hover:text-primary transition-colors">Тренеры</a>
              </li>
              <li>
                <a href="/#tariffs" className="hover:text-primary transition-colors">Тарифы</a>
              </li>
              <li>
                <a href="/#locations" className="hover:text-primary transition-colors">Локации</a>
              </li>
              <li>
                <a href="/#camps" className="hover:text-primary transition-colors">Сборы</a>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Правовые документы */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ski-white">
              Документы
            </h4>
            <ul className="space-y-2 text-sm text-ski-white/70">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link
                  to="/consent"
                  className="hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Согласие на обработку данных
                </Link>
              </li>
            </ul>
            <p className="text-xs text-ski-white/50 pt-2 leading-relaxed">
              Обработка персональных данных осуществляется в строгом соответствии с Федеральным законом РФ № 152-ФЗ.
            </p>
          </div>

          {/* Колонка 4: Контакты */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ski-white">
              Контакты
            </h4>
            <div className="space-y-2.5 text-sm text-ski-white/80">
              <a
                href={`tel:${settings.operator.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{settings.operator.phone}</span>
              </a>
              <a
                href={`mailto:${settings.operator.email}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="break-all">{settings.operator.email}</span>
              </a>
              <a
                href={`https://wa.me/${settings.operator.phone.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                <span>WhatsApp</span>
              </a>
              <address className="not-italic text-xs text-ski-white/60 pt-1">
                {settings.operator.address}
              </address>
            </div>
          </div>
        </div>

        {/* Нижняя полоса с копирайтом */}
        <div className="pt-8 border-t border-ski-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ski-white/60">
          <p>© {currentYear} {settings.operator.name}. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Политика конфиденциальности
            </Link>
            <span>•</span>
            <Link to="/consent" className="hover:text-primary transition-colors">
              Согласие на обработку данных
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
