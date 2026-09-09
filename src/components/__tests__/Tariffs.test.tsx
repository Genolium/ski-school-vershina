import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tariffs from "../Tariffs";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getTariffs: vi.fn(),
}));

describe("Tariffs Component", () => {
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

  it("shows skeleton loading state while tariffs are being fetched", () => {
    vi.mocked(api.getTariffs).mockReturnValue(new Promise(() => {})); // Never resolves

    const { container } = render(<Tariffs />);

    // Skeleton loaders should be present in the DOM
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders active tariffs, titles, descriptions, prices and feature bullet points from API", async () => {
    const mockTariffs: api.Tariff[] = [
      {
        id: 1,
        title: "Active",
        description: "Для новичков и любителей",
        features: JSON.stringify(["1 тренировка в неделю", "Разминка на батутах", "Теоретический блок"]),
        price: "6000 р/мес.",
        is_active: true,
        order: 0,
      },
      {
        id: 2,
        title: "Standard",
        description: "Для регулярных тренировок",
        features: JSON.stringify(["3 тренировки в неделю", "Участие в соревнованиях", "Видеоанализ"]),
        price: "10000 р/мес.",
        is_active: true,
        order: 1,
      },
    ];

    vi.mocked(api.getTariffs).mockResolvedValue(mockTariffs);

    render(<Tariffs />);

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    expect(screen.getByText("Standard")).toBeInTheDocument();
    expect(screen.getByText("Для новичков и любителей")).toBeInTheDocument();
    expect(screen.getByText("6000 р/мес.")).toBeInTheDocument();
    expect(screen.getByText("10000 р/мес.")).toBeInTheDocument();

    // Feature bullet points
    expect(screen.getByText("1 тренировка в неделю")).toBeInTheDocument();
    expect(screen.getByText("Разминка на батутах")).toBeInTheDocument();
    expect(screen.getByText("Участие в соревнованиях")).toBeInTheDocument();

    // Standard tariff receives 'Хит сезона' badge
    expect(screen.getByText("Хит сезона")).toBeInTheDocument();
  });

  it("clicking 'Выбрать тариф' triggers scroll to #contact-form", async () => {
    const user = userEvent.setup();
    const contactForm = document.createElement("div");
    contactForm.id = "contact-form";
    document.body.appendChild(contactForm);

    const mockTariffs: api.Tariff[] = [
      {
        id: 1,
        title: "Active",
        description: "Для семейного отдыха",
        features: JSON.stringify(["1 тренировка в неделю"]),
        price: "6000 р/мес.",
        is_active: true,
        order: 0,
      },
    ];

    vi.mocked(api.getTariffs).mockResolvedValue(mockTariffs);

    render(<Tariffs />);

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    const selectButtons = screen.getAllByRole("button", {
      name: /Выбрать тариф/i,
    });
    expect(selectButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(selectButtons[0]);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("renders fallback tariffs when API call fails", async () => {
    vi.mocked(api.getTariffs).mockRejectedValue(new Error("API network failure"));

    render(<Tariffs />);

    // Waits for fallback tariffs to be populated
    await waitFor(() => {
      expect(screen.getByText("Standard")).toBeInTheDocument();
    });

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Individual")).toBeInTheDocument();
    expect(screen.getByText("14000 р/мес.")).toBeInTheDocument();
  });
});
