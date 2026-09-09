import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Camps from "../Camps";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getCamps: vi.fn(),
}));

describe("Camps Component", () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    window.Element.prototype.scrollIntoView = scrollIntoViewMock;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("renders loading skeleton state initially", () => {
    vi.mocked(api.getCamps).mockReturnValue(new Promise(() => {}));

    const { container } = render(<Camps />);

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /Тренировочные сборы/i })).toBeInTheDocument();
  });

  it("renders camp cards, dates, locations, and included amenities from API", async () => {
    const mockCamps: api.Camp[] = [
      {
        id: 1,
        title: "Зимний сбор в Кировске",
        location: "Хибины, Мурманская область",
        location_desc: "Склоны ГК «Большой Вудъявр»",
        dates: "03.01.2026 - 10.01.2026",
        duration: "8 дней / 7 ночей",
        group_size: "до 12 детей",
        group_desc: "2 тренера на группу",
        training_desc: "Ежедневно 2 тренировки на склоне + ОФП",
        included_items: JSON.stringify([
          "Проживание в гостинице",
          "3-разовое сбалансированное питание",
          "Ски-пассы на все дни",
          "Трансфер из/в аэропорт Апатиты",
          "Спортивная страховка",
        ]),
        stats: "",
        is_active: true,
        order: 1,
      },
      {
        id: 2,
        title: "Весенний сбор в Сочи",
        location: "Роза Хутор, Красная Поляна",
        location_desc: "Склоны Роза Пик",
        dates: "20.03.2026 - 28.03.2026",
        duration: "9 дней",
        group_size: "10 детей",
        group_desc: "Спортивная группа",
        training_desc: "Спецслалом и слалом-гигант",
        included_items: JSON.stringify(["Проживание в шале", "Ски-пассы"]),
        stats: "",
        is_active: true,
        order: 2,
      },
    ];

    vi.mocked(api.getCamps).mockResolvedValue(mockCamps);

    render(<Camps />);

    // Wait for 200ms debounce
    await waitFor(
      () => {
        expect(screen.getByText("Зимний сбор в Кировске")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Locations & dates
    expect(screen.getByText("Хибины, Мурманская область")).toBeInTheDocument();
    expect(screen.getByText("Склоны ГК «Большой Вудъявр»")).toBeInTheDocument();
    expect(screen.getByText("03.01.2026 - 10.01.2026")).toBeInTheDocument();
    expect(screen.getByText("Продолжительность: 8 дней / 7 ночей")).toBeInTheDocument();

    // Group size & training desc
    expect(screen.getByText("Группы: до 12 детей")).toBeInTheDocument();
    expect(screen.getByText("2 тренера на группу")).toBeInTheDocument();
    expect(screen.getByText("Ежедневно 2 тренировки на склоне + ОФП")).toBeInTheDocument();

    // Included amenities
    expect(screen.getByText("Проживание в гостинице")).toBeInTheDocument();
    expect(screen.getByText("3-разовое сбалансированное питание")).toBeInTheDocument();
    expect(screen.getByText("Ски-пассы на все дни")).toBeInTheDocument();
    expect(screen.getByText("Трансфер из/в аэропорт Апатиты")).toBeInTheDocument();
    expect(screen.getByText("Спортивная страховка")).toBeInTheDocument();

    // Bottom achievements counters
    expect(screen.getByText("Сборов в прошлом сезоне")).toBeInTheDocument();
    expect(screen.getByText("Участников сборов")).toBeInTheDocument();
    expect(screen.getByText("Родителей рекомендуют")).toBeInTheDocument();
  });

  it("filters out inactive camps", async () => {
    const mockCamps: api.Camp[] = [
      {
        id: 1,
        title: "Активный сбор",
        location: "Карелия",
        location_desc: "",
        dates: "Ноябрь 2025",
        duration: "5 дней",
        group_size: "6 детей",
        group_desc: "",
        training_desc: "Техника",
        included_items: JSON.stringify(["Трансфер"]),
        stats: "",
        is_active: true,
        order: 1,
      },
      {
        id: 2,
        title: "Архивный неактивный сбор",
        location: "Эльбрус",
        location_desc: "",
        dates: "Прошедшие даты",
        duration: "10 дней",
        group_size: "",
        group_desc: "",
        training_desc: "",
        included_items: "[]",
        stats: "",
        is_active: false,
        order: 2,
      },
    ];

    vi.mocked(api.getCamps).mockResolvedValue(mockCamps);

    render(<Camps />);

    await waitFor(
      () => {
        expect(screen.getByText("Активный сбор")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.queryByText("Архивный неактивный сбор")).not.toBeInTheDocument();
  });

  it("CTA button 'Оставить заявку' triggers smooth scroll to #contact-form", async () => {
    const user = userEvent.setup();
    const contactForm = document.createElement("div");
    contactForm.id = "contact-form";
    document.body.appendChild(contactForm);

    const mockCamps: api.Camp[] = [
      {
        id: 1,
        title: "Сбор на Алтае",
        location: "Манжерок",
        location_desc: "",
        dates: "Февраль 2026",
        duration: "7 дней",
        group_size: "8 детей",
        group_desc: "",
        training_desc: "",
        included_items: "[]",
        stats: "",
        is_active: true,
        order: 1,
      },
    ];

    vi.mocked(api.getCamps).mockResolvedValue(mockCamps);

    render(<Camps />);

    await waitFor(
      () => {
        expect(screen.getByText("Сбор на Алтае")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    const ctaButton = screen.getByRole("button", { name: /Оставить заявку/i });
    await user.click(ctaButton);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("navigates slides using keyboard arrows and navigation buttons", async () => {
    const user = userEvent.setup();
    const mockCamps: api.Camp[] = [
      {
        id: 1,
        title: "Сбор 1: Кировск",
        location: "Хибины",
        location_desc: "",
        dates: "Январь",
        duration: "7 дней",
        group_size: "",
        group_desc: "",
        training_desc: "",
        included_items: "[]",
        stats: "",
        is_active: true,
        order: 1,
      },
      {
        id: 2,
        title: "Сбор 2: Красная Поляна",
        location: "Сочи",
        location_desc: "",
        dates: "Февраль",
        duration: "7 дней",
        group_size: "",
        group_desc: "",
        training_desc: "",
        included_items: "[]",
        stats: "",
        is_active: true,
        order: 2,
      },
    ];

    vi.mocked(api.getCamps).mockResolvedValue(mockCamps);

    render(<Camps />);

    await waitFor(
      () => {
        expect(screen.getByText("Сбор 1: Кировск")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    const nextButton = screen.getByRole("button", { name: "Следующий слайд" });
    const prevButton = screen.getByRole("button", { name: "Предыдущий слайд" });

    // Click next slide button
    await user.click(nextButton);

    // Keyboard ArrowLeft navigation
    fireEvent.keyDown(window, { key: "ArrowLeft" });

    // Keyboard ArrowRight navigation
    fireEvent.keyDown(window, { key: "ArrowRight" });

    // Dot indicators
    const dotButtons = screen.getAllByRole("button", { name: /Перейти к слайду/i });
    expect(dotButtons.length).toBe(2);
    await user.click(dotButtons[0]);
  });

  it("displays empty state message when no camps are returned or API fails", async () => {
    vi.mocked(api.getCamps).mockRejectedValue(new Error("API offline"));

    render(<Camps />);

    await waitFor(
      () => {
        expect(screen.getByText("Данные о сборах появятся позже")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
