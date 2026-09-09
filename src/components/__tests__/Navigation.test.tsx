import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navigation from "../Navigation";

describe("Navigation Component", () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    scrollIntoViewMock = vi.fn();
    window.scrollTo = vi.fn();
    window.scrollY = 0;
    document.body.style.overflow = "";

    // Polyfill scrollIntoView on Element prototype
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
    window.Element.prototype.scrollIntoView = scrollIntoViewMock;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.overflow = "";
  });

  it("renders brand logo 'VERSHINA' with proper accessibility attributes", () => {
    render(<Navigation />);

    const brandLogo = screen.getByRole("button", { name: "На главную" });
    expect(brandLogo).toBeInTheDocument();
    expect(brandLogo).toHaveTextContent("VERSHINA");
  });

  it("clicking brand logo scrolls window to top smoothly", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const brandLogo = screen.getByRole("button", { name: "На главную" });
    await user.click(brandLogo);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("renders all desktop navigation links ('О нас', 'Фото', 'Тренеры', 'Тарифы', 'Локации', 'Сборы', 'Расписание', 'Контакты')", () => {
    render(<Navigation />);

    const expectedNavLinks = [
      "О нас",
      "Фото",
      "Тренеры",
      "Тарифы",
      "Локации",
      "Сборы",
      "Расписание",
      "Контакты",
    ];

    expectedNavLinks.forEach((linkText) => {
      const linkButtons = screen.getAllByRole("button", { name: linkText });
      expect(linkButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("clicking a desktop navigation link triggers smooth scroll to corresponding section", async () => {
    const user = userEvent.setup();
    const targetAbout = document.createElement("div");
    targetAbout.id = "about";
    document.body.appendChild(targetAbout);

    render(<Navigation />);

    const aboutButton = screen.getByRole("button", { name: "О нас" });
    await user.click(aboutButton);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("CTA button 'Записаться' triggers smooth scroll to #contact-form", async () => {
    const user = userEvent.setup();
    const targetForm = document.createElement("div");
    targetForm.id = "contact-form";
    document.body.appendChild(targetForm);

    render(<Navigation />);

    const ctaButton = screen.getByRole("button", { name: "Записаться" });
    expect(ctaButton).toBeInTheDocument();

    await user.click(ctaButton);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("mobile menu hamburger button toggles mobile menu open/closed", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const toggleButton = screen.getByRole("button", { name: "Открыть меню" });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    // Click to open
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Закрыть меню" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    // Click to close
    const closeButton = screen.getByRole("button", { name: "Закрыть меню" });
    fireEvent.click(closeButton);
    expect(closeButton).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  it("closes mobile menu on Escape key press", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const toggleButton = screen.getByRole("button", { name: "Открыть меню" });
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  it("closes mobile menu when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside-area">Outside Content</div>
        <Navigation />
      </div>
    );

    const toggleButton = screen.getByRole("button", { name: "Открыть меню" });
    await user.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    // Click outside
    const outsideArea = screen.getByTestId("outside-area");
    fireEvent.mouseDown(outsideArea);

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking a mobile navigation link scrolls to section and closes mobile menu", async () => {
    const user = userEvent.setup();
    const targetCamps = document.createElement("div");
    targetCamps.id = "camps";
    document.body.appendChild(targetCamps);

    render(<Navigation />);

    const toggleButton = screen.getByRole("button", { name: "Открыть меню" });
    await user.click(toggleButton);

    const campsButtons = screen.getAllByRole("button", { name: "Сборы" });
    expect(campsButtons.length).toBe(2);

    await user.click(campsButtons[1]);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking mobile menu CTA 'Записаться' scrolls to #contact-form and closes mobile menu", async () => {
    const user = userEvent.setup();
    const targetForm = document.createElement("div");
    targetForm.id = "contact-form";
    document.body.appendChild(targetForm);

    render(<Navigation />);

    const toggleButton = screen.getByRole("button", { name: "Открыть меню" });
    await user.click(toggleButton);

    const ctaButtons = screen.getAllByRole("button", { name: "Записаться" });
    expect(ctaButtons.length).toBe(2);

    await user.click(ctaButtons[1]);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("updates background styles on window scroll", () => {
    const { container } = render(<Navigation />);
    const nav = container.querySelector("nav");

    expect(nav).toHaveClass("bg-transparent");

    // Simulate scrolling beyond 50px
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });
    fireEvent.scroll(window);

    expect(nav).toHaveClass("bg-ski-black/95");
  });
});
