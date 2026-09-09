import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminTariffs from "../AdminTariffs";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/api", () => ({
  adminGetTariffs: vi.fn(),
  createTariff: vi.fn(),
  updateTariff: vi.fn(),
  deleteTariff: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminTariffs CRUD & Interactive Operations", () => {
  let queryClient: QueryClient;

  const mockTariffs: api.Tariff[] = [
    {
      id: 1,
      title: "Active",
      description: "Для семейного катания",
      features: JSON.stringify(["1 занятие в неделю", "Разминка на склоне"]),
      price: "6 000 ₽/мес.",
      is_active: true,
      order: 1,
    },
    {
      id: 2,
      title: "Pro Sport",
      description: "Спортивная подготовка и участие в соревнованиях",
      features: JSON.stringify(["3 занятия в неделю", "Видеоанализ техники"]),
      price: "16 000 ₽/мес.",
      is_active: false,
      order: 2,
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AdminTariffs />
      </QueryClientProvider>
    );

  it("table renders tariff rows with title, price, active status", async () => {
    vi.mocked(api.adminGetTariffs).mockResolvedValue(mockTariffs);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Pro Sport")).toBeInTheDocument();
    });

    // Verify prices
    expect(screen.getByText("6 000 ₽/мес.")).toBeInTheDocument();
    expect(screen.getByText("16 000 ₽/мес.")).toBeInTheDocument();

    // Verify active status ("Да" for true, "Нет" for false)
    expect(screen.getByText("Да")).toBeInTheDocument();
    expect(screen.getByText("Нет")).toBeInTheDocument();

    // Verify descriptions
    expect(screen.getByText("Для семейного катания")).toBeInTheDocument();
    expect(
      screen.getByText("Спортивная подготовка и участие в соревнованиях")
    ).toBeInTheDocument();
  });

  it("clicking 'Добавить тариф' opens TariffDialog and allows creating a tariff", async () => {
    vi.mocked(api.adminGetTariffs).mockResolvedValue(mockTariffs);
    vi.mocked(api.createTariff).mockResolvedValue({
      id: 3,
      title: "Индивидуальный",
      description: "Персональное занятие",
      features: "[]",
      price: "3 500 ₽/час",
      is_active: true,
      order: 3,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /Добавить тариф/i });
    fireEvent.click(addButton);

    // Dialog title
    expect(await screen.findByRole("heading", { name: "Добавить тариф" })).toBeInTheDocument();

    const titleInput = screen.getByLabelText("Название");
    const priceInput = screen.getByLabelText("Стоимость");
    const descInput = screen.getByLabelText("Описание");

    fireEvent.change(titleInput, { target: { value: "Индивидуальный" } });
    fireEvent.change(priceInput, { target: { value: "3 500 ₽/час" } });
    fireEvent.change(descInput, { target: { value: "Персональное занятие" } });

    // Submit dialog form
    const submitButton = screen.getByRole("button", { name: "Добавить" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createTariff).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Индивидуальный",
          price: "3 500 ₽/час",
          description: "Персональное занятие",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Тариф добавлен");
    });
  });

  it("clicking 'Редактировать' opens TariffDialog pre-filled and updates tariff", async () => {
    vi.mocked(api.adminGetTariffs).mockResolvedValue(mockTariffs);
    vi.mocked(api.updateTariff).mockResolvedValue({
      ...mockTariffs[0],
      price: "7 000 ₽/мес.",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /Редактировать/i });
    fireEvent.click(editButtons[0]);

    // Dialog title
    expect(await screen.findByRole("heading", { name: "Редактировать тариф" })).toBeInTheDocument();

    const priceInput = screen.getByLabelText("Стоимость") as HTMLInputElement;
    expect(priceInput.value).toBe("6 000 ₽/мес.");

    fireEvent.change(priceInput, { target: { value: "7 000 ₽/мес." } });

    const saveButton = screen.getByRole("button", { name: "Сохранить" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.updateTariff).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          price: "7 000 ₽/мес.",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Тариф обновлен");
    });
  });

  it("deleting tariff triggers confirmation AlertDialog and delete mutation", async () => {
    vi.mocked(api.adminGetTariffs).mockResolvedValue(mockTariffs);
    vi.mocked(api.deleteTariff).mockResolvedValue({ success: true } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    // Click delete button for the first tariff
    const deleteButtons = screen.getAllByRole("button", { name: "Удалить" });
    fireEvent.click(deleteButtons[0]);

    // AlertDialog should open
    expect(await screen.findByText("Удалить тариф?")).toBeInTheDocument();
    expect(
      screen.getByText("Это действие нельзя отменить. Тариф будет удален навсегда.")
    ).toBeInTheDocument();

    // Confirm deletion inside the dialog
    const confirmButton = screen.getByRole("button", { name: "Удалить" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.deleteTariff).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith("Тариф удален");
    });
  });

  it("renders empty state placeholder when no tariffs are present", async () => {
    vi.mocked(api.adminGetTariffs).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("Тарифы не найдены. Добавьте первый тариф.")
      ).toBeInTheDocument();
    });
  });

  it("handles reordering tariffs using arrow controls", async () => {
    vi.mocked(api.adminGetTariffs).mockResolvedValue(mockTariffs);
    vi.mocked(api.updateTariff).mockResolvedValue({} as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    // The first item has down arrow enabled
    const downButtons = screen.getAllByTitle("Опустить ниже");
    fireEvent.click(downButtons[0]);

    await waitFor(() => {
      expect(api.updateTariff).toHaveBeenCalledWith(1, { order: 2 });
      expect(api.updateTariff).toHaveBeenCalledWith(2, { order: 1 });
      expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
    });
  });
});
