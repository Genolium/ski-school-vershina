import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Trainers from "../Trainers";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getCoaches: vi.fn(),
}));

describe("Trainers Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!window.ResizeObserver) {
      window.ResizeObserver = class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      } as unknown as typeof ResizeObserver;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders skeleton loader initially while coaches are being fetched", () => {
    vi.mocked(api.getCoaches).mockReturnValue(new Promise(() => {}));

    const { container } = render(<Trainers />);

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders trainer cards, positions, descriptions, and photos from API", async () => {
    const mockCoaches: api.Coach[] = [
      {
        id: 1,
        name: "Владимир Бокулев",
        position: "Главный тренер, мастер спорта",
        description: "Опыт подготовки призеров всероссийских соревнований более 20 лет.",
        photo: "/uploads/bokulev.jpg",
        order: 1,
      },
      {
        id: 2,
        name: "Игорь Фалалеев",
        position: "Тренер юниорской сборной",
        description: "Специалист по слалому и скоростному спуску.",
        photo: "/uploads/falaleev.jpg",
        order: 2,
      },
    ];

    vi.mocked(api.getCoaches).mockResolvedValue(mockCoaches);

    render(<Trainers />);

    // Wait for the 300ms debounce in Trainers.tsx
    await waitFor(
      () => {
        expect(screen.getByText("Владимир Бокулев")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByText("Игорь Фалалеев")).toBeInTheDocument();
    expect(screen.getByText("Главный тренер, мастер спорта")).toBeInTheDocument();
    expect(screen.getByText("Тренер юниорской сборной")).toBeInTheDocument();
    expect(
      screen.getByText("Опыт подготовки призеров всероссийских соревнований более 20 лет.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Специалист по слалому и скоростному спуску.")
    ).toBeInTheDocument();

    // Verify photos
    const photo1 = screen.getByAltText("Владимир Бокулев");
    const photo2 = screen.getByAltText("Игорь Фалалеев");
    expect(photo1).toHaveAttribute("src", expect.stringContaining("bokulev.jpg"));
    expect(photo2).toHaveAttribute("src", expect.stringContaining("falaleev.jpg"));
  });

  it("hides photo on image load error without crashing", async () => {
    const mockCoaches: api.Coach[] = [
      {
        id: 1,
        name: "Иван Тренеров",
        position: "Инструктор",
        description: "Опытный инструктор.",
        photo: "/uploads/broken-image.jpg",
        order: 1,
      },
    ];

    vi.mocked(api.getCoaches).mockResolvedValue(mockCoaches);

    render(<Trainers />);

    await waitFor(
      () => {
        expect(screen.getByText("Иван Тренеров")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    const img = screen.getByAltText("Иван Тренеров");
    expect(img).toBeVisible();

    // Trigger onError
    fireEvent.error(img);
    expect(img.style.display).toBe("none");
  });

  it("renders fallback coaches when API fails", async () => {
    vi.mocked(api.getCoaches).mockRejectedValue(new Error("Database connection lost"));

    render(<Trainers />);

    await waitFor(
      () => {
        expect(
          screen.getByText("Бокулев Владимир Леонидович")
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByText("Фалалеев Игорь Алексеевич")).toBeInTheDocument();
    expect(screen.getByText("Юзова Юлия Игоревна")).toBeInTheDocument();
    expect(screen.getByText("Ганина Василиса Игоревна")).toBeInTheDocument();
  });
});
