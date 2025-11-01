import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GeometricPatterns from "./GeometricPatterns";
import ScrollReveal from "./ScrollReveal";
import { createApplication } from "@/lib/api";

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Обработчик изменения телефона с автоматической подстановкой "+7"
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Удаляем все нецифровые символы кроме "+"
    const digitsOnly = value.replace(/[^\d+]/g, '');
    
    // Если поле пустое или пользователь удалил все - оставляем пустым
    if (digitsOnly === '' || digitsOnly === '+') {
      setFormData({ ...formData, phone: '' });
      return;
    }
    
    // Если начинается с "+7" - оставляем как есть
    if (digitsOnly.startsWith('+7')) {
      setFormData({ ...formData, phone: digitsOnly });
      return;
    }
    
    // Если начинается с "7" или "8" (российские форматы) - заменяем на "+7"
    if (digitsOnly.startsWith('7')) {
      setFormData({ ...formData, phone: '+7' + digitsOnly.slice(1) });
      return;
    }
    
    if (digitsOnly.startsWith('8')) {
      setFormData({ ...formData, phone: '+7' + digitsOnly.slice(1) });
      return;
    }
    
    // Если начинается с "+" но не "+7" - оставляем как есть (международный формат)
    if (digitsOnly.startsWith('+')) {
      setFormData({ ...formData, phone: digitsOnly });
      return;
    }
    
    // Если пользователь начинает вводить просто цифры - добавляем "+7"
    if (/^\d/.test(digitsOnly)) {
      setFormData({ ...formData, phone: '+7' + digitsOnly });
      return;
    }
    
    // В остальных случаях просто обновляем значение
    setFormData({ ...formData, phone: value });
  };

  // Обработчик фокуса на поле телефона - добавляет "+7" если поле пустое
  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formData.phone === '') {
      setFormData({ ...formData, phone: '+7' });
      // Установка курсора после "+7"
      setTimeout(() => {
        e.target.setSelectionRange(2, 2);
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await createApplication(formData);
      toast({
        title: "Заявка отправлена!",
        description: "Мы свяжемся с вами в ближайшее время.",
      });
      setFormData({ name: "", phone: "", age: "" });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error?.message || "Не удалось отправить заявку. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 md:items-stretch">
            {/* Form */}
            <ScrollReveal delay={100}>
            <div className="bg-card border-2 border-border rounded-xl md:rounded-2xl p-6 md:p-8 h-full flex flex-col">
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-5 md:space-y-6 flex-1">
                  <div>
                    <Label htmlFor="name" className="text-sm md:text-base mb-1.5 md:mb-2 block">
                      Имя родителя
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Введите ваше имя"
                      required
                      className="h-11 md:h-12 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm md:text-base mb-1.5 md:mb-2 block">
                      Телефон
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onFocus={handlePhoneFocus}
                      placeholder="+7 (___) ___-__-__"
                      required
                      className="h-11 md:h-12 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age" className="text-sm md:text-base mb-1.5 md:mb-2 block">
                      Возраст ребенка
                    </Label>
                    <select
                      id="age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                      className="w-full h-11 md:h-12 px-3 rounded-md border border-input bg-background text-sm md:text-base"
                    >
                      <option value="">Выберите возраст</option>
                      <option value="4-6">4-6 лет</option>
                      <option value="7-9">7-9 лет</option>
                      <option value="10-12">10-12 лет</option>
                      <option value="13+">13+ лет</option>
                    </select>
                  </div>
                </div>

                <div className="mt-auto pt-5 md:pt-6">
                  <Button type="submit" variant="hero" size="lg" className="w-full text-sm md:text-base h-11 md:h-12" disabled={submitting}>
                    {submitting ? "Отправка..." : "Записаться на пробное занятие"}
                  </Button>

                  <p className="text-[10px] md:text-xs text-muted-foreground text-center leading-tight mt-3">
                    Нажимая кнопку, вы соглашаетесь с политикой обработки персональных данных
                  </p>
                </div>
              </form>
            </div>
            </ScrollReveal>

            {/* Contact Info */}
            <ScrollReveal delay={200}>
            <div className="space-y-5 md:space-y-6">
              <div className="bg-gradient-hero text-ski-white rounded-xl md:rounded-2xl p-6 md:p-8">
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
