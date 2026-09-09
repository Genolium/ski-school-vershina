import { useState, useEffect } from "react";

export interface OperatorSettings {
  name: string;
  inn: string;
  ogrn: string;
  email: string;
  phone: string;
  address: string;
}

export interface RoskomnadzorSettings {
  registered: boolean;
  regNumber: string;
  registrationDate: string;
  notificationSubmitted: boolean;
  submissionDate: string;
  portalUrl: string;
}

export interface PrivacyPolicySettings {
  effectiveDate: string;
  lastUpdated: string;
  title: string;
  customIntro?: string;
  customClauses?: string;
}

export interface ConsentSettings {
  effectiveDate: string;
  title: string;
  purposeList: string[];
  dataTypesList: string[];
  customTerms?: string;
}

export interface LegalSettings {
  operator: OperatorSettings;
  roskomnadzor: RoskomnadzorSettings;
  privacyPolicy: PrivacyPolicySettings;
  consent: ConsentSettings;
}

export const LEGAL_SETTINGS_STORAGE_KEY = "vershina_legal_settings";
export const LEGAL_SETTINGS_CHANGE_EVENT = "vershina_legal_settings_updated";

export const RKN_NOTIFICATION_PORTAL_URL = "https://pd.rkn.gov.ru/operators-registry/notification/form/";
export const RKN_GOSUSLUGI_URL = "https://www.gosuslugi.ru/600375/1/form";
export const RKN_REGISTRY_SEARCH_URL = "https://pd.rkn.gov.ru/operators-registry/operators-list/";

export const DEFAULT_LEGAL_SETTINGS: LegalSettings = {
  operator: {
    name: "Школа горнолыжного спорта «Вершина»",
    inn: "",
    ogrn: "",
    email: "scool-vershina@mail.ru",
    phone: "+7 (981) 742-86-85",
    address: "г. Санкт-Петербург и Ленинградская область",
  },
  roskomnadzor: {
    registered: false,
    regNumber: "",
    registrationDate: "",
    notificationSubmitted: false,
    submissionDate: "",
    portalUrl: RKN_NOTIFICATION_PORTAL_URL,
  },
  privacyPolicy: {
    effectiveDate: "1 января 2025 г.",
    lastUpdated: "9 сентября 2026 г.",
    title: "Политика в отношении обработки персональных данных",
    customIntro: "",
    customClauses: "",
  },
  consent: {
    effectiveDate: "1 января 2025 г.",
    title: "Согласие на обработку персональных данных",
    purposeList: [
      "Обработка входящих обращений и заявок Пользователей на проведение пробных, групповых или индивидуальных тренировок по горнолыжному спорту",
      "Предоставление консультаций по тарифам, расписанию занятий, местам проведения тренировок и спортивным сборам",
      "Организация тренировочного процесса, спортивных сборов и мероприятий школы",
      "Установление обратной связи, включая направление телефонных звонков, текстовых сообщений (в т.ч. через мессенджеры WhatsApp/Telegram) и электронных писем с подтверждением записи",
      "Заключение и исполнение договора на оказание физкультурно-спортивных и тренировочных услуг",
      "Сбор аналитики посещаемости для улучшения качества работы веб-сайта",
    ],
    dataTypesList: [
      "Фамилия, имя, отчество (или имя)",
      "Номер контактного телефона",
      "Выбранный тариф, уровень подготовки или предпочтительное направление тренировок",
      "Адрес электронной почты (при коммуникации через email)",
      "Обезличенные технические данные (включая файлы cookie, IP-адрес, данные веб-аналитики Яндекс.Метрика)",
    ],
    customTerms: "",
  },
};

/**
 * Глубокое слияние сохраненных настроек с дефолтными для обеспечения обратной совместимости
 */
function mergeWithDefaults(partial: Partial<LegalSettings> | null | undefined): LegalSettings {
  if (!partial || typeof partial !== "object") {
    return JSON.parse(JSON.stringify(DEFAULT_LEGAL_SETTINGS));
  }

  return {
    operator: {
      name: partial.operator?.name ?? DEFAULT_LEGAL_SETTINGS.operator.name,
      inn: partial.operator?.inn ?? DEFAULT_LEGAL_SETTINGS.operator.inn,
      ogrn: partial.operator?.ogrn ?? DEFAULT_LEGAL_SETTINGS.operator.ogrn,
      email: partial.operator?.email ?? DEFAULT_LEGAL_SETTINGS.operator.email,
      phone: partial.operator?.phone ?? DEFAULT_LEGAL_SETTINGS.operator.phone,
      address: partial.operator?.address ?? DEFAULT_LEGAL_SETTINGS.operator.address,
    },
    roskomnadzor: {
      registered: Boolean(partial.roskomnadzor?.registered ?? DEFAULT_LEGAL_SETTINGS.roskomnadzor.registered),
      regNumber: partial.roskomnadzor?.regNumber ?? DEFAULT_LEGAL_SETTINGS.roskomnadzor.regNumber,
      registrationDate: partial.roskomnadzor?.registrationDate ?? DEFAULT_LEGAL_SETTINGS.roskomnadzor.registrationDate,
      notificationSubmitted: Boolean(partial.roskomnadzor?.notificationSubmitted ?? DEFAULT_LEGAL_SETTINGS.roskomnadzor.notificationSubmitted),
      submissionDate: partial.roskomnadzor?.submissionDate ?? DEFAULT_LEGAL_SETTINGS.roskomnadzor.submissionDate,
      portalUrl: partial.roskomnadzor?.portalUrl ?? DEFAULT_LEGAL_SETTINGS.roskomnadzor.portalUrl,
    },
    privacyPolicy: {
      effectiveDate: partial.privacyPolicy?.effectiveDate ?? DEFAULT_LEGAL_SETTINGS.privacyPolicy.effectiveDate,
      lastUpdated: partial.privacyPolicy?.lastUpdated ?? DEFAULT_LEGAL_SETTINGS.privacyPolicy.lastUpdated,
      title: partial.privacyPolicy?.title ?? DEFAULT_LEGAL_SETTINGS.privacyPolicy.title,
      customIntro: partial.privacyPolicy?.customIntro ?? DEFAULT_LEGAL_SETTINGS.privacyPolicy.customIntro,
      customClauses: partial.privacyPolicy?.customClauses ?? DEFAULT_LEGAL_SETTINGS.privacyPolicy.customClauses,
    },
    consent: {
      effectiveDate: partial.consent?.effectiveDate ?? DEFAULT_LEGAL_SETTINGS.consent.effectiveDate,
      title: partial.consent?.title ?? DEFAULT_LEGAL_SETTINGS.consent.title,
      purposeList: Array.isArray(partial.consent?.purposeList) && partial.consent.purposeList.length > 0
        ? partial.consent.purposeList
        : [...DEFAULT_LEGAL_SETTINGS.consent.purposeList],
      dataTypesList: Array.isArray(partial.consent?.dataTypesList) && partial.consent.dataTypesList.length > 0
        ? partial.consent.dataTypesList
        : [...DEFAULT_LEGAL_SETTINGS.consent.dataTypesList],
      customTerms: partial.consent?.customTerms ?? DEFAULT_LEGAL_SETTINGS.consent.customTerms,
    },
  };
}

/**
 * Получить текущие настройки правовых документов из localStorage с fallback к значениям по умолчанию
 */
export function getLegalSettings(): LegalSettings {
  if (typeof window === "undefined" || !window.localStorage) {
    return JSON.parse(JSON.stringify(DEFAULT_LEGAL_SETTINGS));
  }

  try {
    const raw = window.localStorage.getItem(LEGAL_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return JSON.parse(JSON.stringify(DEFAULT_LEGAL_SETTINGS));
    }
    const parsed = JSON.parse(raw);
    return mergeWithDefaults(parsed);
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn("Failed to read legal settings from localStorage:", error);
    }
    return JSON.parse(JSON.stringify(DEFAULT_LEGAL_SETTINGS));
  }
}

/**
 * Сохранить настройки правовых документов в localStorage и уведомить подписчиков
 */
export function saveLegalSettings(settings: LegalSettings): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const merged = mergeWithDefaults(settings);
    window.localStorage.setItem(LEGAL_SETTINGS_STORAGE_KEY, JSON.stringify(merged));

    // Уведомляем другие компоненты в том же окне и других вкладках
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(
      new CustomEvent(LEGAL_SETTINGS_CHANGE_EVENT, { detail: merged })
    );
  } catch (error) {
    console.error("Failed to save legal settings to localStorage:", error);
    throw error;
  }
}

/**
 * Сбросить настройки к типовым значениям 152-ФЗ
 */
export function resetLegalSettings(): LegalSettings {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_LEGAL_SETTINGS));
  saveLegalSettings(defaults);
  return defaults;
}

/**
 * React-хук для реактивного использования настроек правовых документов
 */
export function useLegalSettings(): LegalSettings {
  const [settings, setSettings] = useState<LegalSettings>(() => getLegalSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getLegalSettings());
    };

    window.addEventListener(LEGAL_SETTINGS_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(LEGAL_SETTINGS_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return settings;
}
