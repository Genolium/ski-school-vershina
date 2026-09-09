import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Eye,
  Info,
} from "lucide-react";
import {
  getLegalSettings,
  saveLegalSettings,
  resetLegalSettings,
  RKN_GOSUSLUGI_URL,
  RKN_NOTIFICATION_PORTAL_URL,
  RKN_REGISTRY_SEARCH_URL,
  type LegalSettings,
} from "@/lib/legalSettings";

export const AdminLegal: React.FC = () => {
  const [settings, setSettings] = useState<LegalSettings>(() => getLegalSettings());
  const [isSaved, setIsSaved] = useState(true);
  const [newPurpose, setNewPurpose] = useState("");
  const [newDataType, setNewDataType] = useState("");

  useEffect(() => {
    setSettings(getLegalSettings());
  }, []);

  const handleOperatorChange = (field: keyof LegalSettings["operator"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      operator: {
        ...prev.operator,
        [field]: value,
      },
    }));
    setIsSaved(false);
  };

  const handleRknChange = <K extends keyof LegalSettings["roskomnadzor"]>(
    field: K,
    value: LegalSettings["roskomnadzor"][K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      roskomnadzor: {
        ...prev.roskomnadzor,
        [field]: value,
      },
    }));
    setIsSaved(false);
  };

  const handlePrivacyChange = (field: keyof LegalSettings["privacyPolicy"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      privacyPolicy: {
        ...prev.privacyPolicy,
        [field]: value,
      },
    }));
    setIsSaved(false);
  };

  const handleConsentChange = (field: keyof LegalSettings["consent"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      consent: {
        ...prev.consent,
        [field]: value,
      },
    }));
    setIsSaved(false);
  };

  const handleAddPurpose = () => {
    const trimmed = newPurpose.trim();
    if (!trimmed) return;
    setSettings((prev) => ({
      ...prev,
      consent: {
        ...prev.consent,
        purposeList: [...prev.consent.purposeList, trimmed],
      },
    }));
    setNewPurpose("");
    setIsSaved(false);
  };

  const handleRemovePurpose = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      consent: {
        ...prev.consent,
        purposeList: prev.consent.purposeList.filter((_, i) => i !== index),
      },
    }));
    setIsSaved(false);
  };

  const handleAddDataType = () => {
    const trimmed = newDataType.trim();
    if (!trimmed) return;
    setSettings((prev) => ({
      ...prev,
      consent: {
        ...prev.consent,
        dataTypesList: [...prev.consent.dataTypesList, trimmed],
      },
    }));
    setNewDataType("");
    setIsSaved(false);
  };

  const handleRemoveDataType = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      consent: {
        ...prev.consent,
        dataTypesList: prev.consent.dataTypesList.filter((_, i) => i !== index),
      },
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    try {
      saveLegalSettings(settings);
      setIsSaved(true);
      toast.success("Настройки правовых документов 152-ФЗ успешно сохранены");
    } catch {
      toast.error("Не удалось сохранить настройки");
    }
  };

  const handleReset = () => {
    const defaults = resetLegalSettings();
    setSettings(defaults);
    setIsSaved(true);
    toast.success("Настройки сброшены к типовым значениям 152-ФЗ");
  };

  // Вычисление текущего статуса Роскомнадзора
  const renderRknStatusBadge = () => {
    if (settings.roskomnadzor.registered) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 px-3 py-1">
          <CheckCircle2 className="w-4 h-4" />
          В реестре операторов РКН {settings.roskomnadzor.regNumber ? `(№ ${settings.roskomnadzor.regNumber})` : ""}
        </Badge>
      );
    }
    if (settings.roskomnadzor.notificationSubmitted) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 flex items-center gap-1.5 px-3 py-1">
          <Clock className="w-4 h-4" />
          Уведомление подано {settings.roskomnadzor.submissionDate ? `(${settings.roskomnadzor.submissionDate})` : ""} — на рассмотрении
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1">
        <AlertTriangle className="w-4 h-4" />
        Требуется подача уведомления по ст. 22 152-ФЗ
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Шапка раздела */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Документы и соблюдение 152-ФЗ</h2>
            {renderRknStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Управление реквизитами оператора персональных данных, статусом в Роскомнадзоре, Политикой конфиденциальности и Согласием.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить к типовым 152-ФЗ</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Сбросить настройки к типовым 152-ФЗ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Все текущие реквизиты, статус Роскомнадзора, перечни целей и персональных данных будут возвращены к стандартным шаблонам школы «Вершина». Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Да, сбросить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleSave}
            size="sm"
            className={`gap-1.5 text-xs font-semibold ${
              !isSaved ? "bg-primary text-primary-foreground shadow-md animate-pulse" : ""
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? "Сохранено" : "Сохранить изменения"}</span>
          </Button>
        </div>
      </div>

      {/* Основные вкладки управления */}
      <Tabs defaultValue="operator" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="operator" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <Building2 className="w-4 h-4" />
            <span>1. Реквизиты оператора</span>
          </TabsTrigger>
          <TabsTrigger value="roskomnadzor" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>2. Роскомнадзор (РКН)</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Политика ПДн</span>
          </TabsTrigger>
          <TabsTrigger value="consent" className="flex items-center gap-1.5 py-2 text-xs sm:text-sm">
            <FileText className="w-4 h-4" />
            <span>4. Текст Согласия</span>
          </TabsTrigger>
        </TabsList>

        {/* Раздел 1: Реквизиты оператора */}
        <TabsContent value="operator" className="space-y-4 focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Реквизиты оператора персональных данных
              </CardTitle>
              <CardDescription>
                Укажите официальные реквизиты организации или индивидуального предпринимателя. Эти данные автоматически публикуются в Политике конфиденциальности, Согласии на обработку ПДн и подвале сайта.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="op-name" className="text-xs font-semibold uppercase text-muted-foreground">
                    Наименование оператора (организация / ИП / проект)
                  </Label>
                  <Input
                    id="op-name"
                    value={settings.operator.name}
                    onChange={(e) => handleOperatorChange("name", e.target.value)}
                    placeholder="Школа горнолыжного спорта «Вершина»"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="op-inn" className="text-xs font-semibold uppercase text-muted-foreground">
                    ИНН оператора
                  </Label>
                  <Input
                    id="op-inn"
                    value={settings.operator.inn}
                    onChange={(e) => handleOperatorChange("inn", e.target.value)}
                    placeholder="Например: 780123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="op-ogrn" className="text-xs font-semibold uppercase text-muted-foreground">
                    ОГРН / ОГРНИП
                  </Label>
                  <Input
                    id="op-ogrn"
                    value={settings.operator.ogrn}
                    onChange={(e) => handleOperatorChange("ogrn", e.target.value)}
                    placeholder="Например: 320784700000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="op-email" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email для обращений и отзыва согласий
                  </Label>
                  <Input
                    id="op-email"
                    type="email"
                    value={settings.operator.email}
                    onChange={(e) => handleOperatorChange("email", e.target.value)}
                    placeholder="scool-vershina@mail.ru"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="op-phone" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Контактный телефон оператора
                  </Label>
                  <Input
                    id="op-phone"
                    value={settings.operator.phone}
                    onChange={(e) => handleOperatorChange("phone", e.target.value)}
                    placeholder="+7 (981) 742-86-85"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="op-address" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Местонахождение / Адрес оператора
                  </Label>
                  <Input
                    id="op-address"
                    value={settings.operator.address}
                    onChange={(e) => handleOperatorChange("address", e.target.value)}
                    placeholder="г. Санкт-Петербург и Ленинградская область"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Раздел 2: Роскомнадзор */}
        <TabsContent value="roskomnadzor" className="space-y-4 focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Уведомление в Роскомнадзор (Реестр операторов ПДн)
              </CardTitle>
              <CardDescription>
                Контроль выполнения обязанности по уведомлению уполномоченного органа (Роскомнадзор) в соответствии со ст. 22 Федерального закона № 152-ФЗ.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Информационная плашка с разъяснением 152-ФЗ */}
              <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 p-4 text-sm text-foreground/90 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Требования статьи 22 Федерального закона № 152-ФЗ</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  До начала обработки персональных данных оператор <strong>обязан уведомить уполномоченный орган по защите прав субъектов персональных данных (Роскомнадзор)</strong> о своем намерении осуществлять обработку персональных данных.
                </p>
                <p className="text-xs text-muted-foreground">
                  С 1 сентября 2022 года (поправки по 266-ФЗ) практически все прежние исключения отменены: обработка данных клиентов сайта, оформление заявок на тренировки и запись по телефону требуют включения в официальный Реестр операторов.
                </p>
              </div>

              {/* Кнопки перехода на официальные формы подачи */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Быстрый переход к официальным порталам подачи уведомления:
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={RKN_GOSUSLUGI_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-between text-xs h-auto py-2.5 border-primary/30 hover:bg-primary/10">
                      <div className="text-left">
                        <div className="font-semibold text-primary">Подать через Госуслуги</div>
                        <div className="text-[11px] text-muted-foreground">Быстро с УКЭП или ЕСИА</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-primary shrink-0 ml-2" />
                    </Button>
                  </a>

                  <a
                    href={RKN_NOTIFICATION_PORTAL_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-between text-xs h-auto py-2.5 border-amber-500/30 hover:bg-amber-500/10">
                      <div className="text-left">
                        <div className="font-semibold text-amber-700 dark:text-amber-400">Портал РКН (pd.rkn.gov.ru)</div>
                        <div className="text-[11px] text-muted-foreground">Электронная форма уведомления</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-amber-600 shrink-0 ml-2" />
                    </Button>
                  </a>

                  <a
                    href={RKN_REGISTRY_SEARCH_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full justify-between text-xs h-auto py-2.5 hover:bg-muted">
                      <div className="text-left">
                        <div className="font-semibold">Проверить в Реестре РКН</div>
                        <div className="text-[11px] text-muted-foreground">Поиск по ИНН / названию</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Форма статуса и регистрации */}
              <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Фиксация статуса в системе школы
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Чекбокс уведомления */}
                  <div className="flex items-start space-x-3 p-3 bg-card rounded-lg border border-border">
                    <Switch
                      id="rkn-submitted"
                      checked={settings.roskomnadzor.notificationSubmitted}
                      onCheckedChange={(checked) => handleRknChange("notificationSubmitted", checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="rkn-submitted" className="font-medium cursor-pointer text-sm">
                        Уведомление направлено в Роскомнадзор
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Отметьте после отправки заявления через Госуслуги или портал РКН
                      </p>
                    </div>
                  </div>

                  {/* Дата направления */}
                  <div className="space-y-2">
                    <Label htmlFor="rkn-sub-date" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Дата направления уведомления
                    </Label>
                    <Input
                      id="rkn-sub-date"
                      type="date"
                      value={settings.roskomnadzor.submissionDate}
                      onChange={(e) => handleRknChange("submissionDate", e.target.value)}
                    />
                  </div>

                  {/* Чекбокс внесения в реестр */}
                  <div className="flex items-start space-x-3 p-3 bg-card rounded-lg border border-border">
                    <Switch
                      id="rkn-registered"
                      checked={settings.roskomnadzor.registered}
                      onCheckedChange={(checked) => handleRknChange("registered", checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="rkn-registered" className="font-medium cursor-pointer text-sm">
                        Оператор внесен в Реестр операторов ПДн
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Присвоен официальный регистрационный номер оператора в РКН
                      </p>
                    </div>
                  </div>

                  {/* Номер и дата внесения в реестр */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="rkn-number" className="text-xs font-semibold uppercase text-muted-foreground">
                        Рег. номер в реестре
                      </Label>
                      <Input
                        id="rkn-number"
                        value={settings.roskomnadzor.regNumber}
                        onChange={(e) => handleRknChange("regNumber", e.target.value)}
                        placeholder="78-25-012345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rkn-reg-date" className="text-xs font-semibold uppercase text-muted-foreground">
                        Дата внесения
                      </Label>
                      <Input
                        id="rkn-reg-date"
                        type="date"
                        value={settings.roskomnadzor.registrationDate}
                        onChange={(e) => handleRknChange("registrationDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Раздел 3: Политика конфиденциальности */}
        <TabsContent value="privacy" className="space-y-4 focus-visible:outline-none">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Политика в отношении обработки персональных данных
                </CardTitle>
                <CardDescription>
                  Настройки общедоступного документа в соответствии со ст. 18.1 152-ФЗ. Текст документа опубликован на странице /privacy.
                </CardDescription>
              </div>
              <a href="/privacy" target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary hover:text-primary">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Смотреть страницу</span>
                </Button>
              </a>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="priv-title" className="text-xs font-semibold uppercase text-muted-foreground">
                    Заголовок документа
                  </Label>
                  <Input
                    id="priv-title"
                    value={settings.privacyPolicy.title}
                    onChange={(e) => handlePrivacyChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priv-effective" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Дата вступления в силу (редакция)
                  </Label>
                  <Input
                    id="priv-effective"
                    value={settings.privacyPolicy.effectiveDate}
                    onChange={(e) => handlePrivacyChange("effectiveDate", e.target.value)}
                    placeholder="1 января 2025 г."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priv-updated" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Дата последнего обновления
                  </Label>
                  <Input
                    id="priv-updated"
                    value={settings.privacyPolicy.lastUpdated}
                    onChange={(e) => handlePrivacyChange("lastUpdated", e.target.value)}
                    placeholder="9 сентября 2026 г."
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="priv-intro" className="text-xs font-semibold uppercase text-muted-foreground">
                  Дополнительное вступительное положение (опционально)
                </Label>
                <Textarea
                  id="priv-intro"
                  rows={3}
                  value={settings.privacyPolicy.customIntro || ""}
                  onChange={(e) => handlePrivacyChange("customIntro", e.target.value)}
                  placeholder="Дополнительные комментарии или вводные положения, которые будут отображаться перед общими положениями Политики..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priv-clauses" className="text-xs font-semibold uppercase text-muted-foreground">
                  Дополнительные условия / особенности обработки (опционально)
                </Label>
                <Textarea
                  id="priv-clauses"
                  rows={4}
                  value={settings.privacyPolicy.customClauses || ""}
                  onChange={(e) => handlePrivacyChange("customClauses", e.target.value)}
                  placeholder="Любые особые условия взаимодействия с клиентами школы, регламент работы с видеосъемкой тренировок и т.д..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Раздел 4: Согласие на обработку персональных данных */}
        <TabsContent value="consent" className="space-y-4 focus-visible:outline-none">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Согласие на обработку персональных данных
                </CardTitle>
                <CardDescription>
                  Настройки условий согласия, с которым пользователь знакомится при отправке заявок через сайт vershinaski.ru. Текст опубликован на странице /consent.
                </CardDescription>
              </div>
              <a href="/consent" target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary hover:text-primary">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Смотреть страницу</span>
                </Button>
              </a>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cons-title" className="text-xs font-semibold uppercase text-muted-foreground">
                    Заголовок согласия
                  </Label>
                  <Input
                    id="cons-title"
                    value={settings.consent.title}
                    onChange={(e) => handleConsentChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cons-effective" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Дата редакции
                  </Label>
                  <Input
                    id="cons-effective"
                    value={settings.consent.effectiveDate}
                    onChange={(e) => handleConsentChange("effectiveDate", e.target.value)}
                    placeholder="1 января 2025 г."
                  />
                </div>
              </div>

              {/* Перечень собираемых данных */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">
                    Категории собираемых персональных данных (ст. 9 152-ФЗ)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Всего пунктов: {settings.consent.dataTypesList.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {settings.consent.dataTypesList.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 ml-1" />
                      <span className="text-sm flex-1">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRemoveDataType(index)}
                        title="Удалить категорию"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Добавить новую категорию данных (например: Возраст участника)"
                    value={newDataType}
                    onChange={(e) => setNewDataType(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDataType();
                      }
                    }}
                    className="text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddDataType} className="gap-1.5 shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить</span>
                  </Button>
                </div>
              </div>

              {/* Цели обработки */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">
                    Цели обработки персональных данных (ст. 5 152-ФЗ)
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Всего целей: {settings.consent.purposeList.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {settings.consent.purposeList.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 ml-1" />
                      <span className="text-sm flex-1">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleRemovePurpose(index)}
                        title="Удалить цель"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Добавить новую конкретную цель обработки..."
                    value={newPurpose}
                    onChange={(e) => setNewPurpose(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPurpose();
                      }
                    }}
                    className="text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddPurpose} className="gap-1.5 shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить</span>
                  </Button>
                </div>
              </div>

              {/* Дополнительные условия согласия */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Label htmlFor="cons-terms" className="text-xs font-semibold uppercase text-muted-foreground">
                  Дополнительные условия отзыва или взаимодействия (опционально)
                </Label>
                <Textarea
                  id="cons-terms"
                  rows={3}
                  value={settings.consent.customTerms || ""}
                  onChange={(e) => handleConsentChange("customTerms", e.target.value)}
                  placeholder="Дополнительные условия согласия, специальные оговорки по мессенджерам или хранению..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLegal;
