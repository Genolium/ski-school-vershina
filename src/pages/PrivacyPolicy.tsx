import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Mail, Phone, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useLegalSettings } from "@/lib/legalSettings";

const PrivacyPolicy = () => {
  const settings = useLegalSettings();

  useEffect(() => {
    document.title = `${settings.privacyPolicy.title} | ${settings.operator.name}`;
    window.scrollTo(0, 0);
  }, [settings.privacyPolicy.title, settings.operator.name]);

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
            <Link to="/consent">
              <Button variant="ghost" size="sm" className="text-xs text-ski-white/80 hover:text-primary">
                Согласие на обработку
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
              {settings.privacyPolicy.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Дата вступления в силу: {settings.privacyPolicy.effectiveDate} | Последнее обновление: {settings.privacyPolicy.lastUpdated}
            </p>
          </div>

          {/* Текст политики */}
          <article className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed text-foreground/90">
            {settings.privacyPolicy.customIntro && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 md:p-5 not-prose text-foreground leading-relaxed">
                <p>{settings.privacyPolicy.customIntro}</p>
              </div>
            )}

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                1. Общие положения
              </h2>
              <p>
                1.1. Настоящая Политика обработки персональных данных (далее — «Политика») определяет порядок сбора, хранения, передачи и иных видов обработки персональных данных, осуществляемых {settings.operator.name} (далее — «Оператор»), а также меры по обеспечению безопасности персональных данных.
              </p>
              <p>
                1.2. Политика разработана в соответствии с требованиями Конституции Российской Федерации, Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и иных нормативно-правовых актов Российской Федерации в области защиты информации.
              </p>
              <p>
                1.3. Настоящая Политика действует в отношении всей информации, которую Оператор может получить о пользователях веб-сайта, размещенного в сети Интернет по адресу:{" "}
                <a href="https://vershinaski.ru" className="text-primary hover:underline font-medium">
                  https://vershinaski.ru
                </a>{" "}
                (включая все его поддомены).
              </p>
              <p>
                1.4. Использование сервисов и форм сайта означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его персональных данных. В случае несогласия с этими условиями Пользователь должен воздержаться от использования форм обратной связи и отправки данных.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                2. Основные понятия
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Персональные данные</strong> — любая информация, относящаяся к прямо или косвенно определенному или определяемому физическому лицу (субъекту персональных данных).
                </li>
                <li>
                  <strong>Оператор</strong> — государственный орган, муниципальный орган, юридическое или физическое лицо, организующие и (или) осуществляющие обработку персональных данных, а также определяющие цели обработки персональных данных, состав персональных данных, подлежащих обработке, действия (операции), совершаемые с персональными данными. В рамках настоящего документа — {settings.operator.name}{settings.operator.inn ? ` (ИНН ${settings.operator.inn}${settings.operator.ogrn ? `, ОГРН/ОГРНИП ${settings.operator.ogrn}` : ""})` : ""}.
                </li>
                <li>
                  <strong>Обработка персональных данных</strong> — любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными (сбор, запись, систематизация, накопление, хранение, уточнение, использование, передача, удаление, уничтожение).
                </li>
                <li>
                  <strong>Конфиденциальность персональных данных</strong> — обязательное для соблюдения Оператором требование не допускать их распространения без согласия субъекта персональных данных или наличия иного законного основания.
                </li>
                <li>
                  <strong>Пользователь</strong> — любой посетитель веб-сайта vershinaski.ru.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                3. Правовые основания обработки персональных данных
              </h2>
              <p>
                Правовыми основаниями обработки персональных данных Оператором являются:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Конституция Российской Федерации;</li>
                <li>Гражданский кодекс Российской Федерации;</li>
                <li>Федеральный закон от 27.07.2006 № 152-ФЗ «О персональных данных»;</li>
                <li>Согласие субъекта персональных данных на обработку его персональных данных, предоставляемое добровольно при заполнении веб-форм на сайте.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                4. Цели сбора и обработки персональных данных
              </h2>
              <p>Оператор обрабатывает персональные данные исключительно для следующих целей:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Обработка входящих обращений и заявок Пользователей на проведение пробных, групповых или индивидуальных тренировок по горнолыжному спорту;</li>
                <li>Предоставление консультаций по тарифам, расписанию занятий, местам проведения тренировок и спортивным сборам;</li>
                <li>Организация тренировочного процесса, спортивных сборов и мероприятий школы;</li>
                <li>Установление обратной связи, включая направление телефонных звонков, текстовых сообщений (в т.ч. через мессенджеры WhatsApp/Telegram) и электронных писем с подтверждением записи;</li>
                <li>Улучшение качества работы сайта и пользовательского опыта на основе обезличенной веб-аналитики.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                5. Объем и категории обрабатываемых персональных данных
              </h2>
              <p>5.1. Оператор обрабатывает следующие персональные данные Пользователей:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Имя (или фамилия, имя, отчество);</li>
                <li>Номер контактного телефона;</li>
                <li>Выбранный тариф или направление подготовки (при выборе в форме записи);</li>
                <li>Электронная почта (при коммуникации через email);</li>
                <li>Обезличенные данные о посещении сайта (включая файлы cookie, сведения об устройстве, IP-адрес, данные веб-аналитики Яндекс.Метрика).</li>
              </ul>
              <p>
                5.2. Оператор не осуществляет обработку биометрических персональных данных, а также специальных категорий персональных данных, касающихся расовой, национальной принадлежности, политических взглядов, религиозных или философских убеждений, состояния здоровья, интимной жизни.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                6. Порядок сбора, хранения и защиты персональных данных
              </h2>
              <p>
                6.1. Сбор персональных данных осуществляется исключительно с согласия субъекта персональных данных, выраженного путем активных действий (проставление отметки в чекбоксе согласия и нажатие кнопки отправки формы на сайте).
              </p>
              <p>
                6.2. В соответствии со ст. 18 ч. 5 Федерального закона № 152-ФЗ, сбор и хранение персональных данных граждан РФ осуществляется с использованием баз данных, находящихся на территории Российской Федерации.
              </p>
              <p>
                6.3. Оператор предпринимает необходимые правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа к ним, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий третьих лиц:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Использование защищенного SSL/TLS-соединения (шифрование трафика по протоколу HTTPS);</li>
                <li>Ограничение круга лиц, имеющих доступ к персональным данным;</li>
                <li>Использование межсетевых экранов и антивирусных систем защиты сервера;</li>
                <li>Регулярное резервное копирование и аудит безопасности.</li>
              </ul>
              <p>
                6.4. Оператор не продает, не передает и не распространяет персональные данные третьим лицам без согласия субъекта, за исключением случаев, прямо предусмотренных действующим законодательством РФ (по запросу правоохранительных или судебных органов в рамках установленной законом процедуры).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                7. Сроки обработки и хранения персональных данных
              </h2>
              <p>
                7.1. Обработка персональных данных осуществляется до достижения целей обработки, либо до момента отзыва согласия субъектом персональных данных, либо до ликвидации Оператора.
              </p>
              <p>
                7.2. В случае отзыва Пользователем согласия на обработку персональных данных Оператор обязуется прекратить их обработку и в срок, не превышающий 30 (тридцати) календарных дней, уничтожить персональные данные, если иное не предусмотрено законодательством РФ.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                8. Права субъекта персональных данных
              </h2>
              <p>Пользователь имеет право:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Получать информацию, касающуюся обработки его персональных данных;</li>
                <li>Требовать от Оператора уточнения его персональных данных, их блокирования или уничтожения в случае, если данные являются неполными, устаревшими, неточными или незаконно полученными;</li>
                <li>Отозвать свое согласие на обработку персональных данных в любое время;</li>
                <li>Обжаловать неправомерные действия или бездействие Оператора в уполномоченный орган по защите прав субъектов персональных данных (Роскомнадзор) или в судебном порядке.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                9. Использование файлов cookie и аналитических сервисов
              </h2>
              <p>
                9.1. На сайте могут использоваться файлы cookie (небольшие текстовые файлы, сохраняемые браузером) для улучшения удобства пользования сайтом и сбора статистики посещаемости.
              </p>
              <p>
                9.2. На сайте используется сервис веб-аналитики Яндекс.Метрика, предоставляемый компанией ООО «Яндекс». Информация о посещении сайта собирается в обезличенном виде и помогает совершенствовать структуру и функционал ресурса. Пользователь может отключить сохранение cookie в настройках своего браузера.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                10. Порядок отзыва согласия и контакты Оператора
              </h2>
              <p>
                10.1. Для отзыва согласия на обработку персональных данных или направления запроса относительно персональных данных Пользователь может направить письменное обращение на адрес электронной почты Оператора:{" "}
                <a href={`mailto:${settings.operator.email}`} className="text-primary hover:underline font-semibold">
                  {settings.operator.email}
                </a>{" "}
                с темой письма «Отзыв согласия на обработку персональных данных» либо обратиться по телефону:{" "}
                <a href={`tel:${settings.operator.phone.replace(/[^+\d]/g, "")}`} className="text-primary hover:underline font-semibold">
                  {settings.operator.phone}
                </a>.
              </p>
              <div className="bg-muted/50 border border-border rounded-xl p-5 mt-4 space-y-2">
                <p className="font-semibold text-foreground">Реквизиты и контакты Оператора:</p>
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
                <p>Местонахождение: {settings.operator.address}</p>
              </div>
            </section>

            {settings.privacyPolicy.customClauses && (
              <section className="space-y-3">
                <h2 className="text-lg md:text-xl font-bold text-foreground">
                  11. Особые положения и условия школы
                </h2>
                <div className="whitespace-pre-line leading-relaxed text-foreground/90 bg-muted/30 p-4 rounded-xl border border-border">
                  {settings.privacyPolicy.customClauses}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {settings.privacyPolicy.customClauses ? "12" : "11"}. Заключительные положения
              </h2>
              <p>
                {settings.privacyPolicy.customClauses ? "12.1" : "11.1"}. Настоящая Политика является открытым и общедоступным документом. Действующая редакция Политики постоянно доступна в сети Интернет по постоянному адресу:{" "}
                <a href="https://vershinaski.ru/privacy" className="text-primary hover:underline font-medium">
                  https://vershinaski.ru/privacy
                </a>.
              </p>
              <p>
                {settings.privacyPolicy.customClauses ? "12.2" : "11.2"}. Оператор имеет право вносить изменения в настоящую Политику в одностороннем порядке. Новая редакция Политики вступает в силу с момента ее размещения на сайте, если иное не предусмотрено новой редакцией Политики.
              </p>
            </section>
          </article>

          {/* Кнопка возврата внизу */}
          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <Link to="/">
              <Button variant="hero" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Вернуться на главную
              </Button>
            </Link>
            <Link to="/consent">
              <Button variant="outline">
                Текст согласия на обработку
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
