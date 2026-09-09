import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Schedule from "../Schedule";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getSchedule: vi.fn(),
}));

describe("Schedule Component", () => {
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
    vi.mocked(api.getSchedule).mockReturnValue(new Promise(() => {}));

    const { container } = render(<Schedule />);

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /Расписание тренировок/i })).toBeInTheDocument();
  });

  it("renders schedule groups, days, times, locations, and spots available badge", async () => {
    const mockSchedule: api.ScheduleGroup[] = [
      {
        id: 1,
        group: "Младшая группа «Снежинки»",
        age_range: "4-6 лет",
        days: "Вторник, Четверг",
        time: "15:00 - 16:30",
        location: "Северный склон (Токсово)",
        spots: 3,
        price: "10 000 руб./мес",
        is_active: true,
        order: 1,
      },
      {
        id: 2,
        group: "Юниоры PRO",
        age_range: "10-16 лет",
        days: "Пн, Ср, Пт, Сб",
        time: "17:00 - 19:00",
        location: "ГК «Снежный»",
        spots: 5,
        price: "15 000 руб./мес",
        is_active: true,
        order: 2,
      },
    ];

    vi.mocked(api.getSchedule).mockResolvedValue(mockSchedule);

    render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByText("Младшая группа «Снежинки»")).toBeInTheDocument();
    });

    expect(screen.getByText("Юниоры PRO")).toBeInTheDocument();

    // Age ranges
    expect(screen.getByText("4-6 лет")).toBeInTheDocument();
    expect(screen.getByText("10-16 лет")).toBeInTheDocument();

    // Days & times
    expect(screen.getByText("Вторник, Четверг")).toBeInTheDocument();
    expect(screen.getByText("15:00 - 16:30")).toBeInTheDocument();
    expect(screen.getByText("Пн, Ср, Пт, Сб")).toBeInTheDocument();
    expect(screen.getByText("17:00 - 19:00")).toBeInTheDocument();

    // Locations & prices
    expect(screen.getByText("Северный склон (Токсово)")).toBeInTheDocument();
    expect(screen.getByText("10 000 руб./мес")).toBeInTheDocument();
    expect(screen.getByText("ГК «Снежный»")).toBeInTheDocument();
    expect(screen.getByText("15 000 руб./мес")).toBeInTheDocument();

    // Spots badges
    expect(screen.getByText("3 места")).toBeInTheDocument();
    expect(screen.getByText("5 места")).toBeInTheDocument();
  });

  it("renders CTA buttons and clicking them scrolls to #contact-form", async () => {
    const user = userEvent.setup();
    const contactForm = document.createElement("div");
    contactForm.id = "contact-form";
    document.body.appendChild(contactForm);

    const mockSchedule: api.ScheduleGroup[] = [
      {
        id: 1,
        group: "Группа Старт",
        age_range: "5-7 лет",
        days: "Сб, Вс",
        time: "11:00 - 13:00",
        location: "ул. Брянцева 24",
        spots: 2,
        is_active: true,
        order: 1,
      },
    ];

    vi.mocked(api.getSchedule).mockResolvedValue(mockSchedule);

    render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByText("Группа Старт")).toBeInTheDocument();
    });

    const groupCta = screen.getByRole("button", { name: /Записаться в группу/i });
    await user.click(groupCta);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });

    const generalCta = screen.getByRole("button", { name: /Узнать свободные места/i });
    await user.click(generalCta);
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2);
  });

  it("renders empty state message when schedule data is empty or API fails", async () => {
    vi.mocked(api.getSchedule).mockRejectedValue(new Error("Failed to load schedule"));

    render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByText("Расписание временно недоступно")).toBeInTheDocument();
    });
  });

  it("injects Schema.org JSON-LD sports schedule structured data", async () => {
    const mockSchedule: api.ScheduleGroup[] = [
      {
        id: 1,
        group: "Группа 1",
        age_range: "6-8 лет",
        days: "Пн, Пт",
        time: "14:00 - 15:30",
        location: "Зал",
        spots: 4,
        is_active: true,
        order: 1,
      },
    ];

    vi.mocked(api.getSchedule).mockResolvedValue(mockSchedule);

    const { container } = render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByText("Группа 1")).toBeInTheDocument();
    });

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    const parsedData = JSON.parse(script?.textContent || "{}");
    expect(parsedData["@type"]).toBe("SportsActivityLocation");
    expect(parsedData.offers[0].name).toBe("Группа 1");
  });
});
