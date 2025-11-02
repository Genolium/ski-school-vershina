import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import { createApplication, getTariffs, type Tariff } from "@/lib/api";
import { reachGoal } from "@/lib/metrika";
import { logError } from "@/lib/errorHandler";
import { cn } from "@/lib/utils";

const ContactForm = () => {
  const { toast } = useToast();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    tariff: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    tariff: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    tariff: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTariffs()
      .then(data => {
        const activeTariffs = data.filter(t => t.is_active);
        if (activeTariffs.length > 0) {
          setTariffs(activeTariffs);
        } else {
          // Fallback тарифы если API не вернул данные
          setTariffs([
            {
              id: 1,
              title: "Active",
              description: "Для семейного отдыха и поддержания формы",
              features: JSON.stringify(["1 тренировка в неделю", "Акцент на удовольствие от катания", "Повышение физической формы"]),
              price: "6000 р/мес.",
              is_active: true,
              order: 0
            },
            {
              id: 2,
              title: "Standard",
              description: "Для детей, которые хотят кататься уверенно и участвовать в соревнованиях",
              features: JSON.stringify(["3 тренировки в неделю", "Комплексная программа тренировок", "Участие в региональных соревнованиях"]),
              price: "10000 р/мес.",
              is_active: true,
              order: 1
            },
            {
              id: 3,
              title: "Pro",
              description: "Для высшего спортивного мастерства",
              features: JSON.stringify(["4-5 тренировок в неделю", "Индивидуальный план развития", "Участие во всероссийских соревнованиях", "Выполнение спортивных разрядов", "Медицинский мониторинг"]),
              price: "14000 р/мес.",
              is_active: true,
              order: 2
            },
            {
              id: 4,
              title: "Individual",
              description: "Для тех, кто ценит индивидуальность",
              features: JSON.stringify(["Тет-а-тет с тренером", "Коррекция ошибок", "Гибкий график", "Ускоренное обучение"]),
              price: "2500 р/час",
              is_active: true,
              order: 3
            }
          ]);
        }
      })
      .catch((error) => {
        logError(error, 'ContactForm component');
        // Fallback тарифы при ошибке
        setTariffs([
          {
            id: 1,
            title: "Active",
            description: "Для семейного отдыха и поддержания формы",
            features: JSON.stringify(["1 тренировка в неделю", "Акцент на удовольствие от катания", "Повышение физической формы"]),
            price: "6000 р/мес.",
            is_active: true,
            order: 0
          },
          {
            id: 2,
            title: "Standard",
            description: "Для детей, которые хотят кататься уверенно и участвовать в соревнованиях",
            features: JSON.stringify(["3 тренировки в неделю", "Комплексная программа тренировок", "Участие в региональных соревнованиях"]),
            price: "10000 р/мес.",
            is_active: true,
            order: 1
          },
          {
            id: 3,
            title: "Pro",
            description: "Для высшего спортивного мастерства",
            features: JSON.stringify(["4-5 тренировок в неделю", "Индивидуальный план развития", "Участие во всероссийских соревнованиях", "Выполнение спортивных разрядов", "Медицинский мониторинг"]),
            price: "14000 р/мес.",
            is_active: true,
            order: 2
          },
          {
            id: 4,
            title: "Individual",
            description: "Для тех, кто ценит индивидуальность",
            features: JSON.stringify(["Тет-а-тет с тренером", "Коррекция ошибок", "Гибкий график", "Ускоренное обучение"]),
            price: "2500 р/час",
            is_active: true,
            order: 3
          }
        ]);
      });
  }, []);

  // Валидация имени
  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "Имя обязательно для заполнения";
    }
    if (name.trim().length < 2) {
      return "Имя должно содержать минимум 2 символа";
    }
    if (name.trim().length > 50) {
      return "Имя не должно превышать 50 символов";
    }
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(name.trim())) {
      return "Имя может содержать только буквы, пробелы и дефисы";
    }
    return "";
  };

  // Валидация телефона
  const validatePhone = (phone: string): string => {
    if (!phone.trim()) {
      return "Телефон обязателен для заполнения";
    }
    // Удаляем все нецифровые символы кроме + для проверки
    const digitsOnly = phone.replace(/[^\d+]/g, '');
    if (!digitsOnly.startsWith('+7') && !digitsOnly.startsWith('+')) {
      return "Введите корректный номер телефона";
    }
    // Проверяем длину (минимум +7 и 10 цифр)
    const phoneDigits = digitsOnly.replace(/\+/g, '');
    if (phoneDigits.length < 11) {
      return "Номер телефона должен содержать 11 цифр";
    }
    return "";
  };

  // Валидация тарифа
  const validateTariff = (tariff: string): string => {
    if (!tariff) {
      return "Выберите тариф";
    }
    return "";
  };

  // Форматирование телефона
  const formatPhone = (value: string): string => {
    const digitsOnly = value.replace(/[^\d+]/g, '');
    
    if (!digitsOnly || digitsOnly === '+') {
      return '';
    }
    
    if (digitsOnly.startsWith('+7')) {
      const rest = digitsOnly.slice(2);
      if (rest.length === 0) return '+7';
      if (rest.length <= 3) return `+7 (${rest}`;
      if (rest.length <= 6) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
      if (rest.length <= 8) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
      return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
    }
    
    if (digitsOnly.startsWith('7')) {
      const rest = digitsOnly.slice(1);
      if (rest.length === 0) return '+7';
      if (rest.length <= 3) return `+7 (${rest}`;
      if (rest.length <= 6) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
      if (rest.length <= 8) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
      return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
    }
    
    if (digitsOnly.startsWith('8')) {
      const rest = digitsOnly.slice(1);
      if (rest.length === 0) return '+7';
      if (rest.length <= 3) return `+7 (${rest}`;
      if (rest.length <= 6) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
      if (rest.length <= 8) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
      return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
    }
    
    if (/^\d/.test(digitsOnly)) {
      const rest = digitsOnly;
      if (rest.length <= 3) return `+7 (${rest}`;
      if (rest.length <= 6) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
      if (rest.length <= 8) return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
      return `+7 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
    }
    
    return value;
  };

  // Обработчик изменения имени
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
    if (touched.name) {
      setErrors({ ...errors, name: validateName(value) });
    }
  };

  // Обработчик изменения телефона с форматированием
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhone(value);
    setFormData({ ...formData, phone: formatted });
    if (touched.phone) {
      setErrors({ ...errors, phone: validatePhone(formatted) });
    }
  };

  // Обработчик фокуса на поле телефона
  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formData.phone === '') {
      setFormData({ ...formData, phone: '+7' });
      setTimeout(() => {
        e.target.setSelectionRange(2, 2);
      }, 0);
    }
  };

  // Обработчик изменения тарифа
  const handleTariffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, tariff: value });
    if (touched.tariff) {
      setErrors({ ...errors, tariff: validateTariff(value) });
    }
  };

  // Обработчик blur для валидации
  const handleBlur = (field: 'name' | 'phone' | 'tariff') => {
    setTouched({ ...touched, [field]: true });
    if (field === 'name') {
      setErrors({ ...errors, name: validateName(formData.name) });
    } else if (field === 'phone') {
      setErrors({ ...errors, phone: validatePhone(formData.phone) });
    } else if (field === 'tariff') {
      setErrors({ ...errors, tariff: validateTariff(formData.tariff) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация всех полей перед отправкой
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    const tariffError = validateTariff(formData.tariff);
    
    setErrors({
      name: nameError,
      phone: phoneError,
      tariff: tariffError,
    });
    
    setTouched({
      name: true,
      phone: true,
      tariff: true,
    });
    
    if (nameError || phoneError || tariffError) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, исправьте ошибки в форме",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await createApplication(formData);
      
      // Отправка цели в Яндекс.Метрику
      const metrikaId = import.meta.env.VITE_YANDEX_METRIKA_ID || '105075135';
      if (metrikaId && window.ym) {
        reachGoal(metrikaId, 'submit_application');
      }
      
      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в ближайшее время.",
      });
      
      // Обновление aria-live региона для скринридеров
      const liveRegion = document.getElementById('aria-live-region');
      if (liveRegion) {
        liveRegion.textContent = 'Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.';
      }
      
      setFormData({ name: "", phone: "", tariff: "" });
      setErrors({ name: "", phone: "", tariff: "" });
      setTouched({ name: false, phone: false, tariff: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте позже.";
      
      // Логирование ошибки
      if (import.meta.env.DEV) {
        console.error('Failed to create application:', error);
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Проверка валидности полей
  const isNameValid = touched.name && !errors.name && formData.name.trim().length >= 2;
  const isPhoneValid = touched.phone && !errors.phone && formData.phone.length >= 11;
  const isTariffValid = touched.tariff && !errors.tariff && formData.tariff !== "";

  return (
    <section id="contact-form" className="py-12 md:py-20 bg-background relative overflow-hidden">
      {/* Subtle Geometric Patterns */}
      <GeometricPatterns type="x-grid" color="muted" size="sm" opacity={15} className="top-8 left-4 md:top-12 md:left-8" />
      <GeometricPatterns type="chevrons-right" color="muted" size="sm" opacity={15} className="top-8 right-4 md:top-12 md:right-8" />
      <GeometricPatterns type="triangle" color="primary" size="sm" opacity={20} className="bottom-8 left-8 md:bottom-12 md:left-12 rotate-45" />
      <GeometricPatterns type="chevrons-left" color="muted" size="sm" opacity={15} className="bottom-8 right-4 md:bottom-12 md:right-8" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
                Записаться на <span className="text-primary">пробное занятие</span>
              </h2>
              <p className="text-base md:text-xl text-muted-foreground px-4">
                Оставьте заявку, и мы перезвоним в течение 30 минут
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            {/* Form */}
            <ScrollReveal delay={100} className="h-full">
              <div className="bg-card border-2 border-border rounded-xl md:rounded-2xl p-6 md:p-8 h-full flex flex-col">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                  <div className="space-y-5 md:space-y-6 flex-1">
                  <div>
                    <Label htmlFor="name" className="text-sm md:text-base mb-1.5 md:mb-2 block">
                      Имя
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        onBlur={() => handleBlur('name')}
                        placeholder="Введите ваше имя"
                        required
                        className={cn(
                          "h-11 md:h-12 text-sm md:text-base pr-10",
                          touched.name && errors.name && "border-destructive focus-visible:ring-destructive",
                          isNameValid && "border-green-500 focus-visible:ring-green-500"
                        )}
                      />
                      {isNameValid && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                      {touched.name && errors.name && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                      )}
                    </div>
                    {touched.name && errors.name && (
                      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm md:text-base mb-1.5 md:mb-2 block">
                      Телефон
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        onFocus={handlePhoneFocus}
                        onBlur={() => handleBlur('phone')}
                        placeholder="+7 (___) ___-__-__"
                        required
                        className={cn(
                          "h-11 md:h-12 text-sm md:text-base pr-10",
                          touched.phone && errors.phone && "border-destructive focus-visible:ring-destructive",
                          isPhoneValid && "border-green-500 focus-visible:ring-green-500"
                        )}
                      />
                      {isPhoneValid && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                      {touched.phone && errors.phone && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                      )}
                    </div>
                    {touched.phone && errors.phone && (
                      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tariff" className="text-sm md:text-base mb-1.5 md:mb-2 block">
                      Выберите тариф
                    </Label>
                    <div className="relative">
                      <select
                        id="tariff"
                        value={formData.tariff}
                        onChange={handleTariffChange}
                        onBlur={() => handleBlur('tariff')}
                        required
                        className={cn(
                          "w-full h-11 md:h-12 px-3 rounded-md border bg-background text-sm md:text-base pr-10",
                          touched.tariff && errors.tariff && "border-destructive focus-visible:ring-destructive",
                          isTariffValid && "border-green-500 focus-visible:ring-green-500"
                        )}
                      >
                        <option value="">Выберите тариф</option>
                        {tariffs.length > 0 ? (
                          tariffs.map((tariff) => (
                            <option key={tariff.id} value={tariff.title}>
                              {tariff.title} - {tariff.price}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Active">Active - 6000 р/мес.</option>
                            <option value="Standard">Standard - 10000 р/мес.</option>
                            <option value="Pro">Pro - 14000 р/мес.</option>
                            <option value="Individual">Individual - 2500 р/час</option>
                          </>
                        )}
                      </select>
                      {isTariffValid && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 pointer-events-none" />
                      )}
                      {touched.tariff && errors.tariff && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive pointer-events-none" />
                      )}
                    </div>
                    {touched.tariff && errors.tariff && (
                      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.tariff}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-5 md:pt-6">
                  <Button type="submit" variant="hero" size="lg" className="w-full text-sm md:text-base h-12 md:h-14 touch-manipulation" disabled={submitting}>
                    {submitting ? "Отправка..." : "Записаться на пробное занятие"}
                  </Button>

                  <p className="text-[10px] md:text-xs text-muted-foreground text-center leading-tight mt-3 px-2">
                    Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                  </p>
                </div>
              </form>
            </div>
            </ScrollReveal>

            {/* Contact Info */}
            <ScrollReveal delay={200} className="h-full">
              <div className="space-y-5 md:space-y-6 h-full flex flex-col">
              <div className="bg-gradient-hero text-ski-white rounded-xl md:rounded-2xl p-6 md:p-8 flex-1">
                <h3 className="text-xl md:text-2xl font-bold mb-5 md:mb-6">Контакты</h3>
                
                <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                  <a href="tel:+79817428685" className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity" aria-label="Позвонить по телефону +7 (981) 742-86-85">
                    <div className="bg-ski-white/20 rounded-lg p-2.5 md:p-3 flex-shrink-0">
                      <Phone className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-ski-white/80">Телефон</p>
                      <p className="text-base md:text-lg font-semibold">+7 (981) 742-86-85</p>
                    </div>
                  </a>

                  <a href="mailto:scool-vershina@mail.ru" className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity" aria-label="Написать на email scool-vershina@mail.ru">
                    <div className="bg-ski-white/20 rounded-lg p-2.5 md:p-3 flex-shrink-0">
                      <Mail className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-ski-white/80">Email</p>
                      <p className="text-base md:text-lg font-semibold">scool-vershina@mail.ru</p>
                    </div>
                  </a>

                  <a href="https://wa.me/79817428685" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity" aria-label="Написать в WhatsApp +7(981) 742-86-85">
                    <div className="bg-ski-white/20 rounded-lg p-2.5 md:p-3 flex-shrink-0">
                      <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-ski-white/80">WhatsApp</p>
                      <p className="text-base md:text-lg font-semibold">+7(981) 742-86-85</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-secondary text-secondary-foreground rounded-xl md:rounded-2xl p-6 md:p-8">
                <h4 className="font-bold text-base md:text-lg mb-2 md:mb-3">Следите за нами</h4>
                <p className="text-secondary-foreground/80 mb-3 md:mb-4 text-sm md:text-base">
                  Новости, фото с тренировок и соревнований в нашей группе ВКонтакте
                </p>
                <a 
                  href="https://vk.com/vershinaski" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full text-sm md:text-base h-10 md:h-11 border-foreground text-foreground hover:bg-accent hover:text-accent-foreground">
                    Перейти в группу VK
                  </Button>
                </a>
              </div>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
