import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminTrainers from "../AdminTrainers";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/api", () => ({
  adminGetCoaches: vi.fn(),
  createCoach: vi.fn(),
  updateCoach: vi.fn(),
  deleteCoach: vi.fn(),
  uploadPhoto: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminTrainers Component", () => {
  let queryClient: QueryClient;

  const mockCoaches: api.Coach[] = [
    {
      id: 1,
      name: "Бокулев Владимир Леонидович",
      position: "Директор по спорту",
      description: "Грамотный и ответственный руководитель",
      photo: "/uploads/bokulev.jpg",
      order: 1,
    },
    {
      id: 2,
      name: "Фалалеев Игорь Алексеевич",
      position: "Тренер группы PRO",
      description: "Опытный специалист по слалому",
      photo: "",
      order: 2,
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
        <AdminTrainers />
      </QueryClientProvider>
    );

  it("renders coaches table with names, positions, photos and orders", async () => {
    vi.mocked(api.adminGetCoaches).mockResolvedValue(mockCoaches);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Бокулев Владимир Леонидович")).toBeInTheDocument();
      expect(screen.getByText("Фалалеев Игорь Алексеевич")).toBeInTheDocument();
    });

    expect(screen.getByText("Директор по спорту")).toBeInTheDocument();
    expect(screen.getByText("Тренер группы PRO")).toBeInTheDocument();

    // First coach has photo, second has "Нет фото"
    const photoImg = screen.getByAltText("Бокулев Владимир Леонидович");
    expect(photoImg).toHaveAttribute("src", expect.stringContaining("bokulev.jpg"));
    expect(screen.getByText("Нет фото")).toBeInTheDocument();
  });

  it("renders empty state placeholder when no coaches exist", async () => {
    vi.mocked(api.adminGetCoaches).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Тренеры не добавлены")).toBeInTheDocument();
    });
  });

  it("displays error state when loading coaches fails", async () => {
    vi.mocked(api.adminGetCoaches).mockRejectedValue(new Error("Database offline"));

    renderComponent();

    await waitFor(
      () => {
        expect(
          screen.getByText(/Ошибка загрузки тренеров\. Пожалуйста, обновите страницу\./i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(toast.error).toHaveBeenCalledWith("Ошибка загрузки тренеров");
  });

  it("opens Add Coach dialog, validates fields, and creates a coach", async () => {
    vi.mocked(api.adminGetCoaches).mockResolvedValue(mockCoaches);
    vi.mocked(api.createCoach).mockResolvedValue({
      id: 3,
      name: "Юзова Юлия Игоревна",
      position: "Тренер группы STANDARD",
      description: "Высокий уровень профессионализма",
      photo: "",
      order: 3,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Бокулев Владимир Леонидович")).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: /Добавить тренера/i });
    fireEvent.click(addBtn);

    expect(await screen.findByRole("heading", { name: "Добавить тренера" })).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Имя/i);
    const positionInput = screen.getByLabelText(/Позиция/i);
    const descInput = screen.getByLabelText(/Описание/i);
    const orderInput = screen.getByLabelText(/Порядок/i);

    fireEvent.change(nameInput, { target: { value: "Юзова Юлия Игоревна" } });
    fireEvent.change(positionInput, { target: { value: "Тренер группы STANDARD" } });
    fireEvent.change(descInput, { target: { value: "Высокий уровень профессионализма" } });
    fireEvent.change(orderInput, { target: { value: "3" } });

    const submitBtn = screen.getByRole("button", { name: "Добавить" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createCoach).toHaveBeenCalledWith({
        name: "Юзова Юлия Игоревна",
        position: "Тренер группы STANDARD",
        description: "Высокий уровень профессионализма",
        photo: "",
        order: 3,
      });
      expect(toast.success).toHaveBeenCalledWith("Тренер добавлен");
    });
  });

  it("handles photo upload when adding a coach", async () => {
    vi.mocked(api.adminGetCoaches).mockResolvedValue(mockCoaches);
    vi.mocked(api.uploadPhoto).mockResolvedValue({ url: "/uploads/uploaded-photo.jpg" });
    vi.mocked(api.createCoach).mockResolvedValue({
      id: 4,
      name: "Ганина Василиса",
      position: "Инструктор",
      description: "Опытный тренер",
      photo: "/uploads/uploaded-photo.jpg",
      order: 4,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Бокулев Владимир Леонидович")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Добавить тренера/i }));
    await screen.findByRole("heading", { name: "Добавить тренера" });

    fireEvent.change(screen.getByLabelText(/Имя/i), { target: { value: "Ганина Василиса" } });
    fireEvent.change(screen.getByLabelText(/Позиция/i), { target: { value: "Инструктор" } });

    // Select photo file
    const file = new File(["dummy-image-content"], "vasilisa.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByLabelText(/Фото/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitBtn = screen.getByRole("button", { name: "Добавить" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.uploadPhoto).toHaveBeenCalledWith(file);
      expect(api.createCoach).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Ганина Василиса",
          photo: "/uploads/uploaded-photo.jpg",
        })
      );
    });
  });

  it("opens edit dialog pre-filled and updates coach", async () => {
    vi.mocked(api.adminGetCoaches).mockResolvedValue(mockCoaches);
    vi.mocked(api.updateCoach).mockResolvedValue({
      ...mockCoaches[0],
      position: "Главный тренер и директор",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Бокулев Владимир Леонидович")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /Редактировать/i });
    fireEvent.click(editButtons[0]);

    expect(await screen.findByRole("heading", { name: "Редактировать тренера" })).toBeInTheDocument();

    const positionInput = screen.getByLabelText(/Позиция/i) as HTMLInputElement;
    expect(positionInput.value).toBe("Директор по спорту");

    fireEvent.change(positionInput, { target: { value: "Главный тренер и директор" } });

    const saveBtn = screen.getByRole("button", { name: "Сохранить" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateCoach).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          position: "Главный тренер и директор",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Тренер обновлен");
    });
  });

  it("deletes a coach with confirmation dialog", async () => {
    vi.mocked(api.adminGetCoaches).mockResolvedValue(mockCoaches);
    vi.mocked(api.deleteCoach).mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Бокулев Владимир Леонидович")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Удалить" });
    fireEvent.click(deleteButtons[0]);

    // AlertDialog
    expect(await screen.findByText("Удалить тренера?")).toBeInTheDocument();
    expect(
      screen.getByText("Это действие нельзя отменить. Тренер будет удален навсегда.")
    ).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", { name: "Удалить" });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(api.deleteCoach).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith("Тренер удален");
    });
  });

  it("reorders coaches using arrow controls", async () => {
    vi.mocked(api.adminGetCoaches).mockResolvedValue(mockCoaches);
    vi.mocked(api.updateCoach).mockResolvedValue({} as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Бокулев Владимир Леонидович")).toBeInTheDocument();
    });

    const downButtons = screen.getAllByTitle("Опустить ниже");
    fireEvent.click(downButtons[0]);

    await waitFor(() => {
      expect(api.updateCoach).toHaveBeenCalledWith(1, { order: 2 });
      expect(api.updateCoach).toHaveBeenCalledWith(2, { order: 1 });
      expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
    });
  });
});
