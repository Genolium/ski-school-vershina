import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminAbout from "../AdminAbout";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/api", () => ({
  adminGetAbout: vi.fn(),
  updateAbout: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminAbout - Content Management", () => {
  let queryClient: QueryClient;

  const mockAbout: api.AboutContent = {
    id: 1,
    title: "О горнолыжной школе «Вершина»",
    description: "Наша миссия — обучать катанию на лыжах и сноуборде безопасно и с удовольствием.",
    paragraphs: "",
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          retryDelay: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AdminAbout />
      </QueryClientProvider>
    );

  it("displays loading indicator when fetching about content", () => {
    // Return pending promise
    vi.mocked(api.adminGetAbout).mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByText("Загрузка...")).toBeInTheDocument();
  });

  it("displays error message when fetching about content fails", async () => {
    vi.mocked(api.adminGetAbout).mockRejectedValue(new Error("Network failure"));

    renderComponent();

    await waitFor(
      () => {
        expect(
          screen.getByText("Ошибка загрузки информации. Пожалуйста, обновите страницу.")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
    expect(toast.error).toHaveBeenCalledWith("Ошибка загрузки информации");
  });

  it("loads and populates title and description fields from API", async () => {
    vi.mocked(api.adminGetAbout).mockResolvedValue(mockAbout);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "О нас" })).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Заголовок") as HTMLInputElement;
    const descTextarea = screen.getByLabelText("Описание") as HTMLTextAreaElement;

    expect(titleInput.value).toBe("О горнолыжной школе «Вершина»");
    expect(descTextarea.value).toBe(
      "Наша миссия — обучать катанию на лыжах и сноуборде безопасно и с удовольствием."
    );
  });

  it("allows typing new values and submitting form to update about content", async () => {
    vi.mocked(api.adminGetAbout).mockResolvedValue(mockAbout);
    vi.mocked(api.updateAbout).mockResolvedValue({
      id: 1,
      title: "Новый заголовок Вершина 2026",
      description: "Обновленная концепция обучения детей и взрослых.",
      paragraphs: "",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "О нас" })).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Заголовок");
    const descTextarea = screen.getByLabelText("Описание");
    const submitButton = screen.getByRole("button", { name: "Сохранить" });

    fireEvent.change(titleInput, { target: { value: "Новый заголовок Вершина 2026" } });
    fireEvent.change(descTextarea, {
      target: { value: "Обновленная концепция обучения детей и взрослых." },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.updateAbout).toHaveBeenCalledWith(1, {
        title: "Новый заголовок Вершина 2026",
        description: "Обновленная концепция обучения детей и взрослых.",
      });
      expect(toast.success).toHaveBeenCalledWith("Сохранено");
    });
  });

  it("handles update failure and displays error toast", async () => {
    vi.mocked(api.adminGetAbout).mockResolvedValue(mockAbout);
    vi.mocked(api.updateAbout).mockRejectedValue(new Error("Database write error"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "О нас" })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: "Сохранить" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Database write error");
    });
  });
});
