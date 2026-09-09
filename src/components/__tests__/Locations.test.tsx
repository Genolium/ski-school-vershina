import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Locations from "../Locations";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getLocations: vi.fn(),
}));

describe("Locations Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders section heading 'Где мы тренируемся'", () => {
    vi.mocked(api.getLocations).mockReturnValue(new Promise(() => {}));

    render(<Locations />);

    expect(screen.getByRole("heading", { name: /Где мы тренируемся/i })).toBeInTheDocument();
    expect(screen.getByText("Профессиональные площадки для всесезонных тренировок")).toBeInTheDocument();
  });

  it("renders locations ('Зал', 'Северный склон', 'Снежный'), features, address, and route button", async () => {
    const mockLocations: api.Location[] = [
      {
        id: 1,
        title: "Зал",
        address: "ул. Брянцева 24, Санкт-Петербург",
        description: "Специализированный зал для ОФП и отработки техники",
        features: JSON.stringify(["Искусственный склон", "Современные батуты", "Раздевалки с душем"]),
        icon_type: "MapPin",
        order: 0,
        route_url: "https://2gis.ru/spb/bryanceva24",
      },
      {
        id: 2,
        title: "Северный склон",
        address: "п. Токсово «Северный склон»",
        description: "Всесезонные тренировки на свежем воздухе",
        features: JSON.stringify(["Безопасные трассы", "Профессиональная экипировка"]),
        icon_type: "Bike",
        order: 1,
        latitude: 60.153,
        longitude: 30.528,
      },
      {
        id: 3,
        title: "Снежный",
        address: "ГК «Снежный», Коробицыно",
        description: "Основные горнолыжные тренировки на ратраченных склонах",
        features: JSON.stringify(["5 трасс разного уровня", "Бугельные подъемники"]),
        icon_type: "Mountain",
        order: 2,
        route_url: "https://2gis.ru/spb/snezhniy",
      },
    ];

    vi.mocked(api.getLocations).mockResolvedValue(mockLocations);

    render(<Locations />);

    // Wait for the 100ms debounce and getLocations API resolution in Locations.tsx
    await waitFor(
      () => {
        expect(screen.getByRole("heading", { level: 3, name: "Северный склон" })).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByRole("heading", { level: 3, name: "Зал" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Снежный" })).toBeInTheDocument();

    // Addresses
    expect(screen.getByText("ул. Брянцева 24, Санкт-Петербург")).toBeInTheDocument();
    expect(screen.getByText("п. Токсово «Северный склон»")).toBeInTheDocument();
    expect(screen.getByText("ГК «Снежный», Коробицыно")).toBeInTheDocument();

    // Features
    expect(screen.getByText("Искусственный склон")).toBeInTheDocument();
    expect(screen.getByText("Современные батуты")).toBeInTheDocument();
    expect(screen.getByText("Безопасные трассы")).toBeInTheDocument();
    expect(screen.getByText("5 трасс разного уровня")).toBeInTheDocument();

    // Route buttons and links
    const routeButtons = screen.getAllByRole("button", { name: "Как добраться" });
    expect(routeButtons.length).toBe(3);

    const routeLinks = screen.getAllByRole("link", { name: /Как добраться/i });
    expect(routeLinks[0]).toHaveAttribute("href", "https://2gis.ru/spb/bryanceva24");
    expect(routeLinks[0]).toHaveAttribute("target", "_blank");
    expect(routeLinks[0]).toHaveAttribute("rel", "noopener noreferrer");

    // Coordinates fallback link for item 2
    expect(routeLinks[1]).toHaveAttribute(
      "href",
      "https://2gis.ru/spb/routeSearch/rsType/car/to/30.528,60.153"
    );
  });

  it("renders fallback locations when API fails", async () => {
    vi.mocked(api.getLocations).mockRejectedValue(new Error("Network failed"));

    render(<Locations />);

    await waitFor(
      () => {
        expect(screen.getByRole("heading", { level: 3, name: "Зал" })).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByRole("heading", { level: 3, name: "Велосипеды/Ролики" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Горные лыжи" })).toBeInTheDocument();
    expect(screen.getByText("ул. Брянцева 24")).toBeInTheDocument();
    expect(screen.getByText("п. Токсово «Северный склон»")).toBeInTheDocument();
    expect(screen.getByText("ГК «Снежный»")).toBeInTheDocument();
  });
});
