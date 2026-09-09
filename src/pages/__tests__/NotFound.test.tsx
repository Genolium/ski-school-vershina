import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "../NotFound";

describe("NotFound (404) Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  const renderNotFound = (initialEntries = ["/non-existent-page"]) =>
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <NotFound />
      </MemoryRouter>
    );

  it("sets document title to 404 error title and logs error to console", () => {
    renderNotFound(["/bad-link"]);

    expect(document.title).toBe(
      "404 — Страница не найдена | Школа горнолыжного спорта «Вершина»"
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("404 Error:"),
      "/bad-link"
    );
  });

  it("renders 404 header with brand logo and 'На главную' navigation link leading to '/'", () => {
    renderNotFound();

    const header = screen.getByRole("banner");
    const brandLink = within(header).getByRole("link", { name: "VERSHINA" });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute("href", "/");

    const headerHomeLink = within(header).getByRole("link", { name: /На главную/i });
    expect(headerHomeLink).toBeInTheDocument();
    expect(headerHomeLink).toHaveAttribute("href", "/");
  });

  it("renders 404 badge, main heading, and explanatory message", () => {
    renderNotFound();

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /Страница не найдена/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Возможно, адрес страницы изменился или она была удалена. Вы можете вернуться на главную страницу сайта школы./i
      )
    ).toBeInTheDocument();
  });

  it("renders CTA button 'Перейти на главную' leading to '/'", () => {
    renderNotFound();

    const homeButton = screen.getByRole("button", { name: /Перейти на главную/i });
    expect(homeButton).toBeInTheDocument();

    const homeButtonLink = homeButton.closest("a");
    expect(homeButtonLink).toHaveAttribute("href", "/");
  });

  it("renders Footer component with legal links, contact information, and copyright", () => {
    renderNotFound();

    // Footer container
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    // Legal links in Footer
    const privacyLinks = screen.getAllByRole("link", { name: /Политика конфиденциальности/i });
    expect(privacyLinks.length).toBeGreaterThanOrEqual(1);
    expect(privacyLinks[0]).toHaveAttribute("href", "/privacy");

    const consentLinks = screen.getAllByRole("link", { name: /Согласие на обработку данных/i });
    expect(consentLinks.length).toBeGreaterThanOrEqual(1);
    expect(consentLinks[0]).toHaveAttribute("href", "/consent");

    // Contacts in Footer
    expect(screen.getByRole("link", { name: /scool-vershina@mail\.ru/i })).toBeInTheDocument();
  });
});
