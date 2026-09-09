import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminMedia from "../AdminMedia";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/api", () => ({
  adminGetMedia: vi.fn(),
  createMedia: vi.fn(),
  updateMedia: vi.fn(),
  deleteMedia: vi.fn(),
  uploadPhoto: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminMedia Component", () => {
  let queryClient: QueryClient;

  const mockMedia: api.Media[] = [
    {
      id: 1,
      title: "Фото спуска",
      description: "Тренировка слалома",
      file_path: "/uploads/photo1.jpg",
      media_type: "photo",
      category: "Тренировки",
      event_date: "2026-09-01T00:00:00Z",
      order: 1,
      is_active: true,
      created_at: "2026-09-01T10:00:00Z",
    },
    {
      id: 2,
      title: "Видео соревнований",
      description: "Кубок Вершины",
      file_path: "/uploads/video1.mp4",
      media_type: "video",
      category: "Соревнования",
      event_date: "2026-09-05T00:00:00Z",
      order: 2,
      is_active: false,
      created_at: "2026-09-05T10:00:00Z",
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, retryDelay: 0 },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AdminMedia />
      </QueryClientProvider>
    );

  it("renders media items with photo/video preview, category, date, and active status", async () => {
    vi.mocked(api.adminGetMedia).mockResolvedValue(mockMedia);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Фото спуска")).toBeInTheDocument();
      expect(screen.getByText("Видео соревнований")).toBeInTheDocument();
    });

    // Types
    expect(screen.getByText("Фото")).toBeInTheDocument();
    expect(screen.getByText("Видео")).toBeInTheDocument();

    // Categories
    expect(screen.getByText("Тренировки")).toBeInTheDocument();
    expect(screen.getByText("Соревнования")).toBeInTheDocument();

    // Status
    expect(screen.getByText("Активно")).toBeInTheDocument();
    expect(screen.getByText("Неактивно")).toBeInTheDocument();

    // Photo preview
    const img = screen.getByAltText("Фото спуска");
    expect(img).toHaveAttribute("src", expect.stringContaining("photo1.jpg"));

    // Video preview text
    expect(screen.getByText("Video")).toBeInTheDocument();
  });

  it("renders empty state placeholder when no media items exist", async () => {
    vi.mocked(api.adminGetMedia).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Медиа не добавлено")).toBeInTheDocument();
    });
  });

  it("displays error state when media fetching fails", async () => {
    vi.mocked(api.adminGetMedia).mockRejectedValue(new Error("API network failure"));

    renderComponent();

    await waitFor(
      () => {
        expect(
          screen.getByText(/Ошибка загрузки медиа\. Пожалуйста, обновите страницу\./i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(toast.error).toHaveBeenCalledWith("Ошибка загрузки медиа");
  });

  it("opens Add dialog, handles file upload and creates new media item", async () => {
    vi.mocked(api.adminGetMedia).mockResolvedValue(mockMedia);
    vi.mocked(api.uploadPhoto).mockResolvedValue({ url: "/uploads/camps.jpg" });
    vi.mocked(api.createMedia).mockResolvedValue({
      id: 3,
      title: "Сборы в горах",
      description: "Отработка техники",
      file_path: "/uploads/camps.jpg",
      media_type: "photo",
      category: "Сборы",
      event_date: "2026-09-07",
      order: 3,
      is_active: true,
      created_at: "2026-09-07T10:00:00Z",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Фото спуска")).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: "Добавить" });
    fireEvent.click(addBtn);

    expect(await screen.findByRole("heading", { name: "Добавить медиа" })).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/Название \*/i), {
      target: { value: "Сборы в горах" },
    });
    fireEvent.change(screen.getByLabelText(/Описание/i), {
      target: { value: "Отработка техники" },
    });
    fireEvent.change(screen.getByLabelText(/Категория/i), {
      target: { value: "Сборы" },
    });
    fireEvent.change(screen.getByLabelText(/Дата события/i), {
      target: { value: "2026-09-07" },
    });
    fireEvent.change(screen.getByLabelText(/Порядок/i), {
      target: { value: "3" },
    });

    // Select file
    const file = new File(["dummy-media-data"], "camps.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByLabelText(/Файл/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit dialog form
    const createBtn = screen.getByRole("button", { name: "Создать" });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(api.uploadPhoto).toHaveBeenCalledWith(file);
      expect(api.createMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Сборы в горах",
          description: "Отработка техники",
          file_path: "/uploads/camps.jpg",
          category: "Сборы",
          event_date: "2026-09-07",
          order: 3,
          is_active: true,
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Медиа добавлено");
    });
  });

  it("opens edit dialog pre-filled and updates existing media", async () => {
    vi.mocked(api.adminGetMedia).mockResolvedValue(mockMedia);
    vi.mocked(api.updateMedia).mockResolvedValue({
      ...mockMedia[0],
      title: "Фото спуска в Кировске",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Фото спуска")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /Редактировать/i });
    fireEvent.click(editButtons[0]);

    expect(await screen.findByRole("heading", { name: "Редактировать медиа" })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Название \*/i) as HTMLInputElement;
    expect(titleInput.value).toBe("Фото спуска");

    fireEvent.change(titleInput, { target: { value: "Фото спуска в Кировске" } });

    const saveBtn = screen.getByRole("button", { name: "Сохранить" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateMedia).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: "Фото спуска в Кировске",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Медиа обновлено");
    });
  });

  it("deletes media item with confirmation dialog", async () => {
    vi.mocked(api.adminGetMedia).mockResolvedValue(mockMedia);
    vi.mocked(api.deleteMedia).mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Фото спуска")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Удалить" });
    fireEvent.click(deleteButtons[0]);

    expect(await screen.findByText("Удалить медиа?")).toBeInTheDocument();
    expect(screen.getByText("Это действие нельзя отменить.")).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", { name: "Удалить" });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(api.deleteMedia).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith("Медиа удалено");
    });
  });

  it("reorders media items using arrow controls", async () => {
    vi.mocked(api.adminGetMedia).mockResolvedValue(mockMedia);
    vi.mocked(api.updateMedia).mockResolvedValue({} as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Фото спуска")).toBeInTheDocument();
    });

    const downButtons = screen.getAllByTitle("Опустить ниже");
    fireEvent.click(downButtons[0]);

    await waitFor(() => {
      expect(api.updateMedia).toHaveBeenCalledWith(1, { order: 2 });
      expect(api.updateMedia).toHaveBeenCalledWith(2, { order: 1 });
      expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
    });
  });
});
