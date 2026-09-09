import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Consent from "../Consent";

describe("Consent Page - 152-ФЗ Compliance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets document title and renders main heading 'Согласие на обработку персональных данных'", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Consent />
      </MemoryRouter>
    );

    // Проверка заголовка документа
    expect(document.title).toContain("Согласие на обработку персональных данных");
    expect(document.title).toContain("Школа горнолыжного спорта «Вершина»");

    // Проверка H1
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Согласие на обработку персональных данных",
    });
    expect(heading).toBeInTheDocument();
  });

  it("verifies presence of 152-ФЗ badge and reference to the operator", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Consent />
      </MemoryRouter>
    );

    // Проверка плашки/бейджа 152-ФЗ
    expect(screen.getByText("Федеральный закон № 152-ФЗ")).toBeInTheDocument();

    // Проверка реквизитов Оператора
    const operatorElements = screen.getAllByText(/Школа горнолыжного спорта «Вершина»/i);
    expect(operatorElements.length).toBeGreaterThanOrEqual(1);

    // Проверка контактов Оператора
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

    // Проверка наличия разделов согласия
    expect(screen.getByText(/1\. Перечень персональных данных/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Цели обработки персональных данных/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Перечень действий с персональными данными/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Срок действия согласия и порядок его отзыва/i)).toBeInTheDocument();
  });

  it("verifies links to return home and links to privacy policy", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Consent />
      </MemoryRouter>
    );

    // Ссылка возврата на главную страницу
    const homeLinks = screen.getAllByRole("link", {
      name: /на главную|вернуться на главную/i,
    });
    expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    homeLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/");
    });

    // Ссылка на политику конфиденциальности
    const privacyLinks = screen.getAllByRole("link", {
      name: /политика конфиденциальности|политикой конфиденциальности/i,
    });
    expect(privacyLinks.length).toBeGreaterThanOrEqual(1);
    privacyLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/privacy");
    });
  });

  it("calls window.print when clicking print button", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Consent />
      </MemoryRouter>
    );

    const printButton = screen.getByRole("button", { name: /распечатать/i });
    expect(printButton).toBeInTheDocument();

    fireEvent.click(printButton);
    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
