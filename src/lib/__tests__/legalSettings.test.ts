import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getLegalSettings,
  saveLegalSettings,
  resetLegalSettings,
  DEFAULT_LEGAL_SETTINGS,
  LEGAL_SETTINGS_STORAGE_KEY,
  LEGAL_SETTINGS_CHANGE_EVENT,
  RKN_NOTIFICATION_PORTAL_URL,
  RKN_GOSUSLUGI_URL,
  RKN_REGISTRY_SEARCH_URL,
  type LegalSettings,
} from "../legalSettings";

describe("legalSettings module - 152-ФЗ Settings & Roskomnadzor Registry", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("getLegalSettings() returns valid default operator values", () => {
    const settings = getLegalSettings();
    expect(settings).toEqual(DEFAULT_LEGAL_SETTINGS);

    // Проверка обязательных реквизитов оператора
    expect(settings.operator.name).toBe("Школа горнолыжного спорта «Вершина»");
    expect(settings.operator.email).toBe("scool-vershina@mail.ru");
    expect(settings.operator.phone).toBe("+7 (981) 742-86-85");
    expect(settings.operator.address).toBe("г. Санкт-Петербург и Ленинградская область");

    // Начальный статус РКН по умолчанию
    expect(settings.roskomnadzor.registered).toBe(false);
    expect(settings.roskomnadzor.notificationSubmitted).toBe(false);
    expect(settings.roskomnadzor.regNumber).toBe("");
    expect(settings.roskomnadzor.portalUrl).toBe(RKN_NOTIFICATION_PORTAL_URL);

    // Документы по умолчанию
    expect(settings.privacyPolicy.title).toBe("Политика в отношении обработки персональных данных");
    expect(settings.consent.title).toBe("Согласие на обработку персональных данных");
    expect(settings.consent.purposeList.length).toBeGreaterThan(0);
    expect(settings.consent.dataTypesList.length).toBeGreaterThan(0);
  });

  it("saveLegalSettings() persists data to localStorage and dispatches change events", () => {
    const storageSpy = vi.fn();
    const customEventSpy = vi.fn();

    window.addEventListener("storage", storageSpy);
    window.addEventListener(LEGAL_SETTINGS_CHANGE_EVENT, customEventSpy);

    const customSettings: LegalSettings = {
      ...DEFAULT_LEGAL_SETTINGS,
      operator: {
        ...DEFAULT_LEGAL_SETTINGS.operator,
        inn: "780123456789",
        ogrn: "123456789012345",
      },
    };

    saveLegalSettings(customSettings);

    // Проверка записи в localStorage
    const rawStored = localStorage.getItem(LEGAL_SETTINGS_STORAGE_KEY);
    expect(rawStored).not.toBeNull();
    const parsed = JSON.parse(rawStored!);
    expect(parsed.operator.inn).toBe("780123456789");
    expect(parsed.operator.ogrn).toBe("123456789012345");

    // Проверка событий
    expect(storageSpy).toHaveBeenCalledTimes(1);
    expect(customEventSpy).toHaveBeenCalledTimes(1);

    // Проверка через getLegalSettings()
    const retrieved = getLegalSettings();
    expect(retrieved.operator.inn).toBe("780123456789");
    expect(retrieved.operator.ogrn).toBe("123456789012345");
    expect(retrieved.operator.name).toBe("Школа горнолыжного спорта «Вершина»");

    window.removeEventListener("storage", storageSpy);
    window.removeEventListener(LEGAL_SETTINGS_CHANGE_EVENT, customEventSpy);
  });

  it("resetLegalSettings() restores default settings", () => {
    // Изменяем настройки
    const modified: LegalSettings = {
      ...DEFAULT_LEGAL_SETTINGS,
      operator: {
        ...DEFAULT_LEGAL_SETTINGS.operator,
        name: "ООО Другой Оператор",
        email: "other@operator.ru",
      },
      roskomnadzor: {
        ...DEFAULT_LEGAL_SETTINGS.roskomnadzor,
        registered: true,
        regNumber: "78-25-999999",
      },
    };
    saveLegalSettings(modified);

    expect(getLegalSettings().operator.name).toBe("ООО Другой Оператор");
    expect(getLegalSettings().roskomnadzor.registered).toBe(true);

    // Вызываем reset
    const result = resetLegalSettings();

    expect(result.operator.name).toBe(DEFAULT_LEGAL_SETTINGS.operator.name);
    expect(result.operator.email).toBe(DEFAULT_LEGAL_SETTINGS.operator.email);
    expect(result.roskomnadzor.registered).toBe(false);

    // Проверяем, что в хранилище также обновились данные
    const retrieved = getLegalSettings();
    expect(retrieved.operator.name).toBe("Школа горнолыжного спорта «Вершина»");
    expect(retrieved.roskomnadzor.registered).toBe(false);
  });

  it("tests Roskomnadzor portal URLs and registration fields", () => {
    // Проверка констант URL порталов Роскомнадзора
    expect(RKN_NOTIFICATION_PORTAL_URL).toBe(
      "https://pd.rkn.gov.ru/operators-registry/notification/form/"
    );
    expect(RKN_GOSUSLUGI_URL).toBe("https://www.gosuslugi.ru/600375/1/form");
    expect(RKN_REGISTRY_SEARCH_URL).toBe(
      "https://pd.rkn.gov.ru/operators-registry/operators-list/"
    );

    // Проверка валидности форматов URL
    [RKN_NOTIFICATION_PORTAL_URL, RKN_GOSUSLUGI_URL, RKN_REGISTRY_SEARCH_URL].forEach((url) => {
      expect(url).toMatch(/^https:\/\/[a-z0-9.-]+\.gov\.ru|gosuslugi\.ru/);
    });

    // Настройка полей Роскомнадзора (уведомление подано и регистрационный номер присвоен)
    const rknUpdatedSettings: LegalSettings = {
      ...DEFAULT_LEGAL_SETTINGS,
      roskomnadzor: {
        registered: true,
        regNumber: "78-26-004512",
        registrationDate: "2026-03-10",
        notificationSubmitted: true,
        submissionDate: "2026-02-01",
        portalUrl: RKN_NOTIFICATION_PORTAL_URL,
      },
    };

    saveLegalSettings(rknUpdatedSettings);
    const loaded = getLegalSettings();

    expect(loaded.roskomnadzor.registered).toBe(true);
    expect(loaded.roskomnadzor.regNumber).toBe("78-26-004512");
    expect(loaded.roskomnadzor.registrationDate).toBe("2026-03-10");
    expect(loaded.roskomnadzor.notificationSubmitted).toBe(true);
    expect(loaded.roskomnadzor.submissionDate).toBe("2026-02-01");
    expect(loaded.roskomnadzor.portalUrl).toBe(
      "https://pd.rkn.gov.ru/operators-registry/notification/form/"
    );
  });

  it("handles corrupt localStorage data and merges partial settings with defaults gracefully", () => {
    // Тест 1: Невалидный JSON в localStorage
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(LEGAL_SETTINGS_STORAGE_KEY, "invalid-json{}[");
    expect(getLegalSettings()).toEqual(DEFAULT_LEGAL_SETTINGS);
    warnSpy.mockRestore();

    // Тест 2: Частичные настройки объединяются с дефолтными
    localStorage.setItem(
      LEGAL_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        operator: {
          name: "Индивидуальный предприниматель",
        },
      })
    );

    const merged = getLegalSettings();
    expect(merged.operator.name).toBe("Индивидуальный предприниматель");
    // Дефолтные значения для незаполненных полей
    expect(merged.operator.email).toBe(DEFAULT_LEGAL_SETTINGS.operator.email);
    expect(merged.operator.phone).toBe(DEFAULT_LEGAL_SETTINGS.operator.phone);
    expect(merged.roskomnadzor.registered).toBe(false);
    expect(merged.privacyPolicy.title).toBe(DEFAULT_LEGAL_SETTINGS.privacyPolicy.title);
    expect(merged.consent.purposeList).toEqual(DEFAULT_LEGAL_SETTINGS.consent.purposeList);
  });
});
