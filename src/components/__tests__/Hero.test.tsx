import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Hero from "../Hero";

describe("Hero Component", () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    window.Element.prototype.scrollIntoView = scrollIntoViewMock;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders headline with school name 'Школа горнолыжного спорта «Вершина»'", () => {
    render(<Hero />);

    // Match either by accessible name or text content
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/«Вершина»/i);
    expect(heading).toHaveAccessibleName(/Школа горнолыжного спорта «Вершина»|Вершина/i);
  });

  it("renders season registration badge", () => {
    render(<Hero />);

    expect(
      screen.getByText(/Набор детей от 4 лет на сезон/i)
    ).toBeInTheDocument();
  });

  it("CTA button 'Записаться на тренировку' triggers smooth scroll to #contact-form", async () => {
    const user = userEvent.setup();
    const contactForm = document.createElement("div");
    contactForm.id = "contact-form";
    document.body.appendChild(contactForm);

    render(<Hero />);

    const ctaButton = screen.getByRole("button", {
      name: /Записаться на тренировку/i,
    });
    expect(ctaButton).toBeInTheDocument();

    await user.click(ctaButton);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("secondary button 'Узнать подробнее' triggers scroll to #about", async () => {
    const user = userEvent.setup();
    const aboutSection = document.createElement("div");
    aboutSection.id = "about";
    document.body.appendChild(aboutSection);

    render(<Hero />);

    const secondaryButton = screen.getByRole("button", {
      name: /Узнать подробнее/i,
    });
    expect(secondaryButton).toBeInTheDocument();

    await user.click(secondaryButton);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("renders phone button linking to trainer phone number", () => {
    render(<Hero />);

    const phoneLink = screen.getByRole("link", {
      name: /Позвонить тренеру/i,
    });
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute("href", "tel:+79817428685");
  });

  it("renders all 4 key benefits cards in the grid", () => {
    render(<Hero />);

    expect(screen.getByText("Опытные тренеры")).toBeInTheDocument();
    expect(screen.getByText("Личный подход")).toBeInTheDocument();
    expect(screen.getByText("Австрийская методика")).toBeInTheDocument();
    expect(screen.getByText("Победы и разряды")).toBeInTheDocument();
  });

  it("renders hero background image with proper accessibility alt text", () => {
    render(<Hero />);

    const heroImg = screen.getByAltText("Горнолыжный склон школы Вершина");
    expect(heroImg).toBeInTheDocument();
    expect(heroImg).toHaveAttribute("loading", "eager");
  });

  it("safely handles click when target scroll elements are not in DOM", async () => {
    const user = userEvent.setup();
    render(<Hero />);

    const ctaButton = screen.getByRole("button", {
      name: /Записаться на тренировку/i,
    });
    const secondaryButton = screen.getByRole("button", {
      name: /Узнать подробнее/i,
    });

    // Should not throw even if #contact-form or #about does not exist in DOM
    await expect(user.click(ctaButton)).resolves.not.toThrow();
    await expect(user.click(secondaryButton)).resolves.not.toThrow();
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });
});
