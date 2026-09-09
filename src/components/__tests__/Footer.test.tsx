import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../Footer";

const renderFooter = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Footer />
    </MemoryRouter>
  );

describe("Footer Component", () => {
  it("renders both legal links: 'Политика конфиденциальности' and 'Согласие на обработку данных'", () => {
    renderFooter();

    // В футере есть ссылки в блоке 'Документы' и в нижней полосе
    const privacyLinks = screen.getAllByRole("link", {
      name: /политика конфиденциальности/i,
    });
    expect(privacyLinks.length).toBeGreaterThanOrEqual(1);
    privacyLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/privacy");
    });

    const consentLinks = screen.getAllByRole("link", {
      name: /согласие на обработку данных/i,
    });
    expect(consentLinks.length).toBeGreaterThanOrEqual(1);
    consentLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/consent");
    });

    // Проверка упоминания 152-ФЗ
    expect(
      screen.getByText(/Федеральным законом РФ № 152-ФЗ/i)
    ).toBeInTheDocument();
  });

  it("renders phone and email contact links properly", () => {
    renderFooter();

    // Ссылка на телефон
    const phoneLink = screen.getByRole("link", {
      name: /\+7 \(981\) 742-86-85/i,
    });
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute("href", "tel:+79817428685");

    // Ссылка на email
    const emailLink = screen.getByRole("link", {
      name: /scool-vershina@mail\.ru/i,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", "mailto:scool-vershina@mail.ru");

    // Ссылка на WhatsApp
    const whatsappLink = screen.getByRole("link", {
      name: /whatsapp/i,
    });
    expect(whatsappLink).toBeInTheDocument();
    expect(whatsappLink).toHaveAttribute("href", "https://wa.me/79817428685");
    expect(whatsappLink).toHaveAttribute("target", "_blank");
    expect(whatsappLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders school brand and current year copyright", () => {
    renderFooter();

    const currentYear = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} Школа горнолыжного спорта «Вершина»`, "i"))
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "VERSHINA" })).toHaveAttribute("href", "/");
  });
});
