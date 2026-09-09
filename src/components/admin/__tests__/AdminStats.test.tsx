import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminStats from "../AdminStats";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/api", () => ({
  adminGetStats: vi.fn(),
  createStat: vi.fn(),
  updateStat: vi.fn(),
  deleteStat: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminStats Component", () => {
  let queryClient: QueryClient;

  const mockStats: api.Statistic[] = [
    {
      id: 1,
      label: "Лет успешной работы",
      value: "10",
      suffix: "+",
      icon_type: "Trophy",
      order: 1,
    },
    {
      id: 2,
      label: "Учеников обучено",
      value: "500",
      suffix: "+",
      icon_type: "Users",
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
        <AdminStats />
      </QueryClientProvider>
    );

  it("renders stats table with value, label, suffix, and order", async () => {
    vi.mocked(api.adminGetStats).mockResolvedValue(mockStats);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Лет успешной работы")).toBeInTheDocument();
      expect(screen.getByText("Учеников обучено")).toBeInTheDocument();
    });

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    const suffixes = screen.getAllByText("+");
    expect(suffixes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders empty state placeholder when no stats exist", async () => {
    vi.mocked(api.adminGetStats).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Статистика не добавлена")).toBeInTheDocument();
    });
  });

  it("displays error state when fetching stats fails", async () => {
    vi.mocked(api.adminGetStats).mockRejectedValue(new Error("Stats API offline"));

    renderComponent();

    await waitFor(
      () => {
        expect(
          screen.getByText(/Ошибка загрузки статистики\. Пожалуйста, обновите страницу\./i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(toast.error).toHaveBeenCalledWith("Ошибка загрузки статистики");
  });

  it("opens create dialog and adds new statistic", async () => {
    vi.mocked(api.adminGetStats).mockResolvedValue(mockStats);
    vi.mocked(api.createStat).mockResolvedValue({
      id: 3,
      label: "Довольных родителей",
      value: "98",
      suffix: "%",
      icon_type: "Trophy",
      order: 3,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Лет успешной работы")).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: /Добавить статистику/i });
    fireEvent.click(addBtn);

    expect(await screen.findByRole("heading", { name: "Добавить статистику" })).toBeInTheDocument();

    const valueInput = screen.getByLabelText(/Значение/i);
    const suffixInput = screen.getByLabelText(/Суффикс/i);
    const labelInput = screen.getByLabelText(/Подпись/i);
    const orderInput = screen.getByLabelText(/Порядок/i);

    fireEvent.change(valueInput, { target: { value: "98" } });
    fireEvent.change(suffixInput, { target: { value: "%" } });
    fireEvent.change(labelInput, { target: { value: "Довольных родителей" } });
    fireEvent.change(orderInput, { target: { value: "3" } });

    const submitBtn = screen.getByRole("button", { name: "Добавить" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createStat).toHaveBeenCalledWith({
        value: "98",
        label: "Довольных родителей",
        suffix: "%",
        icon_type: "Trophy",
        order: 3,
      });
      expect(toast.success).toHaveBeenCalledWith("Статистика добавлена");
    });
  });

  it("opens edit dialog pre-filled and updates statistic", async () => {
    vi.mocked(api.adminGetStats).mockResolvedValue(mockStats);
    vi.mocked(api.updateStat).mockResolvedValue({
      ...mockStats[0],
      value: "12",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Лет успешной работы")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /Редактировать/i });
    fireEvent.click(editButtons[0]);

    expect(await screen.findByRole("heading", { name: "Редактировать статистику" })).toBeInTheDocument();

    const valueInput = screen.getByLabelText(/Значение/i) as HTMLInputElement;
    expect(valueInput.value).toBe("10");

    fireEvent.change(valueInput, { target: { value: "12" } });

    const saveBtn = screen.getByRole("button", { name: "Сохранить" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateStat).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          value: "12",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Статистика обновлена");
    });
  });

  it("deletes statistic with confirmation dialog", async () => {
    vi.mocked(api.adminGetStats).mockResolvedValue(mockStats);
    vi.mocked(api.deleteStat).mockResolvedValue(undefined);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Лет успешной работы")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Удалить" });
    fireEvent.click(deleteButtons[0]);

    expect(await screen.findByText("Удалить статистику?")).toBeInTheDocument();
    expect(screen.getByText("Это действие нельзя отменить.")).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", { name: "Удалить" });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(api.deleteStat).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith("Статистика удалена");
    });
  });

  it("reorders statistics using arrow controls", async () => {
    vi.mocked(api.adminGetStats).mockResolvedValue(mockStats);
    vi.mocked(api.updateStat).mockResolvedValue({} as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Лет успешной работы")).toBeInTheDocument();
    });

    const downButtons = screen.getAllByTitle("Опустить ниже");
    fireEvent.click(downButtons[0]);

    await waitFor(() => {
      expect(api.updateStat).toHaveBeenCalledWith(1, { order: 2 });
      expect(api.updateStat).toHaveBeenCalledWith(2, { order: 1 });
      expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
    });
  });
});
