import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrivacyPolicy from "../PrivacyPolicy";

describe("PrivacyPolicy Page - 152-ФЗ Compliance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("sets document title and renders heading 'Политика в отношении обработки персональных данных'", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PrivacyPolicy />
      </MemoryRouter>
    );

    // Проверка H1 заголовка
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Политика в отношении обработки персональных данных",
    });
    expect(heading).toBeInTheDocument();

    // Проверка title документа
    expect(document.title).toContain("Политика в отношении обработки персональных данных");
    expect(document.title).toContain("Школа горнолыжного спорта «Вершина»");
  });

  it("verifies presence of 152-ФЗ badge and operator details", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PrivacyPolicy />
      </MemoryRouter>
    );

    // Проверка плашки 152-ФЗ
    expect(screen.getByText("Федеральный закон № 152-ФЗ")).toBeInTheDocument();

    // Проверка названия оператора
    const operatorNames = screen.getAllByText(/Школа горнолыжного спорта «Вершина»/i);
    expect(operatorNames.length).toBeGreaterThanOrEqual(1);

    // Проверка контактных данных оператора
    const emailLinks = screen.getAllByRole("link", {
      name: /scool-vershina@mail\.ru/i,
    });
    expect(emailLinks.length).toBeGreaterThanOrEqual(1);
    expect(emailLinks[0]).toHaveAttribute("href", "mailto:scool-vershina@mail.ru");

    const phoneLinks = screen.getAllByRole("link", {
      name: /\+7 \(981\) 742-86-85/i,
    });
    expect(phoneLinks.length).toBeGreaterThanOrEqual(1);
    expect(phoneLinks[0]).toHaveAttribute("href", "tel:+79817428685");

    // Местонахождение
    expect(screen.getAllByText(/Санкт-Петербург/i).length).toBeGreaterThanOrEqual(1);
  });

  it("verifies all required 152-ФЗ policy sections are rendered", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PrivacyPolicy />
      </MemoryRouter>
    );

    const requiredSections = [
      /1\.\s*Общие положения/i,
      /2\.\s*Основные понятия/i,
      /3\.\s*Правовые основания обработки персональных данных/i,
      /4\.\s*Цели сбора и обработки персональных данных/i,
      /5\.\s*Объем и категории обрабатываемых персональных данных/i,
      /6\.\s*Порядок сбора, хранения и защиты персональных данных/i,
      /7\.\s*Сроки обработки и хранения персональных данных/i,
      /8\.\s*Права субъекта персональных данных/i,
      /9\.\s*Использование файлов cookie и аналитических сервисов/i,
      /10\.\s*Порядок отзыва согласия и контакты Оператора/i,
      /11\.\s*Заключительные положения/i,
    ];

    requiredSections.forEach((sectionRegex) => {
      expect(screen.getByRole("heading", { name: sectionRegex })).toBeInTheDocument();
    });
  });

  it("renders navigation links to home, consent and handles printing", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PrivacyPolicy />
      </MemoryRouter>
    );

    // Ссылки на главную
    const homeLinks = screen.getAllByRole("link", {
      name: /на главную|вернуться на главную/i,
    });
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    homeLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/");
    });

    // Ссылки на согласие
    const consentLinks = screen.getAllByRole("link", {
      name: /согласие на обработку|текст согласия на обработку/i,
    });
    expect(consentLinks.length).toBeGreaterThanOrEqual(1);
    consentLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/consent");
    });

    // Печать документа
    const printButton = screen.getByRole("button", { name: /распечатать/i });
    fireEvent.click(printButton);
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
