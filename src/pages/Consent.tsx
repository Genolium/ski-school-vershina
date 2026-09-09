import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck, Mail, Phone, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useLegalSettings } from "@/lib/legalSettings";

const Consent = () => {
  const settings = useLegalSettings();

  useEffect(() => {
    document.title = `${settings.consent.title} | ${settings.operator.name}`;
    window.scrollTo(0, 0);
  }, [settings.consent.title, settings.operator.name]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Верхняя навигация */}
      <header className="sticky top-0 z-40 bg-ski-black/95 backdrop-blur-md border-b border-ski-white/10 text-ski-white">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-ski-white/80 hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-ski-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>На главную</span>
            </Link>
            <span className="hidden sm:inline text-ski-white/30">|</span>
            <Link
              to="/"
              className="text-lg md:text-xl font-bold text-primary tracking-tight"
            >
              VERSHINA
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-ski-white border-ski-white/20 hover:bg-ski-white/10 hover:text-ski-white"
            >
              <Printer className="h-3.5 w-3.5" />
              Распечатать
            </Button>
            <Link to="/privacy">
              <Button variant="ghost" size="sm" className="text-xs text-ski-white/80 hover:text-primary">
                Политика конфиденциальности
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Заголовок */}
          <div className="mb-8 md:mb-12 border-b border-border pb-6 md:pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Федеральный закон № 152-ФЗ
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {settings.consent.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Дата редакции: {settings.consent.effectiveDate} | Действует для всех пользователей, заполняющих веб-формы на сайте vershinaski.ru
            </p>
          </div>

          {/* Текст согласия */}
          <article className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm md:text-base leading-relaxed text-foreground/90">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 md:p-6 mb-6">
              <p className="font-medium text-foreground">
                Заполняя форму заявки (обратной связи) на сайте{" "}
                <a href="https://vershinaski.ru" className="text-primary hover:underline font-semibold">
                  vershinaski.ru
                </a>{" "}
                и проставляя отметку в соответствующем поле (чекбоксе), Пользователь (Субъект персональных данных) свободно, своей волей и в своем интересе дает конкретное, предметное, информированное, сознательное и однозначное согласие Оператору — <strong>{settings.operator.name}</strong>
                {settings.operator.inn ? ` (ИНН ${settings.operator.inn}${settings.operator.ogrn ? `, ОГРН/ОГРНИП ${settings.operator.ogrn}` : ""})` : ""}
                {" "}({settings.operator.address}, e-mail:{" "}
                <a href={`mailto:${settings.operator.email}`} className="text-primary hover:underline font-medium">
                  {settings.operator.email}
                </a>
                , телефон:{" "}
                <a href={`tel:${settings.operator.phone.replace(/[^+\d]/g, "")}`} className="text-primary hover:underline font-medium">
                  {settings.operator.phone}
                </a>
                ) на обработку своих персональных данных на следующих условиях:
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                1. Перечень персональных данных, на обработку которых дается согласие
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                {settings.consent.dataTypesList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                2. Цели обработки персональных данных
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                {settings.consent.purposeList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                3. Перечень действий с персональными данными
              </h2>
              <p>
                Согласие предоставляется на совершение следующих действий (операций) с персональными данными как с использованием средств автоматизации, так и без них:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Сбор и запись;</li>
                <li>Систематизация и накопление;</li>
                <li>Хранение в базах данных, расположенных на территории Российской Федерации;</li>
                <li>Уточнение (обновление, изменение);</li>
                <li>Использование для связи с Пользователем;</li>
                <li>Блокирование;</li>
                <li>Удаление и уничтожение персональных данных по достижении целей или по заявлению Пользователя.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                4. Срок действия согласия и порядок его отзыва
              </h2>
              <p>
                4.1. Настоящее согласие действует с момента его предоставления (отправки заявки через веб-форму) до момента достижения целей обработки, либо до момента отзыва согласия Пользователем.
              </p>
              <p>
                4.2. Согласие может быть отозвано Пользователем или его законным представителем в любой момент путем направления письменного заявления на электронную почту Оператора:{" "}
                <a href={`mailto:${settings.operator.email}`} className="text-primary hover:underline font-semibold">
                  {settings.operator.email}
                </a>{" "}
                с темой письма <em>«Отзыв согласия на обработку персональных данных»</em>.
              </p>
              <p>
                4.3. В случае отзыва согласия Оператор прекращает обработку данных и уничтожает их в срок, не превышающий 30 (тридцати) календарных дней со дня поступления заявления, за исключением случаев, когда обработка может быть продолжена в соответствии с законодательством РФ.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                5. Подтверждение пользователя
              </h2>
              <p>
                Пользователь подтверждает, что, предоставляя персональные данные:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Действует свободно, по своей воле и в своем интересе;</li>
                <li>Является дееспособным гражданином (или законным представителем несовершеннолетнего);</li>
                <li>Указывает достоверные сведения о себе;</li>
                <li>Ознакомлен(а) с{" "}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">
                    Политикой конфиденциальности (обработки персональных данных)
                  </Link>{" "}
                  Оператора и полностью согласен(на) с ее положениями.
                </li>
              </ul>
            </section>

            {settings.consent.customTerms && (
              <section className="space-y-3">
                <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  6. Дополнительные условия согласия
                </h2>
                <div className="whitespace-pre-line leading-relaxed text-foreground/90 bg-muted/30 p-4 rounded-xl border border-border">
                  {settings.consent.customTerms}
                </div>
              </section>
            )}

            {/* Контакты оператора */}
            <div className="bg-muted/50 border border-border rounded-xl p-5 mt-6 space-y-2 text-sm">
              <p className="font-semibold text-foreground">Контакты Оператора:</p>
              <p className="font-medium">{settings.operator.name}</p>
              {settings.operator.inn && (
                <p>
                  ИНН: {settings.operator.inn}
                  {settings.operator.ogrn ? ` | ОГРН / ОГРНИП: ${settings.operator.ogrn}` : ""}
                </p>
              )}
              {settings.roskomnadzor.registered && settings.roskomnadzor.regNumber && (
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                  Реестр операторов Роскомнадзора: № {settings.roskomnadzor.regNumber}
                  {settings.roskomnadzor.registrationDate ? ` от ${settings.roskomnadzor.registrationDate}` : ""}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                Телефон: <a href={`tel:${settings.operator.phone.replace(/[^+\d]/g, "")}`} className="text-primary hover:underline">{settings.operator.phone}</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                E-mail: <a href={`mailto:${settings.operator.email}`} className="text-primary hover:underline">{settings.operator.email}</a>
              </p>
              <p>Адрес: {settings.operator.address}</p>
            </div>
          </article>

          {/* Кнопка возврата внизу */}
          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <Link to="/">
              <Button variant="hero" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Вернуться на главную
              </Button>
            </Link>
            <Link to="/privacy">
              <Button variant="outline">
                Политика конфиденциальности
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Consent;
