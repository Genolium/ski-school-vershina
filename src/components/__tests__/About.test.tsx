import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import About from "../About";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getAbout: vi.fn(),
  getStats: vi.fn(),
}));

describe("About Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders section heading 'О нас' and Austrian methodology badge", () => {
    vi.mocked(api.getAbout).mockReturnValue(new Promise(() => {})); // Never resolves (loading)
    vi.mocked(api.getStats).mockReturnValue(new Promise(() => {}));

    render(<About />);

    expect(screen.getByRole("heading", { name: /О нас/i })).toBeInTheDocument();
    expect(screen.getByText("Австрийская методика")).toBeInTheDocument();
  });

  it("renders initial/loading state with fallback statistics counters", () => {
    vi.mocked(api.getAbout).mockReturnValue(new Promise(() => {}));
    vi.mocked(api.getStats).mockReturnValue(new Promise(() => {}));

    render(<About />);

    // Fallback stats are displayed initially before or during loading
    expect(screen.getByText("лет работы")).toBeInTheDocument();
    expect(screen.getByText("воспитанников")).toBeInTheDocument();
    expect(screen.getByText("побед в сезоне")).toBeInTheDocument();
    expect(screen.getByText("довольных родителей")).toBeInTheDocument();
  });

  it("successfully renders school story and custom statistics counters from API", async () => {
    vi.mocked(api.getAbout).mockResolvedValue({
      id: 1,
      title: "О нас",
      description: "Уникальная история школы Вершина с индивидуальным подходом.",
      paragraphs: JSON.stringify(["Дополнительный параграф о методике подготовки."]),
    });

    vi.mocked(api.getStats).mockResolvedValue([
      {
        id: 10,
        value: "30",
        suffix: "+",
        label: "опытных тренеров",
        icon_type: "Users",
        order: 1,
      },
      {
        id: 11,
        value: "500",
        suffix: "+",
        label: "выпускников",
        icon_type: "Trophy",
        order: 2,
      },
    ]);

    render(<About />);

    // Wait for the 100ms debounce timer in About.tsx to resolve API calls
    await waitFor(
      () => {
        expect(
          screen.getByText("Уникальная история школы Вершина с индивидуальным подходом.")
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(
      screen.getByText("Дополнительный параграф о методике подготовки.")
    ).toBeInTheDocument();

    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("опытных тренеров")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("выпускников")).toBeInTheDocument();
  });

  it("gracefully falls back to default school story and stats when API fails", async () => {
    vi.mocked(api.getAbout).mockRejectedValue(new Error("Network connection failed"));
    vi.mocked(api.getStats).mockRejectedValue(new Error("Database query failed"));

    render(<About />);

    // Even after API rejection, fallback story and stats are displayed without crash
    await waitFor(
      () => {
        expect(
          screen.getByText(/«Вершина» — с 2001 года мы дарим детям любовь к горам и спорту/i)
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("лет работы")).toBeInTheDocument();
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("воспитанников")).toBeInTheDocument();
  });

  it("renders 3 key values principles: Безопасность, Результат, Команда", () => {
    vi.mocked(api.getAbout).mockReturnValue(new Promise(() => {}));
    vi.mocked(api.getStats).mockReturnValue(new Promise(() => {}));

    render(<About />);

    expect(screen.getByRole("heading", { name: "Безопасность" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Результат" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Команда" })).toBeInTheDocument();

    expect(
      screen.getByText(/Сертифицированная экипировка, проверенные склоны/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Аттестации по австрийской шкале/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Индивидуальное внимание за счет малых групп/i)
    ).toBeInTheDocument();
  });
});
