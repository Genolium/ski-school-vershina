import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactForm from "../ContactForm";
import * as api from "@/lib/api";
import { saveUTMParams, clearStoredUTMParams } from "@/lib/utm";

vi.mock("@/lib/api", () => ({
  createApplication: vi.fn(),
  getTariffs: vi.fn(),
}));

describe("ContactForm - 152-ФЗ Compliance and Submission", () => {
  const mockTariffs: api.Tariff[] = [
    {
      id: 1,
      title: "Active",
      description: "Для семейного отдыха и поддержания формы",
      features: JSON.stringify(["1 тренировка в неделю"]),
      price: "6000 р/мес.",
      is_active: true,
      order: 0,
    },
    {
      id: 2,
      title: "Standard",
      description: "Для детей, которые хотят кататься уверенно",
      features: JSON.stringify(["3 тренировки в неделю"]),
      price: "10000 р/мес.",
      is_active: true,
      order: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getTariffs).mockResolvedValue(mockTariffs);
    vi.mocked(api.createApplication).mockResolvedValue({
      id: 1,
      name: "Иван Иванов",
      phone: "+7 (999) 123-45-67",
      tariff: "Active",
      status: "pending",
      created_at: new Date().toISOString(),
    });
  });

  it("ensures consent checkbox is initially UNCHECKED (empty by default as required by Roskomnadzor)", async () => {
    render(<ContactForm />);

    await waitFor(() => {
      expect(api.getTariffs).toHaveBeenCalled();
    });

    const consentCheckbox = screen.getByRole("checkbox");
    expect(consentCheckbox).toBeInTheDocument();
    expect(consentCheckbox).not.toBeChecked();
    expect((consentCheckbox as HTMLInputElement).checked).toBe(false);
  });

  it('renders legal links with correct href, target="_blank" and rel="noopener noreferrer"', async () => {
    render(<ContactForm />);

    await waitFor(() => {
      expect(api.getTariffs).toHaveBeenCalled();
    });

    const consentLink = screen.getByRole("link", {
      name: /обработку персональных данных/i,
    });
    expect(consentLink).toBeInTheDocument();
    expect(consentLink).toHaveAttribute("href", "/consent");
    expect(consentLink).toHaveAttribute("target", "_blank");
    expect(consentLink).toHaveAttribute("rel", "noopener noreferrer");

    const privacyLink = screen.getByRole("link", {
      name: /политикой конфиденциальности/i,
    });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");
    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("displays error message and prevents API call when attempting to submit without consent", async () => {
    render(<ContactForm />);

    await waitFor(() => {
      expect(api.getTariffs).toHaveBeenCalled();
    });

    const nameInput = screen.getByLabelText(/^Имя/i);
    const phoneInput = screen.getByLabelText(/^Телефон/i);
    const tariffSelect = screen.getByLabelText(/^Выберите тариф/i);
    const submitBtn = screen.getByRole("button", {
      name: /записаться на пробное занятие/i,
    });

    // Заполняем остальные поля валидными данными, но НЕ отмечаем чекбокс согласия
    fireEvent.change(nameInput, { target: { value: "Иван Иванов" } });
    fireEvent.change(phoneInput, { target: { value: "+7 (999) 123-45-67" } });
    fireEvent.change(tariffSelect, { target: { value: "Active" } });

    // Убеждаемся что чекбокс согласия снят
    const consentCheckbox = screen.getByRole("checkbox");
    expect(consentCheckbox).not.toBeChecked();

    // Нажимаем кнопку отправки
    fireEvent.click(submitBtn);

    // Должно отобразиться точное сообщение об ошибке согласия по 152-ФЗ
    const errorMessage = await screen.findByText(
      "Необходимо подтвердить согласие на обработку персональных данных"
    );
    expect(errorMessage).toBeInTheDocument();

    // API createApplication НЕ должен быть вызван
    expect(api.createApplication).not.toHaveBeenCalled();
  });

  it("successfully submits the form when all fields including consent checkbox are filled", async () => {
    render(<ContactForm />);

    // Ждем загрузки тарифов
    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Active - 6000 р\/мес\./i })).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/^Имя/i);
    const phoneInput = screen.getByLabelText(/^Телефон/i);
    const tariffSelect = screen.getByLabelText(/^Выберите тариф/i);
    const consentCheckbox = screen.getByRole("checkbox");
    const submitBtn = screen.getByRole("button", {
      name: /записаться на пробное занятие/i,
    });

    // Заполняем поля
    fireEvent.change(nameInput, { target: { value: "Алексей Смирнов" } });
    fireEvent.change(phoneInput, { target: { value: "+7 (981) 742-86-85" } });
    fireEvent.change(tariffSelect, { target: { value: "Active" } });

    // Отмечаем чекбокс согласия
    fireEvent.click(consentCheckbox);
    expect(consentCheckbox).toBeChecked();

    // Отправляем форму
    fireEvent.click(submitBtn);

    // Проверяем вызов API с корректными параметрами
    await waitFor(() => {
      expect(api.createApplication).toHaveBeenCalledTimes(1);
      expect(api.createApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Алексей Смирнов",
          phone: "+7 (981) 742-86-85",
          tariff: "Active",
          consent_given: true,
          consent_policy_version: "2026.1",
        })
      );
    });

    // После успешной отправки форма должна сброситься (включая снятие чекбокса согласия)
    await waitFor(() => {
      expect(nameInput).toHaveValue("");
      expect(phoneInput).toHaveValue("");
      expect(tariffSelect).toHaveValue("");
      expect(consentCheckbox).not.toBeChecked();
    });
  });

  it("silently traps spam bots via invisible Honeypot field without sending API request", async () => {
    render(<ContactForm />);

    await waitFor(() => {
      expect(api.getTariffs).toHaveBeenCalled();
    });

    const honeypotInput = screen.getByLabelText(/^Website/i);
    expect(honeypotInput).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/^Имя/i);
    const phoneInput = screen.getByLabelText(/^Телефон/i);
    const submitBtn = screen.getByRole("button", {
      name: /записаться на пробное занятие/i,
    });

    // Spam bot fills the hidden website honeypot field
    fireEvent.change(honeypotInput, { target: { value: "https://spam-bot-marketing.ru" } });
    fireEvent.change(nameInput, { target: { value: "Spam Bot" } });
    fireEvent.change(phoneInput, { target: { value: "+7 (999) 000-00-00" } });

    fireEvent.submit(submitBtn.closest("form")!);

    // API should NEVER be called (silent anti-spam defense)
    expect(api.createApplication).not.toHaveBeenCalled();

    // Form fields are cleared as simulated success
    await waitFor(() => {
      expect(honeypotInput).toHaveValue("");
      expect(nameInput).toHaveValue("");
    });
  });

  it("attaches stored UTM parameters and consent digital trail to application payload", async () => {
    // Setup stored UTM attribution
    saveUTMParams({
      utm_source: "yandex",
      utm_medium: "cpc",
      utm_campaign: "kids_spb",
      utm_content: "ad_variant_a",
      utm_term: "ski_school_spb",
    });

    render(<ContactForm />);

    await waitFor(() => {
      expect(api.getTariffs).toHaveBeenCalled();
    });

    const nameInput = screen.getByLabelText(/^Имя/i);
    const phoneInput = screen.getByLabelText(/^Телефон/i);
    const tariffSelect = screen.getByLabelText(/^Выберите тариф/i);
    const consentCheckbox = screen.getByRole("checkbox");
    const submitBtn = screen.getByRole("button", {
      name: /записаться на пробное занятие/i,
    });

    fireEvent.change(nameInput, { target: { value: "Мария Петрова" } });
    fireEvent.change(phoneInput, { target: { value: "+7 (921) 123-45-67" } });
    fireEvent.change(tariffSelect, { target: { value: "Active" } });
    fireEvent.click(consentCheckbox);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Мария Петрова",
          phone: "+7 (921) 123-45-67",
          tariff: "Active",
          consent_given: true,
          consent_policy_version: "2026.1",
          utm_source: "yandex",
          utm_medium: "cpc",
          utm_campaign: "kids_spb",
          utm_content: "ad_variant_a",
          utm_term: "ski_school_spb",
        })
      );
    });

    clearStoredUTMParams();
  });
});
